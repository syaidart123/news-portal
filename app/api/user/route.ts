import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Tidak terautentikasi" },
        { status: 401 },
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { message: "Token tidak valid" },
        { status: 401 },
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: payload.uid },
      select: { role: true },
    });

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Akses ditolak. Hanya admin." },
        { status: 403 },
      );
    }

    const blockedUsers = await prisma.user.findMany({
      where: { isBlocked: true },
      select: {
        id: true,
        fullName: true,
        email: true,
        birthYear: true,
        role: true,
        isBlocked: true,
        createdAt: true,
        _count: {
          select: {
            bookmarks: true,
            reactions: true,
            failedAttempts: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      users: blockedUsers.map((u) => ({
        uid: u.id,
        fullName: u.fullName,
        email: u.email,
        birthYear: u.birthYear,
        role: u.role,
        isBlocked: u.isBlocked,
        createdAt: u.createdAt.toISOString(),
        _count: u._count,
      })),
    });
  } catch (error) {
    console.error("Get blocked users error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Tidak terautentikasi" },
        { status: 401 },
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { message: "Token tidak valid" },
        { status: 401 },
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: payload.uid },
      select: { role: true, id: true },
    });

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Akses ditolak. Hanya admin." },
        { status: 403 },
      );
    }

    const { userId, isBlocked } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { message: "User ID diperlukan" },
        { status: 400 },
      );
    }

    if (userId === currentUser.id) {
      return NextResponse.json(
        { message: "Tidak dapat mengubah status diri sendiri" },
        { status: 400 },
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 404 },
      );
    }

    if (!isBlocked) {
      await prisma.failedAttempt.deleteMany({
        where: { userId },
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isBlocked,
        failedAttempts: 0 || undefined,
      },
    });

    return NextResponse.json({
      message: isBlocked
        ? "User berhasil diblokir"
        : "User berhasil di-unblock",
      user: {
        uid: updatedUser.id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        isBlocked: updatedUser.isBlocked,
      },
    });
  } catch (error) {
    console.error("Toggle block error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

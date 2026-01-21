import { NextResponse } from "next/server";
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

    const user = await prisma.user.findUnique({
      where: { id: payload.uid },
      select: {
        id: true,
        fullName: true,
        email: true,
        birthYear: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      user: {
        uid: user.id,
        fullName: user.fullName,
        email: user.email,
        birthYear: user.birthYear,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Me error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan" }, { status: 500 });
  }
}

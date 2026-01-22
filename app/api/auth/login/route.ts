import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createToken } from "@/lib/auth";
import { cookies } from "next/headers";

const MAX_FAILED_ATTEMPTS = 15;
const TIME_LIMIT = 5 * 60 * 1000; // 5 menit

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email dan password harus diisi" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        failedAttempts: {
          orderBy: {
            timestamp: "asc",
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Email atau password salah" },
        { status: 401 },
      );
    }

    if (user.isBlocked) {
      return NextResponse.json(
        {
          message:
            "Akun Anda telah diblokir karena terlalu banyak percobaan login yang gagal. Hubungi administrator.",
        },
        { status: 403 },
      );
    }

    const now = Date.now();
    const failedAttempts = user.failedAttempts;
    const totalAttempts = failedAttempts.length;

    if (totalAttempts > 0) {
      const firstAttempt = failedAttempts[0];
      const timeSinceFirstAttempt =
        now - new Date(firstAttempt.timestamp).getTime();

      if (timeSinceFirstAttempt > TIME_LIMIT) {
        await prisma.user.update({
          where: { id: user.id },
          data: { isBlocked: true },
        });

        return NextResponse.json(
          {
            message:
              "Akun Anda telah diblokir karena tidak berhasil login dalam waktu 5 menit. Hubungi administrator.",
          },
          { status: 403 },
        );
      }
    }

    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      await prisma.failedAttempt.create({
        data: {
          userId: user.id,
          timestamp: new Date(),
        },
      });

      const newTotalAttempts = totalAttempts + 1;

      if (newTotalAttempts >= MAX_FAILED_ATTEMPTS) {
        await prisma.user.update({
          where: { id: user.id },
          data: { isBlocked: true },
        });

        return NextResponse.json(
          {
            message:
              "Akun Anda telah diblokir karena sudah 15 kali salah memasukkan password. Hubungi administrator.",
          },
          { status: 403 },
        );
      }

      const remainingAttempts = MAX_FAILED_ATTEMPTS - newTotalAttempts;

      if (remainingAttempts <= 3) {
        return NextResponse.json(
          {
            message: `Email atau password salah. Sisa percobaan: ${remainingAttempts}`,
            remainingAttempts,
            totalAttempts: newTotalAttempts,
          },
          { status: 401 },
        );
      }

      return NextResponse.json(
        {
          message: `Email atau password salah`,
          remainingAttempts,
          totalAttempts: newTotalAttempts,
        },
        { status: 401 },
      );
    }

    const token = await createToken({ uid: user.id, email: user.email });

    const cookieStore = await cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
    });

    return NextResponse.json({
      message: "Login berhasil",
      user: {
        uid: user.id,
        fullName: user.fullName,
        email: user.email,
        birthYear: user.birthYear,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

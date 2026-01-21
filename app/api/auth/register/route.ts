import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  validatePassword,
  validateEmail,
  createToken,
} from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, birthYear, password, repeatPassword } =
      await request.json();

    if (!fullName || !email || !birthYear || !password || !repeatPassword) {
      return NextResponse.json(
        { message: "Semua field harus diisi" },
        { status: 400 },
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { message: "Format email tidak valid" },
        { status: 400 },
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { message: passwordValidation.message },
        { status: 400 },
      );
    }

    if (password !== repeatPassword) {
      return NextResponse.json(
        { message: "Password tidak cocok" },
        { status: 400 },
      );
    }

    const hashedPassword = await hashPassword(password);

    try {
      const newUser = await prisma.user.create({
        data: {
          fullName,
          email: email.toLowerCase(),
          birthYear: parseInt(birthYear),
          password: hashedPassword,
        },
      });

      const token = await createToken({
        uid: newUser.id,
        email: newUser.email,
      });

      const cookieStore = await cookies();
      cookieStore.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
      });

      return NextResponse.json(
        {
          message: "Registrasi berhasil",
          user: {
            uid: newUser.id,
            fullName: newUser.fullName,
            email: newUser.email,
            birthYear: newUser.birthYear,
          },
        },
        { status: 201 },
      );
    } catch (error: any) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { message: "Email sudah terdaftar" },
          { status: 400 },
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

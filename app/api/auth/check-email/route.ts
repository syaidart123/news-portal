import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { available: false, message: "Email diperlukan" },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });

    return NextResponse.json({
      available: !existingUser,
      message: existingUser ? "Email sudah terdaftar" : "Email tersedia",
    });
  } catch (error) {
    console.error("Check email error:", error);
    return NextResponse.json({
      available: true,
      message: "Tidak dapat memverifikasi email",
    });
  }
}

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

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: payload.uid },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bookmarks });
  } catch (error) {
    console.error("Get bookmarks error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const { article } = await request.json();

    const bookmark = await prisma.bookmark.upsert({
      where: {
        userId_articleUrl: {
          userId: payload.uid,
          articleUrl: article.url,
        },
      },
      update: {},
      create: {
        userId: payload.uid,
        articleUrl: article.url,
        articleData: article,
      },
    });

    return NextResponse.json({
      message: "Bookmark berhasil ditambahkan",
      bookmark,
    });
  } catch (error) {
    console.error("Create bookmark error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const articleUrl = searchParams.get("articleUrl");

    if (!articleUrl) {
      return NextResponse.json(
        { message: "Article URL diperlukan" },
        { status: 400 },
      );
    }

    await prisma.bookmark.delete({
      where: {
        userId_articleUrl: {
          userId: payload.uid,
          articleUrl: articleUrl,
        },
      },
    });

    return NextResponse.json({ message: "Bookmark berhasil dihapus" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "Bookmark tidak ditemukan" },
        { status: 404 },
      );
    }
    console.error("Delete bookmark error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReactionType } from "@prisma/client";

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

    const reactions = await prisma.reaction.findMany({
      where: { userId: payload.uid },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reactions });
  } catch (error) {
    console.error("Get reactions error:", error);
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

    const { article, type } = await request.json();

    if (!["up", "down"].includes(type)) {
      return NextResponse.json(
        { message: "Tipe reaction tidak valid" },
        { status: 400 },
      );
    }

    const existingReaction = await prisma.reaction.findUnique({
      where: {
        userId_articleUrl: {
          userId: payload.uid,
          articleUrl: article.url,
        },
      },
    });

    if (existingReaction) {
      if (existingReaction.type === type) {
        await prisma.reaction.delete({
          where: { id: existingReaction.id },
        });
        return NextResponse.json({
          message: "Reaction dihapus",
          action: "deleted",
        });
      } else {
        const updated = await prisma.reaction.update({
          where: { id: existingReaction.id },
          data: { type: type as ReactionType },
        });
        return NextResponse.json({
          message: "Reaction diupdate",
          action: "updated",
          reaction: updated,
        });
      }
    }

    const reaction = await prisma.reaction.create({
      data: {
        userId: payload.uid,
        articleUrl: article.url,
        articleData: article,
        type: type as ReactionType,
      },
    });

    return NextResponse.json({
      message: "Reaction berhasil ditambahkan",
      action: "created",
      reaction,
    });
  } catch (error) {
    console.error("Create reaction error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan" }, { status: 500 });
  }
}

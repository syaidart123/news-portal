import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const articleUrls = searchParams.get("urls");

    if (!articleUrls) {
      return NextResponse.json({ reactions: {} });
    }

    const urls = JSON.parse(articleUrls) as string[];

    const reactions = await prisma.reaction.groupBy({
      by: ["articleUrl", "type"],
      where: {
        articleUrl: { in: urls },
      },
      _count: {
        type: true,
      },
    });

    const reactionCounts: { [url: string]: { up: number; down: number } } = {};

    urls.forEach((url) => {
      reactionCounts[url] = { up: 0, down: 0 };
    });

    reactions.forEach((r) => {
      if (reactionCounts[r.articleUrl]) {
        reactionCounts[r.articleUrl][r.type] = r._count.type;
      }
    });

    return NextResponse.json({ reactions: reactionCounts });
  } catch (error) {
    console.error("Error fetching reaction counts:", error);
    return NextResponse.json({ reactions: {} });
  }
}

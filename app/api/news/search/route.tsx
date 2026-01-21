import { NextRequest, NextResponse } from "next/server";
import { searchNews } from "@/lib/newsapi";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    if (!query) {
      return NextResponse.json(
        { status: "error", message: "Query parameter is required" },
        { status: 400 },
      );
    }

    const data = await searchNews(query, page, pageSize);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: "Failed to search news" },
      { status: 500 },
    );
  }
}

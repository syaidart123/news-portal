import { NextRequest, NextResponse } from "next/server";
import { getNewsByCategory } from "@/lib/newsapi";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "general";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    const data = await getNewsByCategory(category, "us", page, pageSize);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: "Failed to fetch category news" },
      { status: 500 },
    );
  }
}

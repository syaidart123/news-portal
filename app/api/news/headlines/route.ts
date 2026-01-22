import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.NEWS_API_KEY;
const BASE_URL = "https://newsapi.org/v2";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const sources = searchParams.get("sources");
    const category = searchParams.get("category");

    const primarySource = searchParams.get("primarySource");
    const secondarySources = searchParams.get("secondarySources");
    const primaryRatio = parseFloat(searchParams.get("primaryRatio") || "0.7");

    if (primarySource && secondarySources) {
      const primarySize = Math.ceil(pageSize * primaryRatio);
      const secondarySize = pageSize - primarySize;

      const [primaryRes, secondaryRes] = await Promise.all([
        fetch(
          `${BASE_URL}/top-headlines?sources=${primarySource}&page=${page}&pageSize=${primarySize}&apiKey=${API_KEY}`,
          { next: { revalidate: 300 } },
        ),
        fetch(
          `${BASE_URL}/top-headlines?sources=${secondarySources}&page=${page}&pageSize=${secondarySize}&apiKey=${API_KEY}`,
          { next: { revalidate: 300 } },
        ),
      ]);

      const primaryData = await primaryRes.json();
      const secondaryData = await secondaryRes.json();

      const combinedArticles = [
        ...(primaryData.articles || []),
        ...(secondaryData.articles || []),
      ];

      return NextResponse.json({
        status: "ok",
        totalResults: combinedArticles.length,
        articles: combinedArticles,
      });
    }

    let url: string;

    if (sources) {
      url = `${BASE_URL}/top-headlines?sources=${sources}&page=${page}&pageSize=${pageSize}&apiKey=${API_KEY}`;
    } else if (category) {
      url = `${BASE_URL}/top-headlines?country=us&category=${category}&page=${page}&pageSize=${pageSize}&apiKey=${API_KEY}`;
    } else {
      url = `${BASE_URL}/top-headlines?country=us&page=${page}&pageSize=${pageSize}&apiKey=${API_KEY}`;
    }

    const res = await fetch(url, { next: { revalidate: 300 } });
    const data = await res.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Headlines API error:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to fetch headlines" },
      { status: 500 },
    );
  }
}

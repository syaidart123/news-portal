import { NewsAPIResponse } from "@/types";

const API_KEY = process.env.NEWS_API_KEY;
const BASE_URL = "https://newsapi.org/v2";

export async function getTopHeadlines(
  country: string = "us",
  page: number = 1,
  pageSize: number = 10,
): Promise<NewsAPIResponse> {
  const res = await fetch(
    `${BASE_URL}/top-headlines?country=${country}&page=${page}&pageSize=${pageSize}&apiKey=${API_KEY}`,
    { next: { revalidate: 300 } },
  );
  return res.json();
}

export async function getNewsByCategory(
  category: string,
  country: string = "us",
  page: number = 1,
  pageSize: number = 10,
): Promise<NewsAPIResponse> {
  const today = new Date().toISOString().split("T")[0];
  const res = await fetch(
    `${BASE_URL}/top-headlines?country=${country}&category=${category}&from=${today}&page=${page}&pageSize=${pageSize}&apiKey=${API_KEY}`,
    { next: { revalidate: 300 } },
  );
  return res.json();
}

export async function searchNews(
  query: string,
  page: number = 1,
  pageSize: number = 10,
): Promise<NewsAPIResponse> {
  const res = await fetch(
    `${BASE_URL}/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&page=${page}&pageSize=${pageSize}&apiKey=${API_KEY}`,
    { next: { revalidate: 300 } },
  );
  return res.json();
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { Article, NewsAPIResponse } from "@/types";
import { useAuth } from "@/context/AuthContext";
import NewsList from "@/components/NewsList";
import Pagination from "@/components/Pagination";
import ErrorModal from "@/components/ErrorModal";

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [userReactions, setUserReactions] = useState<{
    [url: string]: "up" | "down";
  }>({});
  const [reactionCounts, setReactionCounts] = useState<{
    [url: string]: { up: number; down: number };
  }>({});

  const pageSize = 10;
  const totalPages = Math.ceil(totalResults / pageSize);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/news/headlines?page=${currentPage}&pageSize=${pageSize}`,
      );
      const data: NewsAPIResponse = await res.json();

      if (data.status === "error") {
        setError(data.message || "Terjadi kesalahan saat mengambil berita");
        setShowErrorModal(true);
        return;
      }

      const fetchedArticles = data.articles || [];
      setArticles(fetchedArticles);
      setTotalResults(data.totalResults || 0);

      if (fetchedArticles.length > 0) {
        const urls = fetchedArticles.map((a) => a.url);
        const countsRes = await fetch(
          `/api/news/reactions?urls=${encodeURIComponent(JSON.stringify(urls))}`,
        );
        const countsData = await countsRes.json();
        setReactionCounts(countsData.reactions || {});
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  const fetchUserData = useCallback(async () => {
    if (!isAuthenticated) {
      setBookmarks([]);
      setUserReactions({});
      return;
    }

    try {
      const [bookmarksRes, reactionsRes] = await Promise.all([
        fetch("/api/user/bookmark"),
        fetch("/api/user/reaction"),
      ]);

      if (bookmarksRes.ok) {
        const bookmarksData = await bookmarksRes.json();
        setBookmarks(bookmarksData.bookmarks.map((b: any) => b.articleUrl));
      }

      if (reactionsRes.ok) {
        const reactionsData = await reactionsRes.json();
        const reactionsMap: { [url: string]: "up" | "down" } = {};
        reactionsData.reactions.forEach((r: any) => {
          reactionsMap[r.articleUrl] = r.type;
        });
        setUserReactions(reactionsMap);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRefresh = () => {
    fetchUserData();
    if (articles.length > 0) {
      const urls = articles.map((a) => a.url);
      fetch(
        `/api/news/reactions?urls=${encodeURIComponent(JSON.stringify(urls))}`,
      )
        .then((res) => res.json())
        .then((data) => setReactionCounts(data.reactions || {}))
        .catch(console.error);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🔥 Top Headlines
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Recomendation news articles just for you.
        </p>
      </div>

      <NewsList
        articles={articles}
        loading={loading}
        bookmarks={bookmarks}
        userReactions={userReactions}
        reactionCounts={reactionCounts}
        onRefresh={handleRefresh}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <ErrorModal
        isOpen={showErrorModal}
        message={error || ""}
        onClose={() => setShowErrorModal(false)}
        onRetry={() => {
          setShowErrorModal(false);
          fetchNews();
        }}
      />
    </div>
  );
}

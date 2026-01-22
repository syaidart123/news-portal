"use client";

import { useEffect, useState, useCallback } from "react";
import { Article, NewsAPIResponse } from "@/types";
import { useAuth } from "@/context/AuthContext";
import NewsList from "@/components/NewsList";
import Pagination from "@/components/Pagination";
import ErrorModal from "@/components/ErrorModal";
import {
  getRecommendedSourceIds,
  getRecommendedSourcesString,
} from "@/lib/recomendation";

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
  const [viewMode, setViewMode] = useState<"headlines" | "recommendations">(
    "headlines",
  );
  const [recommendedSourceIds, setRecommendedSourceIds] = useState<string[]>(
    [],
  );
  const [mounted, setMounted] = useState(false);

  const pageSize = 10;
  const totalPages = Math.ceil(totalResults / pageSize);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateRecommendationState = useCallback(() => {
    if (typeof window === "undefined") return;

    const sourceIds = getRecommendedSourceIds();

    setRecommendedSourceIds(sourceIds);

    if (sourceIds.length > 0 && viewMode === "headlines") {
      setViewMode("recommendations");
    } else if (sourceIds.length === 0 && viewMode === "recommendations") {
      setViewMode("headlines");
    }
  }, [viewMode]);

  useEffect(() => {
    if (mounted) {
      updateRecommendationState();
    }
  }, [mounted, updateRecommendationState]);

  const fetchHeadlines = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const url = `/api/news/headlines?page=${currentPage}&pageSize=${pageSize}`;

      const res = await fetch(url);
      const data: NewsAPIResponse = await res.json();

      if (data.status === "error") {
        setError(data.message || "Terjadi kesalahan saat mengambil berita");
        setShowErrorModal(true);
        return;
      }

      setArticles(data.articles || []);
      setTotalResults(data.totalResults || 0);
      await fetchReactionCounts(data.articles || []);
    } catch (err) {
      setError("Terjadi kesalahan jaringan");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  const fetchRecommendations = useCallback(async () => {
    const sourcesString = getRecommendedSourcesString();

    if (!sourcesString) {
      console.log("No recommended sources, fetching regular headlines");
      fetchHeadlines();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = `/api/news/headlines?page=${currentPage}&pageSize=${pageSize}&sources=${encodeURIComponent(sourcesString)}`;
      const res = await fetch(url);
      const data: NewsAPIResponse = await res.json();

      if (data.status === "error") {
        await fetchHeadlines();
        return;
      }

      if (!data.articles || data.articles.length === 0) {
        await fetchHeadlines();
        return;
      }

      setArticles(data.articles || []);
      setTotalResults(data.totalResults || 0);
      await fetchReactionCounts(data.articles || []);
    } catch (err) {
      console.error("Recommendations error:", err);
      await fetchHeadlines();
    } finally {
      setLoading(false);
    }
  }, [currentPage, fetchHeadlines]);

  const fetchReactionCounts = async (articleList: Article[]) => {
    if (articleList.length > 0) {
      const urls = articleList.map((a) => a.url);
      try {
        const countsRes = await fetch(
          `/api/news/reactions?urls=${encodeURIComponent(JSON.stringify(urls))}`,
        );
        const countsData = await countsRes.json();
        setReactionCounts(countsData.reactions || {});
      } catch (err) {
        console.error("Error fetching reaction counts:", err);
      }
    }
  };

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
    if (!mounted) return;

    if (viewMode === "recommendations" && recommendedSourceIds.length > 0) {
      fetchRecommendations();
    } else {
      fetchHeadlines();
    }
  }, [
    mounted,
    viewMode,
    recommendedSourceIds.length,
    currentPage,
    fetchRecommendations,
    fetchHeadlines,
  ]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRefresh = useCallback(() => {
    fetchUserData();
    updateRecommendationState();

    if (articles.length > 0) {
      fetchReactionCounts(articles);
    }
  }, [fetchUserData, updateRecommendationState, articles]);

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🔥</span>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Top Headlines
          </h1>
        </div>
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
          if (viewMode === "recommendations") {
            fetchRecommendations();
          } else {
            fetchHeadlines();
          }
        }}
      />
    </div>
  );
}

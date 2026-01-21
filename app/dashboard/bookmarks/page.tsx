"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import NewsCard from "@/components/NewsCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ArrowLeft, Bookmark } from "lucide-react";

export default function BookmarksPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/bookmark");
      if (res.ok) {
        const data = await res.json();
        setBookmarks(data.bookmarks || []);
      }
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookmarks();
    }
  }, [isAuthenticated, fetchBookmarks]);

  if (authLoading || !isAuthenticated) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <Bookmark className="text-yellow-500" />
          Bookmarks
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Berita yang telah Anda simpan
        </p>
      </div>

      <div>
        <ArrowLeft
          onClick={() => router.back()}
          size={24}
          className="mb-6 cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : bookmarks.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <Bookmark size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Belum ada berita yang disimpan
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookmarks.map((bookmark) => (
            <NewsCard
              key={bookmark.id}
              article={bookmark.articleData}
              isBookmarked={true}
              onBookmarkChange={fetchBookmarks}
            />
          ))}
        </div>
      )}
    </div>
  );
}

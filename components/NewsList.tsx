"use client";

import { Article } from "@/types";
import NewsCard from "./NewsCard";
import LoadingSpinner from "./LoadingSpinner";

interface NewsListProps {
  articles: Article[];
  loading?: boolean;
  bookmarks?: string[];
  userReactions?: { [url: string]: "up" | "down" };
  reactionCounts?: { [url: string]: { up: number; down: number } };
  onRefresh?: () => void;
}

export default function NewsList({
  articles,
  loading = false,
  bookmarks = [],
  userReactions = {},
  reactionCounts = {},
  onRefresh,
}: NewsListProps) {
  if (loading) {
    return <LoadingSpinner />;
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Tidak ada berita ditemukan
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {articles.map((article, index) => (
        <NewsCard
          key={`${article.url}-${index}`}
          article={article}
          isBookmarked={bookmarks.includes(article.url)}
          userReaction={userReactions[article.url] || null}
          reactionCounts={reactionCounts[article.url] || { up: 0, down: 0 }}
          onBookmarkChange={onRefresh}
          onReactionChange={onRefresh}
        />
      ))}
    </div>
  );
}

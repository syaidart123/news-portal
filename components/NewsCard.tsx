"use client";

import { Article } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { Bookmark, ThumbsUp, ThumbsDown, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { addSourceLike, removeSourceLike } from "@/lib/recomendation";

interface NewsCardProps {
  article: Article;
  isBookmarked?: boolean;
  userReaction?: "up" | "down" | null;
  reactionCounts?: { up: number; down: number };
  onBookmarkChange?: () => void;
  onReactionChange?: () => void;
}

export default function NewsCard({
  article,
  isBookmarked = false,
  userReaction = null,
  reactionCounts = { up: 0, down: 0 },
  onBookmarkChange,
  onReactionChange,
}: NewsCardProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [currentReaction, setCurrentReaction] = useState(userReaction);
  const [counts, setCounts] = useState(reactionCounts);
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      if (bookmarked) {
        await fetch(
          `/api/user/bookmark?articleUrl=${encodeURIComponent(article.url)}`,
          {
            method: "DELETE",
          },
        );
      } else {
        await fetch("/api/user/bookmark", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ article }),
        });
      }
      setBookmarked(!bookmarked);
      onBookmarkChange?.();
    } catch (error) {
      console.error("Bookmark error:", error);
    }
    setLoading(false);
  };

  const handleReaction = async (type: "up" | "down") => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      await fetch("/api/user/reaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ article, type }),
      });

      const newCounts = { ...counts };
      const sourceId = article.source?.id;
      const sourceName = article.source?.id;

      if (currentReaction === type) {
        newCounts[type]--;
        setCurrentReaction(null);

        if (type === "up" && sourceId && sourceName) {
          removeSourceLike(sourceId);
          console.log(`👎 Removed like from ${sourceName} (${sourceId})`);
        }
      } else {
        if (currentReaction) {
          newCounts[currentReaction]--;

          if (currentReaction === "up" && sourceId && sourceName) {
            removeSourceLike(sourceId);
          }
        }

        newCounts[type]++;
        setCurrentReaction(type);

        if (type === "up" && sourceId && sourceName) {
          addSourceLike(sourceId, sourceName);
          console.log(`👍 Added like to ${sourceName} (${sourceId})`);
        }
      }

      setCounts(newCounts);
      onReactionChange?.();
    } catch (error) {
      console.error("Reaction error:", error);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md transition-all duration-300 ease-out transform hover:scale-[1.02] hover:shadow-lg hover:shadow-rose-500/50">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-64 md:shrink-0">
          <div className="relative h-48 md:h-full w-full">
            {article.urlToImage ? (
              <Image
                src={article.urlToImage}
                alt={article.title}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="h-full w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-gray-400 text-4xl">📰</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
              {article.source.name}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(article.publishedAt)}
            </span>
          </div>

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
              {article.title}
              <ExternalLink
                size={14}
                className="inline ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </h2>
          </a>

          {article.author && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Oleh: {article.author}
            </p>
          )}

          {article.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
              {article.description}
            </p>
          )}

          {article.content && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
              {article.content}
            </p>
          )}

          <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700 cursor-pointer">
            <button
              onClick={handleBookmark}
              disabled={loading}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                bookmarked
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              <Bookmark size={16} fill={bookmarked ? "currentColor" : "none"} />
              {bookmarked ? "Tersimpan" : "Simpan"}
            </button>

            <button
              onClick={() => handleReaction("up")}
              disabled={loading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                currentReaction === "up"
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              <ThumbsUp
                size={16}
                fill={currentReaction === "up" ? "currentColor" : "none"}
              />
              <span
                className={
                  counts.up > 0 ? "text-green-600 dark:text-green-400" : ""
                }
              >
                {counts.up}
              </span>
            </button>

            <button
              onClick={() => handleReaction("down")}
              disabled={loading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                currentReaction === "down"
                  ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              <ThumbsDown
                size={16}
                fill={currentReaction === "down" ? "currentColor" : "none"}
              />
              <span
                className={
                  counts.down > 0 ? "text-red-600 dark:text-red-400" : ""
                }
              >
                {counts.down}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

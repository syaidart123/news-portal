"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import NewsCard from "@/components/NewsCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ThumbsUp, ThumbsDown, ArrowLeft } from "lucide-react";

export default function ReactionsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [reactions, setReactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "up" | "down">("all");

  const fetchReactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/reaction");
      if (res.ok) {
        const data = await res.json();
        setReactions(data.reactions || []);
      }
    } catch (error) {
      console.error("Error fetching reactions:", error);
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
      fetchReactions();
    }
  }, [isAuthenticated, fetchReactions]);

  const filteredReactions = reactions.filter((r) => {
    if (filter === "all") return true;
    return r.type === filter;
  });

  const upCount = reactions.filter((r) => r.type === "up").length;
  const downCount = reactions.filter((r) => r.type === "down").length;

  if (authLoading || !isAuthenticated) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <ThumbsUp className="text-purple-500" />
          Reactions
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Berita yang telah Anda beri reaction
        </p>
      </div>
      <div>
        <ArrowLeft
          onClick={() => router.back()}
          size={24}
          className="mb-6 cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        />
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          }`}
        >
          Semua ({reactions.length})
        </button>
        <button
          onClick={() => setFilter("up")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === "up"
              ? "bg-green-600 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          }`}
        >
          <ThumbsUp size={18} />
          Like ({upCount})
        </button>
        <button
          onClick={() => setFilter("down")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === "down"
              ? "bg-red-600 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          }`}
        >
          <ThumbsDown size={18} />
          Dislike ({downCount})
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filteredReactions.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <ThumbsUp size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {filter === "all"
              ? "Belum ada reaction"
              : `Belum ada ${filter === "up" ? "like" : "dislike"}`}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredReactions.map((reaction) => (
            <NewsCard
              key={reaction.id}
              article={reaction.articleData}
              userReaction={reaction.type}
              reactionCounts={reaction.articleData.reactionCounts}
              onReactionChange={fetchReactions}
            />
          ))}
        </div>
      )}
    </div>
  );
}

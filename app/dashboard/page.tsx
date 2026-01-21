"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { User, Bookmark, ThumbsUp, Newspaper } from "lucide-react";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Selamat datang, {user?.fullName}!
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <User size={32} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {user?.fullName}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Newspaper
                size={24}
                className="text-green-600 dark:text-green-400"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Jelajahi Berita
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Lihat berita terbaru
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/bookmarks"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bookmark
                size={24}
                className="text-yellow-600 dark:text-yellow-400"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Bookmarks
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Berita yang disimpan
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/reactions"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <ThumbsUp
                size={24}
                className="text-purple-600 dark:text-purple-400"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Reactions
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Like & Dislike
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

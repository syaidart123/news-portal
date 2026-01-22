"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  User,
  Bookmark,
  ThumbsUp,
  Newspaper,
  Shield,
  Lock,
  Unlock,
  RefreshCw,
  AlertTriangle,
  Check,
} from "lucide-react";

interface BlockedUser {
  uid: string;
  fullName: string;
  email: string;
  birthYear: number;
  role: string;
  isBlocked: boolean;
  createdAt: string;
  _count: {
    bookmarks: number;
    reactions: number;
    failedAttempts: number;
  };
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const fetchBlockedUsers = useCallback(async () => {
    if (!isAdmin) return;

    setLoadingUsers(true);
    try {
      const res = await fetch("/api/user");
      if (res.ok) {
        const data = await res.json();
        setBlockedUsers(data.users || []);
      } else {
        console.error("Failed to fetch blocked users");
      }
    } catch (error) {
      console.error("Error fetching blocked users:", error);
    } finally {
      setLoadingUsers(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchBlockedUsers();
    }
  }, [isAdmin, fetchBlockedUsers]);

  const handleToggleBlock = async (targetUser: BlockedUser) => {
    setActionLoading(targetUser.uid);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: targetUser.uid,
          isBlocked: false,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal mengubah status user");
      }

      setSuccess(data.message);
      fetchBlockedUsers();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              isAdmin
                ? "bg-purple-100 dark:bg-purple-900"
                : "bg-blue-100 dark:bg-blue-900"
            }`}
          >
            {isAdmin ? (
              <Shield
                size={32}
                className="text-purple-600 dark:text-purple-400"
              />
            ) : (
              <User size={32} className="text-blue-600 dark:text-blue-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {user?.fullName}
              </h2>
              {isAdmin && (
                <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full">
                  ADMIN
                </span>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-red-50 dark:bg-red-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="text-red-600 dark:text-red-400" size={20} />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    User Terblokir
                  </h3>
                  <span className="px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-full">
                    {blockedUsers.length}
                  </span>
                </div>
                <button
                  onClick={fetchBlockedUsers}
                  disabled={loadingUsers}
                  className="p-2 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                  title="Refresh"
                >
                  <RefreshCw
                    size={16}
                    className={loadingUsers ? "animate-spin" : ""}
                  />
                </button>
              </div>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
                <AlertTriangle size={16} />
                {error}
              </div>
            )}

            {success && (
              <div className="mx-6 mt-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg flex items-center gap-2 text-green-700 dark:text-green-400 text-sm">
                <Check size={16} />
                {success}
              </div>
            )}

            {loadingUsers ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
              </div>
            ) : blockedUsers.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Lock size={32} className="mx-auto mb-2 text-gray-400" />
                <p>Tidak ada user yang diblokir</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Failed Attempts
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Terdaftar
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {blockedUsers.map((u) => (
                      <tr
                        key={u.uid}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {u.fullName}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {u.email}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              Lahir: {u.birthYear}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              u.role === "ADMIN"
                                ? "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                              <AlertTriangle size={14} />
                              {u._count.failedAttempts} attempts
                            </span>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Bookmarks: {u._count.bookmarks} | Reactions:{" "}
                              {u._count.reactions}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(u.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {u.uid !== user?.uid ? (
                              <button
                                onClick={() =>
                                  handleToggleBlock({
                                    ...u,
                                    isBlocked: false,
                                  })
                                }
                                disabled={actionLoading === u.uid}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 transition-colors text-sm font-medium"
                              >
                                {actionLoading === u.uid ? (
                                  <RefreshCw
                                    size={14}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Unlock size={14} />
                                )}
                                Unblock
                              </button>
                            ) : (
                              <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                                (Anda)
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group border border-gray-200 dark:border-gray-700"
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
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group border border-gray-200 dark:border-gray-700"
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
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group border border-gray-200 dark:border-gray-700"
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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import SearchBar from "./SearchBar";
import ThemeToggle from "./ThemeToggle";
import { Menu, X, User, LogOut, Bookmark, ThumbsUp } from "lucide-react";
import { useState } from "react";

const categories = [
  { name: "Business", slug: "business" },
  { name: "Entertainment", slug: "entertainment" },
  { name: "Sports", slug: "sports" },
  { name: "General", slug: "general" },
  { name: "Health", slug: "health" },
  { name: "Science", slug: "science" },
  { name: "Technology", slug: "technology" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              NEWS
            </span>
          </Link>

          <div
            className={`${pathname.startsWith("/dashboard") ? "hidden" : "hidden lg:flex"} items-center`}
          >
            <Link
              href="/"
              className={`px-3 mx-2 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                pathname === "/"
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Home
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className={`px-3 mx-1 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  pathname === `/category/${cat.slug}`
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <div
              className={`${pathname.startsWith("/dashboard") ? "hidden md:hidden" : "hidden md:block"}`}
            >
              <SearchBar />
            </div>
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-full bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300"
                >
                  <User size={20} />
                  <span className="hidden md:inline">
                    {user?.fullName?.split(" ")[0]}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50">
                    <Link
                      href="/dashboard"
                      className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User size={16} className="mr-2" />
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/bookmarks"
                      className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Bookmark size={16} className="mr-2" />
                      Bookmarks
                    </Link>
                    <Link
                      href="/dashboard/reactions"
                      className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <ThumbsUp size={16} className="mr-2" />
                      Reactions
                    </Link>
                    <hr className="my-2 border-gray-200 dark:border-gray-700" />
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-md"
                >
                  Register
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-700 dark:text-gray-300"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="mb-4">
              <SearchBar />
            </div>
            <div className="space-y-2">
              <Link
                href="/"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Beranda
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

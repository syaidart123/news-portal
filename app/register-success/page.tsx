"use client";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RegisterSuccessPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle
              size={48}
              className="text-green-600 dark:text-green-400"
            />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Pendaftaran Berhasil!
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Akun Anda telah berhasil dibuat. Silakan login untuk mulai menggunakan
          semua fitur News Portal.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition-colors"
        >
          Masuk ke Dashboard
        </Link>
      </div>
    </div>
  );
}

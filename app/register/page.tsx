"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, UserPlus, Check, X } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    birthYear: "",
    password: "",
    repeatPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const passwordValidation = {
    minLength: formData.password.length >= 12,
    hasUppercase: /[A-Z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
    hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    passwordsMatch:
      formData.password === formData.repeatPassword &&
      formData.repeatPassword !== "",
  };

  const isPasswordValid = Object.values(passwordValidation)
    .slice(0, 4)
    .every(Boolean);

  useEffect(() => {
    const checkEmail = async () => {
      if (
        !formData.email ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      ) {
        setEmailAvailable(null);
        return;
      }

      setCheckingEmail(true);
      try {
        const res = await fetch(
          `/api/auth/check-email?email=${encodeURIComponent(formData.email)}`,
        );
        const data = await res.json();
        setEmailAvailable(data.available);
      } catch {
        setEmailAvailable(null);
      }
      setCheckingEmail(false);
    };

    const debounce = setTimeout(checkEmail, 500);
    return () => clearTimeout(debounce);
  }, [formData.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isPasswordValid) {
      setError("Password tidak memenuhi persyaratan");
      return;
    }

    if (!passwordValidation.passwordsMatch) {
      setError("Password tidak cocok");
      return;
    }

    if (emailAvailable === false) {
      setError("Email sudah terdaftar");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        await refreshUser();
        router.push("/dashboard");
      } else {
        setError(data.message || "Terjadi kesalahan");
      }
    } catch {
      setError("Terjadi kesalahan jaringan");
    }

    setLoading(false);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-4 md:p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Buat Akun
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Daftar untuk menikmati semua fitur
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="Masukan Nama"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 pr-10 ${
                  emailAvailable === false
                    ? "border-red-500"
                    : emailAvailable === true
                      ? "border-green-500"
                      : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="Masukan Email"
                required
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {checkingEmail && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-rose-600" />
                )}
                {!checkingEmail && emailAvailable === true && (
                  <Check size={20} className="text-green-500" />
                )}
                {!checkingEmail && emailAvailable === false && (
                  <X size={20} className="text-red-500" />
                )}
              </div>
            </div>
            {emailAvailable === false && (
              <p className="mt-1 text-sm text-red-500">Email sudah terdaftar</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tahun Lahir
            </label>
            <select
              value={formData.birthYear}
              onChange={(e) =>
                setFormData({ ...formData, birthYear: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              required
            >
              <option value="">Pilih tahun</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 pr-12"
                placeholder="••••••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="mt-2 space-y-1">
              {[
                {
                  check: passwordValidation.minLength,
                  text: "Minimal 12 karakter",
                },
                {
                  check: passwordValidation.hasUppercase,
                  text: "Minimal 1 huruf kapital",
                },
                {
                  check: passwordValidation.hasNumber,
                  text: "Minimal 1 angka",
                },
                {
                  check: passwordValidation.hasSymbol,
                  text: "Minimal 1 simbol (!@#$%^&*...)",
                },
              ].map((req, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {req.check ? (
                    <Check size={14} className="text-green-500" />
                  ) : (
                    <X size={14} className="text-gray-400" />
                  )}
                  <span
                    className={
                      req.check
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-500"
                    }
                  >
                    {req.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ulangi Password
            </label>
            <div className="relative">
              <input
                type={showRepeatPassword ? "text" : "password"}
                value={formData.repeatPassword}
                onChange={(e) =>
                  setFormData({ ...formData, repeatPassword: e.target.value })
                }
                className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 pr-12 ${
                  formData.repeatPassword && !passwordValidation.passwordsMatch
                    ? "border-red-500"
                    : passwordValidation.passwordsMatch
                      ? "border-green-500"
                      : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="••••••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showRepeatPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formData.repeatPassword && !passwordValidation.passwordsMatch && (
              <p className="mt-1 text-sm text-red-500">Password tidak cocok</p>
            )}
          </div>

          <button
            type="submit"
            disabled={
              loading ||
              !isPasswordValid ||
              !passwordValidation.passwordsMatch ||
              emailAvailable === false
            }
            className="w-full flex cursor-pointer items-center justify-center gap-2 px-4 py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <>
                <UserPlus size={20} />
                Daftar
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="text-rose-600 hover:underline font-medium"
          >
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}

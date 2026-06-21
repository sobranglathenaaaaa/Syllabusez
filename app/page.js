"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import puplogo from "@/lib/image/puplogo.png";
import pupsj from "@/lib/image/pupsj.png";

export default function Home() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickLogin = async (role) => {
    try {
      const res = await fetch("/api/auth/quick-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Quick login failed:", data.error);
        return;
      }

      window.location.href = data.redirectTo;
    } catch (e) {
      console.error("Quick login error:", e);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoading(true);

    const emailInput = document.getElementById("email").value.trim().toLowerCase();
    const passwordInput = document.getElementById("password").value;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, password: passwordInput }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.error || "Login failed. Please try again.");
        return;
      }

      window.location.href = data.redirectTo;
    } catch (err) {
      console.error("Login error:", err);
      setLoginError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Pane - Visual / Branding */}
      <div className="hidden lg:w-3/5 bg-red-900 lg:block relative overflow-hidden">
        {/* Background Image / Illustration */}
        <div className="absolute inset-0 z-0">
          <Image
            src={pupsj}
            alt="PUP San Juan Campus"
            fill
            className="object-cover opacity-30 mix-blend-multiply"
          />
        </div>

        {/* Overlay Text or additional branding */}
        <div className="relative z-10 flex h-full flex-col justify-center px-16 text-white bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <div className="mb-6 flex items-center gap-4">
            <div className="rounded-full bg-white/10 p-2 backdrop-blur-sm">
              <Image src={puplogo} alt="PUP Logo" width={72} height={72} className="drop-shadow-lg" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">PUP San Juan</h1>
          </div>
          <h2 className="text-5xl font-extrabold leading-tight tracking-tight drop-shadow-md">
            Syllabus Management Portal
          </h2>
          <p className="mt-6 text-xl text-gray-200 max-w-lg font-light leading-relaxed drop-shadow-sm">
            Streamline curriculum planning and academic administration with our integrated platform designed for excellence.
          </p>
        </div>
      </div>

      {/* Right Pane - Auth Form */}
      <div className="flex w-full flex-col justify-center px-8 sm:px-16 lg:w-2/5 lg:px-12 xl:px-24 relative bg-gray-50">
        <div className="mx-auto w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100">
          {/* Mobile Logo visible only when Left Pane is hidden */}
          <div className="mb-8 flex flex-col items-center justify-center lg:hidden text-center">
            <Image src={puplogo} alt="PUP Logo" width={80} height={80} className="mb-4 drop-shadow-md" />
            <h1 className="text-2xl font-bold text-gray-900">PUP San Juan</h1>
            <p className="text-sm text-gray-500">Syllabus Management Portal</p>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Please sign in to your account
            </p>
          </div>

          <div className="mt-8">
            <form className="space-y-6" onSubmit={handleFormSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required

                    className="block w-full appearance-none rounded-xl border border-gray-300 px-4 py-3 placeholder-gray-400 shadow-sm transition-all focus:border-red-800 focus:outline-none focus:ring-2 focus:ring-red-800/20 sm:text-sm text-gray-900"
                    placeholder="Enter your email"
                    suppressHydrationWarning
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Password
                </label>
                <div className="mt-2 relative rounded-xl shadow-sm">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required

                    className="block w-full appearance-none rounded-xl border border-gray-300 pl-4 pr-12 py-3 placeholder-gray-400 shadow-sm transition-all focus:border-red-800 focus:outline-none focus:ring-2 focus:ring-red-800/20 sm:text-sm text-gray-900"
                    placeholder="Enter your password"
                    suppressHydrationWarning
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    suppressHydrationWarning
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-red-800 focus:ring-red-800 transition-colors cursor-pointer"
                    suppressHydrationWarning
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-700 cursor-pointer select-none"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-red-800 hover:text-red-700 transition-colors"
                  >
                    Forgot your password?
                  </a>
                </div>
              </div>

              {loginError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {loginError}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-xl bg-red-800 py-3 px-4 text-sm font-semibold text-white shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-800 focus:ring-offset-2 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                  suppressHydrationWarning
                >
                  {isLoading ? "Signing in…" : "Sign in"}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm">
              <p className="text-gray-600">
                <span className="font-bold text-gray-900">New to the portal?</span> Contact your administrator for access
              </p>
            </div>

            {/* Temporary Quick Access */}
            <div className="mt-6 border border-dashed border-red-300 bg-red-50 p-4 rounded-xl text-center">
              <p className="text-xs font-semibold text-red-800 uppercase tracking-wider mb-3">Temporary Quick Access</p>
              <div className="flex justify-center gap-4 text-sm">
                <button type="button" onClick={() => handleQuickLogin('admin')} className="font-medium text-red-700 hover:text-red-900 hover:underline transition-colors" suppressHydrationWarning>Admin</button>
                <span className="text-red-300">|</span>
                <button type="button" onClick={() => handleQuickLogin('instructor')} className="font-medium text-red-700 hover:text-red-900 hover:underline transition-colors" suppressHydrationWarning>Instructor</button>
                <span className="text-red-300">|</span>
                <button type="button" onClick={() => handleQuickLogin('student')} className="font-medium text-red-700 hover:text-red-900 hover:underline transition-colors" suppressHydrationWarning>Student</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

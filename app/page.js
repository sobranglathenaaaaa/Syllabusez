"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import puplogo from "@/lib/image/puplogo.png";
import pupsj from "@/lib/image/pupsj.png";

export default function Home() {
  const [showPassword, setShowPassword] = useState(false);

  const handleQuickLogin = async (role) => {
    try {
      // Trigger seed to ensure default profiles exist
      await fetch("/api/seed", { method: "POST" });

      const roleProfiles = {
        admin: { id: "a1a1a1a1-1111-4111-a111-111111111111", email: "admin@pup.edu.ph", name: "Dr. Danilo T. dela Cruz" },
        instructor: { id: "i2i2i2i2-2222-4222-i222-222222222222", email: "instructor@pup.edu.ph", name: "Prof. Maria Elizabeth C. Santos" },
        student: { id: "s3s3s3s3-3333-4333-s333-333333333333", email: "student@pup.edu.ph", name: "Juan G. Gomez" }
      };

      const user = roleProfiles[role];
      if (user) {
        document.cookie = `session_role=${role}; path=/; max-age=3600`;
        document.cookie = `session_user_id=${user.id}; path=/; max-age=3600`;
        document.cookie = `session_email=${user.email}; path=/; max-age=3600`;
        document.cookie = `session_name=${encodeURIComponent(user.name)}; path=/; max-age=3600`;
      }

      window.location.href = `/${role}`;
    } catch (e) {
      console.error("Login failed", e);
      // Fallback
      document.cookie = `session_role=${role}; path=/; max-age=3600`;
      window.location.href = `/${role}`;
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const emailInput = document.getElementById("email").value.trim().toLowerCase();
    const passwordInput = document.getElementById("password").value;

    let role = "student";
    if (emailInput.includes("admin")) {
      role = "admin";
    } else if (emailInput.includes("instructor")) {
      role = "instructor";
    }

    try {
      // Lookup email in the database to get their actual profile
      const res = await fetch(`/api/users?search=${encodeURIComponent(emailInput)}`);
      const data = await res.json();
      const matchedUser = data.users?.find(u => u.email.toLowerCase() === emailInput);

      if (matchedUser) {
        // Log in as the exact user matched in database!
        document.cookie = `session_role=${matchedUser.role}; path=/; max-age=3600`;
        document.cookie = `session_user_id=${matchedUser.id}; path=/; max-age=3600`;
        document.cookie = `session_email=${matchedUser.email}; path=/; max-age=3600`;
        document.cookie = `session_name=${encodeURIComponent(matchedUser.full_name || "PUP User")}; path=/; max-age=3600`;
        window.location.href = `/${matchedUser.role}`;
      } else {
        // Auto-register this as a custom account (developer convenience flow)
        const nameFormatted = emailInput.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, c => c.toUpperCase());
        const createRes = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: emailInput,
            full_name: nameFormatted,
            role: role,
            password: passwordInput !== "••••••••" ? passwordInput : null
          })
        });

        if (createRes.ok) {
          const createData = await createRes.json();
          // Log in as the newly created user
          document.cookie = `session_role=${role}; path=/; max-age=3600`;
          document.cookie = `session_user_id=${createData.id}; path=/; max-age=3600`;
          document.cookie = `session_email=${emailInput}; path=/; max-age=3600`;
          document.cookie = `session_name=${encodeURIComponent(nameFormatted)}; path=/; max-age=3600`;
          window.location.href = `/${role}`;
        } else {
          await handleQuickLogin(role);
        }
      }
    } catch (err) {
      console.error("Custom DB login error, falling back:", err);
      await handleQuickLogin(role);
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
                    defaultValue="instructor@pup.edu.ph"
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
                    defaultValue="••••••••"
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

              <div className="pt-2">
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-xl bg-red-800 py-3 px-4 text-sm font-semibold text-white shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-800 focus:ring-offset-2 transition-all active:scale-[0.98]"
                  suppressHydrationWarning
                >
                  Sign in
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

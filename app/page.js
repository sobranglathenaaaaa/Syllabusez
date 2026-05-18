"use client";

import Image from "next/image";
import Link from "next/link";
import puplogo from "@/lib/image/puplogo.png";
import pupsj from "@/lib/image/pupsj.png";

export default function Home() {
  const handleQuickLogin = (role) => {
    document.cookie = `session_role=${role}; path=/; max-age=3600`;
    window.location.href = `/${role}`;
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
            <form className="space-y-6" action="#" method="POST">
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
                    className="block w-full appearance-none rounded-xl border border-gray-300 px-4 py-3 placeholder-gray-400 shadow-sm transition-all focus:border-red-800 focus:outline-none focus:ring-2 focus:ring-red-800/20 sm:text-sm"
                    placeholder="Enter your email"
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
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="block w-full appearance-none rounded-xl border border-gray-300 px-4 py-3 placeholder-gray-400 shadow-sm transition-all focus:border-red-800 focus:outline-none focus:ring-2 focus:ring-red-800/20 sm:text-sm"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-red-800 focus:ring-red-800 transition-colors cursor-pointer"
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
                <button type="button" onClick={() => handleQuickLogin('admin')} className="font-medium text-red-700 hover:text-red-900 hover:underline transition-colors">Admin</button>
                <span className="text-red-300">|</span>
                <button type="button" onClick={() => handleQuickLogin('instructor')} className="font-medium text-red-700 hover:text-red-900 hover:underline transition-colors">Instructor</button>
                <span className="text-red-300">|</span>
                <button type="button" onClick={() => handleQuickLogin('student')} className="font-medium text-red-700 hover:text-red-900 hover:underline transition-colors">Student</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

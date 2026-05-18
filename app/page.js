import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center gap-4 px-6 py-12">
      <h1 className="text-3xl font-bold">School Syllabus Management System</h1>
      <p className="text-zinc-600">Built with Next.js App Router, MariaDB, and Tailwind CSS.</p>
      <div className="flex flex-wrap gap-3">
        <Link className="rounded bg-zinc-900 px-4 py-2 text-white" href="/login">
          Login
        </Link>
        <Link className="rounded border border-zinc-300 px-4 py-2" href="/register">
          Register
        </Link>
        <Link className="rounded border border-zinc-300 px-4 py-2" href="/instructor">
          Instructor Dashboard
        </Link>
      </div>
    </main>
  );
}

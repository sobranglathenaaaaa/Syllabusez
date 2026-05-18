import Link from "next/link";

export function DashboardShell({ title, role, children }) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between rounded border border-zinc-200 bg-white px-4 py-3">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-zinc-500">Signed in as {role}</p>
        </div>
        <Link href="/" className="text-sm text-zinc-600 underline">
          Home
        </Link>
      </div>
      {children}
    </main>
  );
}

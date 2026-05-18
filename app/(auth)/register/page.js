import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-4 px-6">
      <h1 className="text-2xl font-semibold">Register</h1>
      <p className="rounded border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
        Registration is handled through the same flow as login for this implementation. Continue to login to create your profile.
      </p>
      <Link className="rounded bg-zinc-900 p-2 text-center text-white" href="/login">
        Go to Login
      </Link>
    </main>
  );
}

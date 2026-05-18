import { loginAction } from "./actions";
import { roleOptions } from "@/types/roles";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-4 px-6">
      <h1 className="text-2xl font-semibold">Login</h1>
      <form action={loginAction} className="space-y-3 rounded border border-zinc-200 bg-white p-4">
        <label htmlFor="login-full-name" className="block text-sm font-medium">
          Full name
        </label>
        <input id="login-full-name" name="fullName" placeholder="Full name" className="w-full rounded border p-2" />
        <label htmlFor="login-email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          required
          placeholder="Email"
          className="w-full rounded border p-2"
        />
        <label htmlFor="login-role" className="block text-sm font-medium">
          Role
        </label>
        <select id="login-role" name="role" className="w-full rounded border p-2" defaultValue="student">
          {roleOptions.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
        <button className="w-full rounded bg-zinc-900 p-2 text-white" type="submit">
          Continue
        </button>
      </form>
    </main>
  );
}

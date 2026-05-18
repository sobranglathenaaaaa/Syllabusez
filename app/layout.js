import "./globals.css";

export const metadata = {
  title: "School Syllabus Management System",
  description: "Role-based syllabus management for admins, instructors, and students.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-zinc-50 text-zinc-900">{children}</body>
    </html>
  );
}

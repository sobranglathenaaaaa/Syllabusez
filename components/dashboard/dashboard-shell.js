import Link from "next/link";
import Image from "next/image";
import puplogo from "@/lib/image/puplogo.png";

export function DashboardShell({ title, role, children }) {
  return (
    <div className="flex h-screen bg-[#F2F0EF] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#800000] text-white flex-shrink-0 hidden md:flex md:flex-col shadow-xl z-10">
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="bg-white/10 p-1 rounded-full backdrop-blur-sm">
            <Image src={puplogo} alt="PUP Logo" width={44} height={44} className="drop-shadow-md" />
          </div>
          <div className="font-bold text-lg leading-tight tracking-wide drop-shadow-sm capitalize">
            {role || 'Admin'}<br/>Dashboard
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href={`/${role?.toLowerCase() || 'admin'}`} className="block px-4 py-3 rounded-xl bg-white/15 text-white font-medium transition-all hover:bg-white/25 shadow-sm border border-white/10">
            Dashboard
          </Link>

          {role === 'admin' && (
            <>
              <Link href="/admin/users" className="block px-4 py-3 rounded-xl text-white/70 font-medium transition-all hover:bg-white/10 hover:text-white">
                User Management
              </Link>
              <Link href="#" className="block px-4 py-3 rounded-xl text-white/70 font-medium transition-all hover:bg-white/10 hover:text-white">
                Departments
              </Link>
              <Link href="#" className="block px-4 py-3 rounded-xl text-white/70 font-medium transition-all hover:bg-white/10 hover:text-white">
                Syllabus Review
              </Link>
            </>
          )}

          {role === 'instructor' && (
            <>
              <Link href="#" className="block px-4 py-3 rounded-xl text-white/70 font-medium transition-all hover:bg-white/10 hover:text-white">
                My Syllabi
              </Link>
              <Link href="#" className="block px-4 py-3 rounded-xl text-white/70 font-medium transition-all hover:bg-white/10 hover:text-white">
                My Classes
              </Link>
            </>
          )}

          {role === 'student' && (
            <>
              <Link href="#" className="block px-4 py-3 rounded-xl text-white/70 font-medium transition-all hover:bg-white/10 hover:text-white">
                My Courses
              </Link>
              <Link href="#" className="block px-4 py-3 rounded-xl text-white/70 font-medium transition-all hover:bg-white/10 hover:text-white">
                Syllabi
              </Link>
            </>
          )}
        </nav>
        <div className="p-4 border-t border-white/10">
           <Link href="/" className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-white/80 font-medium transition-all hover:bg-red-900 hover:text-white border border-transparent hover:border-white/10">
             Sign out
           </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 py-5 lg:px-10">
            <div className="flex items-center gap-4">
              {/* Mobile menu placeholder */}
              <div className="md:hidden p-2 -ml-2 rounded-lg text-[#800000] hover:bg-gray-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
                <p className="text-sm text-gray-500 font-medium mt-0.5">Signed in as <span className="text-[#800000] font-semibold">{role}</span></p>
              </div>
            </div>
            
            <div className="md:hidden">
              <Link href="/" className="text-sm font-semibold text-[#800000] hover:underline bg-red-50 px-3 py-1.5 rounded-lg">
                Logout
              </Link>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

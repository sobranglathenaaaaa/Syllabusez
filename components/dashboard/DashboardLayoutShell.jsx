"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import puplogo from "@/lib/image/puplogo.png";
import {
  Home,
  FileText,
  Users,
  Layers,
  BookOpen,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronDown
} from "lucide-react";

export function DashboardLayoutShell({ user, children }) {
  const { role, name, email } = user;
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Dynamic sample notifications based on role
function getNotifications() {
  // Sample static notifications; replace with real data fetching as needed
  return [
    { id: 1, text: "Welcome to the dashboard!", time: "Just now", read: false },
    { id: 2, text: "Your profile was updated.", time: "5 mins ago", read: true },
  ];
}


  const [notifications, setNotifications] = useState(getNotifications());
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleSignOut = () => {
    // Clear cookies
    document.cookie = "session_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "session_user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "session_email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "session_name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

    // Redirect to home page
    router.push("/");
    router.refresh();
  };

  // Nav items based on role
  const navItems = [
    { label: "Dashboard", href: `/${role}`, icon: Home },
    { label: "Syllabi", href: `/${role}/syllabi`, icon: FileText },
  ];

  if (role === "student") {
    navItems.push({ label: "Curriculum", href: "/student/curriculum", icon: BookOpen });
  }

  if (role === "admin") {
    navItems.push(
      { label: "User Management", href: "/admin/users", icon: Users },
      { label: "Curriculum", href: "/admin/curriculum", icon: BookOpen }
    );
  }

  // Settings at the bottom
  const settingsItem = { label: "Settings", href: "/settings", icon: Settings };

  // Initials for avatar
  const getInitials = (fullName) => {
    if (!fullName) return "PUP";
    // Remove title prefix (e.g. Dr., Prof.)
    const cleanName = fullName.replace(/^(Dr\.|Prof\.)\s+/i, "");
    const parts = cleanName.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(name);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar - Sticky Sticky with Maroon (#800000) Background */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-[#800000] text-white flex-shrink-0 shadow-2xl relative z-20 transition-all duration-300">
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3 border-b border-white/10 bg-black/10">
          <div className="bg-white p-1 rounded-full shadow-inner flex-shrink-0">
            <Image src={puplogo} alt="PUP Logo" width={40} height={40} className="w-10 h-10 object-contain drop-shadow" />
          </div>
          <div className="leading-tight">
            <span className="font-extrabold text-sm tracking-widest block uppercase text-amber-400">PUP San Juan</span>
            <span className="font-medium text-xs text-white/80 block">Syllabus Portal</span>
          </div>
        </div>

        {/* Navigation Area */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== `/${role}` && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${isActive
                  ? "bg-white/15 text-white shadow-md border border-white/10 translate-x-1"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? "text-amber-400" : "text-white/60 group-hover:text-white"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-md">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 space-y-2 bg-black/5">
          <Link
            href={settingsItem.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${pathname === settingsItem.href
              ? "bg-white/15 text-white"
              : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
          >
            <Settings className="w-5 h-5 text-white/60" />
            <span>{settingsItem.label}</span>
          </Link>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-red-200 hover:bg-red-950/40 hover:text-white transition-all duration-200 group text-left border border-transparent hover:border-red-950/20"
          >
            <LogOut className="w-5 h-5 text-red-300/80 group-hover:translate-x-0.5 transition-transform" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <aside className="w-64 h-full bg-[#800000] text-white flex flex-col shadow-2xl animate-in slide-in-from-left duration-300" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="bg-white p-1 rounded-full">
                  <Image src={puplogo} alt="PUP Logo" width={32} height={32} className="w-8 h-8 object-contain" />
                </div>
                <div>
                  <span className="font-extrabold text-xs tracking-wider block uppercase text-amber-400">PUP SJ</span>
                  <span className="font-semibold text-xs block text-white/90">Syllabus Portal</span>
                </div>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg hover:bg-white/10">
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== `/${role}` && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive
                      ? "bg-white/20 text-white shadow-md"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-white/80" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 space-y-1 bg-black/10">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-red-200 hover:bg-red-950/40 hover:text-white transition-all text-left"
              >
                <LogOut className="w-5 h-5 text-red-300" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 lg:px-10 flex-shrink-0 sticky top-0 z-10 shadow-sm shadow-gray-100/40">
          {/* Left: Mobile Toggle & Page Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors border border-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs font-semibold text-gray-400 tracking-wider uppercase block leading-none">Polytechnic University of the Philippines</span>
              <span className="text-sm font-medium text-gray-500 block mt-0.5">San Juan Branch</span>
            </div>
          </div>

          {/* Right: Notifications & User profile dropdown */}
          <div className="flex items-center gap-4">
            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setUserDropdownOpen(false);
                }}
                className={`p-2.5 rounded-xl text-gray-600 hover:bg-gray-50 transition-all border border-gray-100 relative ${notificationsOpen ? "bg-gray-50 text-[#800000] ring-2 ring-red-800/10" : ""
                  }`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-600 border border-white text-white rounded-full flex items-center justify-center text-[10px] font-extrabold px-1 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-sm text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs font-bold text-[#800000] hover:text-red-700 hover:underline transition-colors"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div key={notif.id} className={`px-5 py-4 hover:bg-gray-50/70 transition-colors flex gap-3 ${!notif.read ? "bg-red-50/20" : ""}`}>
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!notif.read ? "bg-red-600" : "bg-transparent"}`} />
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-800 leading-relaxed">{notif.text}</p>
                            <span className="text-[10px] text-gray-400 font-medium block mt-1">{notif.time}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-5 py-8 text-center text-xs text-gray-400">
                        No new notifications.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-gray-200" />

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-3 p-1 pr-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all"
              >
                {/* Initials Avatar */}
                <div className="w-9 h-9 rounded-lg bg-[#800000] text-amber-400 font-bold text-sm flex items-center justify-center border border-[#800000]/10 shadow">
                  {initials}
                </div>
                <div className="text-left hidden md:block">
                  <span className="text-xs font-bold text-gray-900 block leading-tight">{name}</span>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mt-0.5">{role}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {/* User Dropdown */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <span className="text-xs font-bold text-gray-900 block">{name}</span>
                    <span className="text-[10px] font-semibold text-gray-400 block break-all mt-0.5">{email}</span>
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    <Link
                      href="#"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      <span>Account Settings</span>
                    </Link>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        handleSignOut();
                      }}
                      className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-all text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

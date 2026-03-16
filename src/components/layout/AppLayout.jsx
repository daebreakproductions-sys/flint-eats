import { Outlet, Link, useLocation } from "react-router-dom";
import { Flame, Map, BookOpen, List, MessageCircle, ShieldCheck } from "lucide-react";
import UserMenu from "@/components/layout/UserMenu";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const NAV_LINKS = [
  { to: "/Feed", label: "Feed", icon: Flame },
  { to: "/Map", label: "Map", icon: Map },
  { to: "/Directory", label: "Directory", icon: List },
  { to: "/Learn", label: "Learn", icon: BookOpen },
  { to: "/Messages", label: "Messages", icon: MessageCircle },
];

export default function AppLayout() {
  const location = useLocation();

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-700 to-emerald-800 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/Feed" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">🌿</span>
            <span className="font-bold text-white text-lg hidden sm:block">Flint Eats</span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-1">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    active
                      ? "bg-white/20 text-white"
                      : "text-green-100 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:block">{label}</span>
                </Link>
              );
            })}
            {user?.role === "admin" && (
              <Link
                to="/Admin"
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  location.pathname === "/Admin"
                    ? "bg-white/20 text-white"
                    : "text-green-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden sm:block">Admin</span>
              </Link>
            )}
          </nav>

          {/* User menu */}
          <UserMenu />
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
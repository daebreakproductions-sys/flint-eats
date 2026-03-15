import { Link, useLocation, Outlet } from "react-router-dom";
import { MapPin, List, BookOpen, Settings, Leaf, Flame, User } from "lucide-react";
import { cn } from "@/lib/utils";
import UserMenu from "@/components/layout/UserMenu";

const navItems = [
  { label: "Feed", path: "/Feed", icon: Flame },
  { label: "Map", path: "/Map", icon: MapPin },
  { label: "Directory", path: "/Directory", icon: List },
  { label: "Learn", path: "/Learn", icon: BookOpen },
  { label: "Admin", path: "/Admin", icon: Settings },
];

const mobileNav = [
  { label: "Feed", path: "/Feed", icon: Flame },
  { label: "Map", path: "/Map", icon: MapPin },
  { label: "Directory", path: "/Directory", icon: List },
  { label: "Learn", path: "/Learn", icon: BookOpen },
  { label: "Profile", path: "/Profile", icon: User },
];

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Nav */}
      <header className="bg-white border-b border-gray-100 shadow-sm z-50 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link to="/Feed" className="flex items-center gap-2 font-bold text-xl tracking-tight shrink-0">
            <div className="w-8 h-8 bg-green-700 rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-yellow-300" />
            </div>
            <span className="text-green-800">Flint<span className="text-green-500">Eats</span></span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navItems.map(({ label, path, icon: Icon }) => {
              const active = location.pathname.startsWith(path);
              return (
                <Link
                  key={path}
                  to={path}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                    active
                      ? "bg-green-50 text-green-700"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                  )}
                >
                  <Icon className={cn("w-4 h-4", active && "text-green-600")} />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* User menu */}
          <div className="shrink-0">
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 flex shadow-lg">
        {mobileNav.map(({ label, path, icon: Icon }) => {
          const active = location.pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex-1 flex flex-col items-center py-2.5 gap-0.5 text-xs font-medium transition-colors",
                active ? "text-green-700" : "text-gray-400"
              )}
            >
              <Icon className={cn("w-5 h-5", active && "fill-green-100")} />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
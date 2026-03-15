import { Link, useLocation, Outlet } from "react-router-dom";
import { MapPin, List, BookOpen, Settings, Leaf, User } from "lucide-react";
import { cn } from "@/lib/utils";
import UserMenu from "@/components/layout/UserMenu";

const navItems = [
  { label: "Map", path: "/Map", icon: MapPin },
  { label: "Directory", path: "/Directory", icon: List },
  { label: "Learn", path: "/Learn", icon: BookOpen },
  { label: "Admin", path: "/Admin", icon: Settings },
  { label: "Profile", path: "/Profile", icon: User },
];

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Nav */}
      <header className="bg-green-700 text-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/Map" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <Leaf className="w-6 h-6 text-yellow-300" />
            <span>Flint Eats</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.filter(n => n.path !== "/Profile").map(({ label, path, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  location.pathname.startsWith(path)
                    ? "bg-green-600 text-white"
                    : "text-green-100 hover:bg-green-600/70"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>
          <UserMenu />
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex">
        {navItems.map(({ label, path, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={cn(
              "flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-medium transition-colors",
              location.pathname.startsWith(path)
                ? "text-green-700"
                : "text-gray-500"
            )}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
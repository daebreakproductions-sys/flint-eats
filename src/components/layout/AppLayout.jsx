import { Outlet, Link, useLocation } from "react-router-dom";
import { Flame, Map, BookOpen, List, MessageCircle, ShieldCheck, User } from "lucide-react";
import UserMenu from "@/components/layout/UserMenu";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { to: "/Feed", label: "Feed", icon: Flame },
  { to: "/Map", label: "Map", icon: Map },
  { to: "/Directory", label: "Directory", icon: List },
  { to: "/Learn", label: "Learn", icon: BookOpen },
  { to: "/Messages", label: "Messages", icon: MessageCircle },
];

const pageVariants = {
  initial: { x: 24, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.22, ease: "easeOut" } },
  exit: { x: -24, opacity: 0, transition: { duration: 0.15, ease: "easeIn" } },
};

export default function AppLayout() {
  const location = useLocation();

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });

  const allLinks = [
    ...NAV_LINKS,
    ...(user?.role === "admin" ? [{ to: "/Admin", label: "Admin", icon: ShieldCheck }] : []),
    { to: "/Profile", label: "Profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Desktop top header */}
      <header className="bg-gradient-to-r from-green-700 to-emerald-800 shadow-md sticky top-0 z-50 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link to="/Feed" className="flex items-center gap-2 shrink-0 select-none">
            <span className="text-2xl">🌿</span>
            <span className="font-bold text-white text-lg">Flint Eats</span>
          </Link>

          <nav className="flex items-center gap-1">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link key={to} to={to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors select-none ${
                    active ? "bg-white/20 text-white" : "text-green-100 hover:bg-white/10 hover:text-white"
                  }`}>
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              );
            })}
            {user?.role === "admin" && (
              <Link to="/Admin"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors select-none ${
                  location.pathname === "/Admin" ? "bg-white/20 text-white" : "text-green-100 hover:bg-white/10 hover:text-white"
                }`}>
                <ShieldCheck className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          <UserMenu />
        </div>
      </header>

      {/* Mobile top bar */}
      <header className="bg-gradient-to-r from-green-700 to-emerald-800 shadow-md sticky top-0 z-50 md:hidden flex items-center justify-between px-4 h-12">
        <Link to="/Feed" className="flex items-center gap-1.5 select-none">
          <span className="text-xl">🌿</span>
          <span className="font-bold text-white text-base">Flint Eats</span>
        </Link>
        <UserMenu />
      </header>

      {/* Page content */}
      <main className="flex-1 pb-20 md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile bottom tab bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {allLinks.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex-1 flex flex-col items-center justify-center min-h-[56px] gap-0.5 text-[10px] font-medium transition-colors select-none ${
                active ? "text-green-700 dark:text-green-400" : "text-gray-400 dark:text-gray-500"
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? "text-green-700 dark:text-green-400" : ""}`} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
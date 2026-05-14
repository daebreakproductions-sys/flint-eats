import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Flame, Map, BookOpen, List, ShieldCheck, User, ChevronLeft } from "lucide-react";
import UserMenu from "@/components/layout/UserMenu";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Feed from "@/pages/Feed";
import MapPage from "@/pages/Map";
import Directory from "@/pages/Directory";
import Learn from "@/pages/Learn";

const NAV_LINKS = [
  { to: "/Feed", label: "Feed", icon: Flame },
  { to: "/Map", label: "Map", icon: Map },
  { to: "/Directory", label: "Directory", icon: List },
  { to: "/Learn", label: "Learn", icon: BookOpen },
];

const TAB_ROUTES = ["/Feed", "/Map", "/Directory", "/Learn"];

const pageVariants = {
  initial: { x: 24, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.22, ease: "easeOut" } },
  exit: { x: -24, opacity: 0, transition: { duration: 0.15, ease: "easeIn" } },
};

const NON_TAB_TITLES = {
  "/Profile": "Profile",
  "/Admin": "Admin Dashboard",
  "/GeocodingTool": "Geocoding Tool",
  "/DiagnosticTest": "Diagnostic",
};

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Respect system dark mode
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = (dark) => document.documentElement.classList.toggle("dark", dark);
    apply(mq.matches);
    mq.addEventListener("change", e => apply(e.matches));
    return () => mq.removeEventListener("change", () => {});
  }, []);

  // Apply safe area & overscroll styles
  useEffect(() => {
    document.body.style.overscrollBehavior = "none";
  }, []);

  const [activeTab, setActiveTab] = useState(location.pathname);
  const prevTab = useRef(location.pathname);

  useEffect(() => {
    if (TAB_ROUTES.includes(location.pathname) && location.pathname !== prevTab.current) {
      prevTab.current = location.pathname;
      setActiveTab(location.pathname);
    }
  }, [location.pathname]);

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
      {TAB_ROUTES.includes(location.pathname) ? (
        <header
          className="bg-gradient-to-r from-green-700 to-emerald-800 shadow-md sticky top-0 z-50 md:hidden flex items-center justify-between px-4 h-14"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <Link to="/Feed" className="flex items-center gap-1.5 select-none">
            <span className="text-xl">🌿</span>
            <span className="font-bold text-white text-base">Flint Eats</span>
          </Link>
          <UserMenu />
        </header>
      ) : (
        <header
          className="bg-gradient-to-r from-green-700 to-emerald-800 shadow-md sticky top-0 z-50 md:hidden flex items-center gap-3 px-2 h-14"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-11 h-11 rounded-full text-white hover:bg-white/15 active:bg-white/25 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="font-semibold text-white text-base flex-1 truncate">
            {NON_TAB_TITLES[location.pathname] || "Flint Eats"}
          </span>
          <div className="pr-1"><UserMenu /></div>
        </header>
      )}

      {/* Page content */}
      <main className="flex-1 pb-20 md:pb-0">
        {/* Persistent tab pages — kept mounted to preserve scroll & state */}
        {TAB_ROUTES.map(route => {
          const isActive = location.pathname === route;
          return (
            <motion.div
              key={route}
              animate={{ opacity: isActive ? 1 : 0 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
              style={{ display: isActive ? "block" : "none" }}
              className="h-full"
            >
              {route === "/Feed" && <Feed />}
              {route === "/Map" && <MapPage />}
              {route === "/Directory" && <Directory />}
              {route === "/Learn" && <Learn />}
            </motion.div>
          );
        })}

        {/* Non-tab routes (Admin, Profile, etc.) get animated transition */}
        {!TAB_ROUTES.includes(location.pathname) && (
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
        )}
      </main>

      {/* Mobile bottom tab bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex select-none"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {allLinks.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={() => {
                if (active) window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`flex-1 flex flex-col items-center justify-center min-h-[60px] py-2 gap-0.5 text-[10px] font-medium transition-all select-none active:bg-gray-100 dark:active:bg-gray-800 ${
                active ? "text-green-700 dark:text-green-400" : "text-gray-400 dark:text-gray-500"
              }`}
            >
              <div className={`w-10 h-6 flex items-center justify-center rounded-full transition-colors ${active ? "bg-green-100 dark:bg-green-900/40" : ""}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
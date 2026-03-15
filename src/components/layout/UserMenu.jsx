import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { User, LogOut, Settings, ChevronDown, Flame } from "lucide-react";
import { ROLE_CONFIG } from "@/components/admin/UsersTab";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = (user?.full_name || user?.email || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const roleCfg = ROLE_CONFIG[user?.role] || ROLE_CONFIG.user;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-green-600/60 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center">
          <span className="text-xs font-bold text-green-900">{initials}</span>
        </div>
        <span className="hidden md:block text-sm font-medium text-white max-w-[120px] truncate">
          {user?.full_name || user?.email?.split("@")[0] || "Account"}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-green-200 hidden md:block" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[9999] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-green-700 to-emerald-800 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center shrink-0">
                <span className="text-lg font-bold text-green-900">{initials}</span>
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-white truncate">{user?.full_name || "—"}</p>
                <p className="text-xs text-green-200 truncate">{user?.email}</p>
                <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${roleCfg.color}`}>
                  {roleCfg.label}
                </span>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              to="/Feed"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Flame className="w-4 h-4 text-orange-500" />
              Community Feed
            </Link>
            <Link
              to="/Profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <User className="w-4 h-4 text-green-600" />
              View Profile
            </Link>
            <Link
              to="/Admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4 text-green-600" />
              Admin Dashboard
            </Link>
          </div>

          <div className="border-t">
            <button
              onClick={() => base44.auth.logout()}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
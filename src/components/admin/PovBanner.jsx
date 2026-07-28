import { Eye, X } from "lucide-react";
import { ROLE_CONFIG } from "@/components/admin/UsersTab";

export const POV_KEY = "flint_eats_pov_role";

export function getPovRole() {
  try { return sessionStorage.getItem(POV_KEY) || null; } catch { return null; }
}

export function setPovRole(role) {
  try {
    if (role) sessionStorage.setItem(POV_KEY, role);
    else sessionStorage.removeItem(POV_KEY);
  } catch {}
}

export default function PovBanner({ povRole, onExit }) {
  if (!povRole) return null;
  const cfg = ROLE_CONFIG[povRole] || { label: povRole };
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 text-white flex items-center justify-between px-4 py-2 text-sm font-semibold shadow-lg">
      <div className="flex items-center gap-2">
        <Eye className="w-4 h-4" />
        <span>Previewing as: <span className="underline">{cfg.label}</span></span>
      </div>
      <button
        onClick={onExit}
        className="flex items-center gap-1 bg-white/20 hover:bg-white/30 transition rounded-full px-3 py-1 text-xs font-bold"
      >
        <X className="w-3 h-3" /> Exit Preview
      </button>
    </div>
  );
}
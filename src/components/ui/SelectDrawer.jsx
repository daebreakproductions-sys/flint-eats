import { useState, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

/**
 * SelectDrawer – bottom-sheet Drawer on mobile, standard Radix popper on desktop.
 * Uses JS detection so only ONE implementation is ever in the DOM at a time.
 *
 * Props:
 *   value        – controlled value
 *   onValueChange – called with the new value
 *   placeholder  – trigger placeholder text
 *   options      – [{ value, label }]
 *   triggerClassName – optional extra classes for the trigger
 */
export default function SelectDrawer({ value, onValueChange, placeholder = "Select…", options = [], triggerClassName = "" }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find(o => o.value === value)?.label ?? placeholder;

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <button
          onClick={() => setOpen(true)}
          className={`flex items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm min-w-[120px] min-h-[44px] ${triggerClassName}`}
        >
          <span className={value ? "text-foreground" : "text-muted-foreground"}>{selectedLabel}</span>
          <ChevronDown className="w-4 h-4 opacity-50 shrink-0" />
        </button>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{placeholder}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-8 space-y-1">
            {options.map(({ value: v, label }) => (
              <DrawerClose asChild key={v}>
                <button
                  onClick={() => onValueChange(v)}
                  className={`w-full flex items-center justify-between px-3 rounded-lg text-sm transition-colors min-h-[44px] ${
                    value === v ? "bg-green-50 text-green-800 font-medium" : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {label}
                  {value === v && <Check className="w-4 h-4 text-green-700 shrink-0" />}
                </button>
              </DrawerClose>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map(({ value: v, label }) => (
          <SelectItem key={v} value={v}>{label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
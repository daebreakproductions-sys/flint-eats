import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * SelectDrawer – behaves like a standard <Select> on desktop (popper),
 * but opens a bottom-sheet Drawer on mobile.
 *
 * Props mirror a simplified <Select>:
 *   value        – controlled value
 *   onValueChange – called with the new value
 *   placeholder  – trigger placeholder text
 *   options      – [{ value, label }]
 *   triggerClassName – optional extra classes for the trigger button
 */
export default function SelectDrawer({ value, onValueChange, placeholder = "Select…", options = [], triggerClassName = "" }) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find(o => o.value === value)?.label ?? placeholder;

  return (
    <>
      {/* Mobile: bottom-sheet drawer */}
      <div className="sm:hidden">
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <button
              className={`flex items-center justify-between gap-2 h-9 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm min-w-[120px] ${triggerClassName}`}
            >
              <span className={value ? "text-foreground" : "text-muted-foreground"}>{selectedLabel}</span>
              <ChevronDown className="w-4 h-4 opacity-50 shrink-0" />
            </button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{placeholder}</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-8 space-y-1">
              {options.map(({ value: v, label }) => (
                <DrawerClose asChild key={v}>
                  <button
                    onClick={() => onValueChange(v)}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm transition-colors ${
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
      </div>

      {/* Desktop: standard Radix popper select */}
      <div className="hidden sm:block">
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
      </div>
    </>
  );
}
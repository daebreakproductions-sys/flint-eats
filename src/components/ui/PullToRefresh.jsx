import { useState, useRef, useCallback } from "react";
import { RefreshCw } from "lucide-react";

/**
 * PullToRefresh – wraps any content and triggers onRefresh when the user
 * pulls down from the top of the page.
 *
 * Props:
 *   onRefresh  – async function called when the threshold is reached
 *   children   – page content
 */
export default function PullToRefresh({ onRefresh, children }) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(null);

  const handleTouchStart = useCallback((e) => {
    if (window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (touchStartY.current === null) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0 && window.scrollY === 0) {
      setPullDistance(Math.min(delta * 0.4, 72));
    }
  }, []);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= 60) {
      setIsPulling(true);
      await onRefresh();
      setIsPulling(false);
    }
    touchStartY.current = null;
    setPullDistance(0);
  }, [pullDistance, onRefresh]);

  const showIndicator = pullDistance > 10 || isPulling;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {showIndicator && (
        <div
          className="flex justify-center items-center gap-2 text-sm text-green-700 overflow-hidden transition-all duration-200"
          style={{ height: isPulling ? 40 : pullDistance * 0.55 }}
        >
          <RefreshCw className={`w-4 h-4 ${isPulling ? "animate-spin" : ""}`} />
          <span>{isPulling ? "Refreshing…" : pullDistance >= 60 ? "Release to refresh" : "Pull to refresh"}</span>
        </div>
      )}
      {children}
    </div>
  );
}
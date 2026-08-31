import { useState, useEffect } from "react";
import { formatDistanceToNowStrict } from "date-fns";

function formatAgo(dateStr) {
  if (!dateStr) return "";
  const str = formatDistanceToNowStrict(new Date(dateStr));
  return str
    .replace(" seconds", "s")
    .replace(" second", "s")
    .replace(" minutes", " min")
    .replace(" minute", " min")
    .replace(" hours", " hr")
    .replace(" hour", " hr")
    .replace(" days", "d")
    .replace(" day", "d")
    .replace(" months", " mo")
    .replace(" month", " mo")
    .replace(" years", " yr")
    .replace(" year", " yr")
    + " ago";
}

export default function TimeAgo({ date, interval = 30000 }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), interval);
    return () => clearInterval(id);
  }, [interval]);
  return <>{formatAgo(date)}</>;
}
import { normalizeUrl } from "@/lib/urls";

// Matches full URLs, bare domains (flinteats.org), and email addresses.
const LINK_RE =
  /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.(?:com|org|net|edu|gov|us|io|co|info|me|ly|biz)(?:\/[^\s]*)?)/gi;

function splitTrailing(token) {
  const match = token.match(/[.,!?;:)\]]+$/);
  const tail = match ? match[0] : "";
  return [token.slice(0, token.length - tail.length), tail];
}

export default function LinkifiedText({ text, className = "" }) {
  if (!text) return null;
  const parts = String(text).split(LINK_RE);

  return (
    <p className={className}>
      {parts.map((part, i) => {
        // Odd indexes are the captured links; even indexes are plain text.
        if (i % 2 === 0 || !part) return <span key={i}>{part}</span>;

        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(part);
        const [clean, tail] = splitTrailing(part);
        const href = isEmail ? `mailto:${clean}` : normalizeUrl(clean);
        if (!href) return <span key={i}>{part}</span>;

        return (
          <span key={i}>
            <a
              href={href}
              target={isEmail ? undefined : "_blank"}
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="text-green-700 underline underline-offset-2 hover:text-green-800 break-words"
            >
              {clean}
            </a>
            {tail}
          </span>
        );
      })}
    </p>
  );
}
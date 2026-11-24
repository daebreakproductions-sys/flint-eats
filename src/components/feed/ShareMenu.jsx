import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Share2, Mail, MessageCircle, Link2, Check, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

function shareUrlFor(post) {
  // Served by a backend function so link previews carry this post's own text and photo.
  return `${window.location.origin}/functions/sharePost?id=${post.id}`;
}

function shareTextFor(post) {
  const snippet = (post.content || "").replace(/\s+/g, " ").trim().slice(0, 140);
  return snippet ? `${snippet}${snippet.length === 140 ? "…" : ""} — via Flint Eats` : "Check this out on Flint Eats";
}

const ROW = "flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm text-left text-foreground hover:bg-muted transition-colors";

export default function ShareMenu({ post }) {
  const [copied, setCopied] = useState(false);
  const url = shareUrlFor(post);
  const text = shareTextFor(post);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title: "Flint Eats", text, url });
    } catch {
      /* user dismissed the share sheet */
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-green-600 transition-colors active:scale-90"
          aria-label="Share this post"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-1.5" align="start">
        <p className="px-2.5 py-1.5 text-xs font-semibold text-muted-foreground">Share to</p>

        <a
          className={ROW}
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="w-5 h-5 rounded-full bg-[#1877f2] text-white text-xs font-bold flex items-center justify-center">f</span>
          Facebook
        </a>

        <a
          className={ROW}
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="w-5 h-5 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">𝕏</span>
          X (Twitter)
        </a>

        <a
          className={ROW}
          href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle className="w-5 h-5 text-[#25d366]" />
          WhatsApp
        </a>

        <a
          className={ROW}
          href={`mailto:?subject=${encodeURIComponent("Flint Eats")}&body=${encodeURIComponent(`${text}\n\n${url}`)}`}
        >
          <Mail className="w-5 h-5 text-muted-foreground" />
          Email
        </a>

        <button className={ROW} onClick={copyLink}>
          {copied ? <Check className="w-5 h-5 text-green-600" /> : <Link2 className="w-5 h-5 text-muted-foreground" />}
          {copied ? "Link copied" : "Copy link"}
        </button>

        {typeof navigator !== "undefined" && navigator.share && (
          <button className={ROW} onClick={nativeShare}>
            <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
            More options
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}
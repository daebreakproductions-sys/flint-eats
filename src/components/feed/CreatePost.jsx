import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image, Send, X } from "lucide-react";
import { toast } from "sonner";
import {
  RecipeFields, EventFields, ResourceTipFields,
  QuestionFields, SuccessStoryFields, CommunityNewsFields,
} from "./PostTypeFields";

const CATEGORIES = [
  { value: "Recipe",          emoji: "🍳", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { value: "Resource Tip",    emoji: "💡", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "Community News",  emoji: "📰", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { value: "Event",           emoji: "📅", color: "bg-pink-100 text-pink-700 border-pink-200" },
  { value: "Question",        emoji: "❓", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { value: "Success Story",   emoji: "🌟", color: "bg-green-100 text-green-700 border-green-200" },
  { value: "General",         emoji: "💬", color: "bg-gray-100 text-gray-700 border-gray-200" },
];

export const CATEGORY_COLORS = Object.fromEntries(CATEGORIES.map(c => [c.value, c.color.split(" ").slice(0,2).join(" ")]));

const PLACEHOLDERS = {
  Recipe:          "Share your recipe — what's cooking? 🍳",
  "Resource Tip":  "Share a helpful food resource or tip with the community...",
  "Community News":"Share a community update or announcement...",
  Event:           "Tell the community about an upcoming event...",
  Question:        "Ask the community a question...",
  "Success Story": "Share your success story with the community! 🌟",
  General:         "Share a recipe, tip, or community update...",
};

const TYPE_FIELDS = {
  Recipe:          RecipeFields,
  Event:           EventFields,
  "Resource Tip":  ResourceTipFields,
  Question:        QuestionFields,
  "Success Story": SuccessStoryFields,
  "Community News": CommunityNewsFields,
};

function formatExtraContent(category, extra) {
  if (!extra || Object.keys(extra).length === 0) return "";
  const lines = [];
  if (category === "Recipe") {
    if (extra.prep_time || extra.cook_time || extra.servings || extra.budget) {
      lines.push(`⏱ Prep: ${extra.prep_time || "—"} | Cook: ${extra.cook_time || "—"} | Serves: ${extra.servings || "—"} | Budget: ${extra.budget || "—"}`);
    }
    const ings = (extra.ingredients || []).filter(Boolean);
    if (ings.length) lines.push(`\n📝 Ingredients:\n${ings.map(i => `• ${i}`).join("\n")}`);
    const stps = (extra.steps || []).filter(Boolean);
    if (stps.length) lines.push(`\n👨‍🍳 Steps:\n${stps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`);
  }
  if (category === "Event") {
    if (extra.event_date) lines.push(`📅 Date: ${extra.event_date}${extra.event_time ? " at " + extra.event_time : ""}`);
    if (extra.location) lines.push(`📍 Location: ${extra.location}`);
    if (extra.rsvp_url) lines.push(`🔗 RSVP: ${extra.rsvp_url}`);
  }
  if (category === "Resource Tip") {
    if (extra.resource_name) lines.push(`🏪 Resource: ${extra.resource_name}`);
    if (extra.hours) lines.push(`🕐 Hours: ${extra.hours}`);
    if (extra.phone) lines.push(`📞 ${extra.phone}`);
    if (extra.url) lines.push(`🔗 ${extra.url}`);
  }
  if (category === "Question" && extra.topic) lines.push(`🏷 Topic: ${extra.topic}`);
  if (category === "Success Story") {
    if (extra.program) lines.push(`✅ Program: ${extra.program}`);
    if (extra.outcome) lines.push(`🎯 Outcome: ${extra.outcome}`);
  }
  if (category === "Community News") {
    if (extra.source) lines.push(`📡 Source: ${extra.source}`);
    if (extra.link) lines.push(`🔗 ${extra.link}`);
  }
  return lines.length ? "\n\n" + lines.join("\n") : "";
}

export default function CreatePost({ user }) {
  const qc = useQueryClient();
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [extra, setExtra] = useState({});

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.Post.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feed-posts"] });
      setContent(""); setImageUrl(""); setShowImageInput(false);
      setCategory("General"); setExtra({});
      toast.success("Posted!");
    },
  });

  if (!user) return null;

  const initials = (user?.full_name || user?.email || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const activeCat = CATEGORIES.find(c => c.value === category) || CATEGORIES[6];
  const ExtraFields = TYPE_FIELDS[category] || null;

  const handlePost = () => {
    if (!content.trim()) return;
    const fullContent = content.trim() + formatExtraContent(category, extra);
    mutation.mutate({
      content: fullContent,
      category,
      image_url: imageUrl.trim() || undefined,
      author_email: user.email,
      author_name: user.full_name || user.email.split("@")[0],
      author_role: user.role || "user",
      county: user.county || "Genesee",
      likes: 0,
      liked_by: [],
      comment_count: 0,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-green-700 flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-white">{initials}</span>
        </div>
        <div className="flex-1 space-y-2">

          {/* Category picker chips */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => { setCategory(cat.value); setExtra({}); }}
                className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${
                  category === cat.value
                    ? cat.color + " shadow-sm scale-105"
                    : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <span>{cat.emoji}</span> {cat.value}
              </button>
            ))}
          </div>

          <Textarea
            placeholder={PLACEHOLDERS[category]}
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={3}
            className="resize-none border-gray-200 focus:border-green-400 rounded-xl text-sm"
          />

          {/* Dynamic type-specific fields */}
          {ExtraFields && (
            <div className={`rounded-xl border p-3 ${activeCat.color.split(" ").slice(0,1)[0].replace("bg-", "bg-").replace("100", "50")} border-${activeCat.color.split(" ")[0].replace("bg-", "").replace("-100","")}-100`}>
              <ExtraFields extra={extra} setExtra={setExtra} />
            </div>
          )}

          {showImageInput && (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste image URL..."
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-400"
              />
              <button onClick={() => { setShowImageInput(false); setImageUrl(""); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
            <button onClick={() => setShowImageInput(v => !v)} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-600 transition-colors">
              <Image className="w-4 h-4" /> Photo
            </button>
            <Button
              onClick={handlePost}
              disabled={!content.trim() || mutation.isPending}
              className="bg-green-700 hover:bg-green-800 h-8 text-xs px-4"
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              {mutation.isPending ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
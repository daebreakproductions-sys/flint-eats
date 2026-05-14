import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image, Send, X, Upload } from "lucide-react";
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [extra, setExtra] = useState({});

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.Post.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feed-posts"] });
      setContent(""); setImageUrl("");
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
    <div className="bg-card rounded-2xl shadow-sm border border-border p-4">
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
                className={`flex items-center gap-1 text-xs px-3 py-2 rounded-full border-0 font-medium transition-all min-h-[44px] ${
                  category === cat.value
                    ? "bg-green-700 text-white shadow-sm scale-105"
                    : "bg-muted text-muted-foreground hover:text-foreground"
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
            className="resize-none bg-[hsl(var(--input-bg))] text-[hsl(var(--input-text))] border-border focus:border-green-500 rounded-xl text-sm"
          />

          {/* Dynamic type-specific fields */}
          {ExtraFields && (
            <div className="rounded-xl border border-border bg-muted p-3">
              <ExtraFields extra={extra} setExtra={setExtra} />
            </div>
          )}

          {imageUrl && (
            <div className="relative inline-block">
              <img src={imageUrl} alt="Preview" className="h-24 w-auto rounded-lg object-cover border" />
              <button
                onClick={() => setImageUrl("")}
                className="absolute -top-1.5 -right-1.5 bg-background rounded-full shadow p-0.5 text-muted-foreground hover:text-red-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
            <label className="cursor-pointer flex items-center gap-1.5 text-xs text-muted-foreground hover:text-green-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploadingImage(true);
                  const { file_url } = await base44.integrations.Core.UploadFile({ file });
                  setImageUrl(file_url);
                  setUploadingImage(false);
                }}
              />
              {uploadingImage
                ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                : <Image className="w-4 h-4" />}
              {uploadingImage ? "Uploading..." : "Photo"}
            </label>
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
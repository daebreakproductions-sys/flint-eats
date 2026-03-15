import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Image, Send, X } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["Recipe", "Resource Tip", "Community News", "Event", "Question", "Success Story", "General"];

const CATEGORY_COLORS = {
  Recipe: "bg-orange-100 text-orange-700",
  "Resource Tip": "bg-blue-100 text-blue-700",
  "Community News": "bg-purple-100 text-purple-700",
  Event: "bg-pink-100 text-pink-700",
  Question: "bg-yellow-100 text-yellow-700",
  "Success Story": "bg-green-100 text-green-700",
  General: "bg-gray-100 text-gray-700",
};

export { CATEGORY_COLORS };

export default function CreatePost({ user }) {
  const qc = useQueryClient();
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);

  const initials = (user?.full_name || user?.email || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.Post.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feed-posts"] });
      setContent(""); setImageUrl(""); setShowImageInput(false); setCategory("General");
      toast.success("Posted!");
    },
  });

  const handlePost = () => {
    if (!content.trim()) return;
    mutation.mutate({
      content: content.trim(),
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
          <Textarea
            placeholder="Share a recipe, tip, or community update..."
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={3}
            className="resize-none border-gray-200 focus:border-green-400 rounded-xl text-sm"
          />
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
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button onClick={() => setShowImageInput(v => !v)} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-600 transition-colors">
                <Image className="w-4 h-4" /> Photo
              </button>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-7 text-xs w-36 border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
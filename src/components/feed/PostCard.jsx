import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, MapPin, Send, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { CATEGORY_COLORS } from "./CreatePost";
import { ROLE_CONFIG } from "@/components/admin/UsersTab";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

function CommentItem({ comment }) {
  const initials = (comment.author_name || comment.author_email || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div className="flex gap-2.5 py-2">
      <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-green-700">{initials}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-gray-50 rounded-xl px-3 py-2">
          <p className="text-xs font-semibold text-gray-800">{comment.author_name || comment.author_email?.split("@")[0]}</p>
          <p className="text-sm text-gray-700 mt-0.5">{comment.content}</p>
        </div>
        <p className="text-xs text-gray-400 mt-1 pl-2">
          {comment.created_date ? formatDistanceToNow(new Date(comment.created_date), { addSuffix: true }) : ""}
        </p>
      </div>
    </div>
  );
}

export default function PostCard({ post, currentUser }) {
  const qc = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const liked = post.liked_by?.includes(currentUser?.email);
  const initials = (post.author_name || post.author_email || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const roleCfg = ROLE_CONFIG[post.author_role] || ROLE_CONFIG.user;

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", post.id],
    queryFn: () => base44.entities.Comment.filter({ post_id: post.id }, "created_date", 50),
    enabled: showComments,
  });

  const likeMutation = useMutation({
    mutationFn: () => {
      const newLikedBy = liked
        ? (post.liked_by || []).filter(e => e !== currentUser.email)
        : [...(post.liked_by || []), currentUser.email];
      return base44.entities.Post.update(post.id, { likes: newLikedBy.length, liked_by: newLikedBy });
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["feed-posts"] });
      const prev = qc.getQueryData(["feed-posts"]);
      qc.setQueryData(["feed-posts"], (old = []) =>
        old.map(p => {
          if (p.id !== post.id) return p;
          const newLikedBy = liked
            ? (p.liked_by || []).filter(e => e !== currentUser.email)
            : [...(p.liked_by || []), currentUser.email];
          return { ...p, liked_by: newLikedBy, likes: newLikedBy.length };
        })
      );
      return { prev };
    },
    onError: (_, __, ctx) => qc.setQueryData(["feed-posts"], ctx?.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ["feed-posts"] }),
  });

  const commentMutation = useMutation({
    mutationFn: (content) => base44.entities.Comment.create({
      post_id: post.id,
      content,
      author_email: currentUser.email,
      author_name: currentUser.full_name || currentUser.email.split("@")[0],
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", post.id] });
      base44.entities.Post.update(post.id, { comment_count: (post.comment_count || 0) + 1 });
      qc.invalidateQueries({ queryKey: ["feed-posts"] });
      setCommentText("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Post.delete(post.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["feed-posts"] }); toast.success("Post deleted."); },
  });

  const canDelete = currentUser?.email === post.author_email || currentUser?.role === "admin";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-green-700 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-white">{initials}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-gray-900 text-sm">{post.author_name || post.author_email?.split("@")[0]}</p>
                <Badge className={roleCfg.color + " text-xs py-0"}>{roleCfg.label}</Badge>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-gray-400">
                  {post.created_date ? formatDistanceToNow(new Date(post.created_date), { addSuffix: true }) : ""}
                </p>
                {post.county && (
                  <span className="flex items-center gap-0.5 text-xs text-gray-400">
                    <MapPin className="w-3 h-3" /> {post.county} County, MI
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Badge className={(CATEGORY_COLORS[post.category] || "bg-gray-100 text-gray-700") + " text-xs"}>
              {post.category}
            </Badge>
            {canDelete && (
              <button onClick={() => deleteMutation.mutate()} className="ml-1 text-gray-300 hover:text-red-400 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <p className="mt-3 text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Image */}
      {post.image_url && (
        <div className="px-4 pb-3">
          <img src={post.image_url} alt="" className="w-full rounded-xl object-cover max-h-80" onError={e => e.target.style.display = "none"} />
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-2 border-t border-gray-50 flex items-center gap-4">
        <button
          onClick={() => likeMutation.mutate()}
          className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? "text-red-500" : "text-gray-500 hover:text-red-400"}`}
        >
          <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
          <span>{post.likes || 0}</span>
        </button>
        <button
          onClick={() => setShowComments(v => !v)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-600 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{post.comment_count || 0}</span>
          {showComments ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="px-4 pb-4 border-t border-gray-50">
          <div className="space-y-0 max-h-64 overflow-y-auto">
            {comments.map(c => <CommentItem key={c.id} comment={c} />)}
            {comments.length === 0 && <p className="text-xs text-gray-400 py-3 text-center">No comments yet. Be the first!</p>}
          </div>
          <div className="flex gap-2 mt-2">
            <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-1">
              <span className="text-xs font-bold text-green-700">
                {(currentUser?.full_name || currentUser?.email || "?")[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 flex gap-1">
              <Textarea
                placeholder="Write a comment..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                rows={1}
                className="resize-none text-sm rounded-xl border-gray-200 min-h-0 py-2"
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && commentText.trim()) { e.preventDefault(); commentMutation.mutate(commentText.trim()); } }}
              />
              <Button
                size="icon"
                className="h-9 w-9 bg-green-700 hover:bg-green-800 rounded-xl shrink-0"
                disabled={!commentText.trim() || commentMutation.isPending}
                onClick={() => commentMutation.mutate(commentText.trim())}
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
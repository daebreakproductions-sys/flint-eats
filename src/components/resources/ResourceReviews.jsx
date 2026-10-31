import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import StarRatingInput from "@/components/map/StarRatingInput";
import TimeAgo from "@/components/feed/TimeAgo";
import { toast } from "sonner";

function Stars({ value, size = "w-3.5 h-3.5" }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          className={size}
          fill={value >= n - 0.5 ? "#f59e0b" : "none"}
          stroke={value >= n - 0.5 ? "#f59e0b" : "#9ca3af"}
        />
      ))}
    </div>
  );
}

export default function ResourceReviews({ resourceId, user, compact = false }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews", resourceId],
    queryFn: () => base44.entities.Review.filter({ food_resource_id: resourceId }, "-created_date", 100),
  });

  const average = reviews.length
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
    : 0;

  const resetForm = () => {
    setShowForm(false);
    setRating(0);
    setText("");
  };

  const handleSubmit = async () => {
    if (!rating) { toast.error("Please select a star rating."); return; }
    if (!text.trim()) { toast.error("Please write a review."); return; }
    setSubmitting(true);
    await base44.entities.Review.create({
      food_resource_id: resourceId,
      rating,
      content: text.trim(),
      user_email: user.email,
      user_name: user.full_name || user.email,
    });
    await qc.invalidateQueries({ queryKey: ["reviews", resourceId] });
    setSubmitting(false);
    resetForm();
    toast.success("Review submitted!");
  };

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Stars value={average} />
          <span className="text-xs text-muted-foreground">
            {reviews.length > 0 ? `${average.toFixed(1)} · ${reviews.length} review${reviews.length === 1 ? "" : "s"}` : "No reviews yet"}
          </span>
        </div>
        {user && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs font-semibold text-green-700 hover:underline shrink-0"
          >
            Write a review
          </button>
        )}
      </div>

      {showForm && (
        <div className="rounded-xl border border-border p-3 space-y-2">
          <StarRatingInput rating={rating} onChange={setRating} />
          <Textarea
            placeholder="Share your experience with this location..."
            value={text}
            onChange={e => setText(e.target.value)}
            className="text-xs resize-none"
            rows={compact ? 2 : 3}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 h-8 text-xs bg-green-700 hover:bg-green-800 text-white"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Submitting…" : "Submit"}
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={resetForm} disabled={submitting}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className={`space-y-2 overflow-y-auto ${compact ? "max-h-48" : "max-h-72"}`}>
        {isLoading && <p className="text-xs text-muted-foreground">Loading reviews…</p>}
        {!isLoading && reviews.length === 0 && !showForm && (
          <p className="text-xs text-muted-foreground">
            {user ? "Be the first to review this location." : "Sign in to leave the first review."}
          </p>
        )}
        {reviews.map(review => (
          <div key={review.id} className="rounded-lg bg-muted px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-foreground truncate">
                {review.user_name || review.user_email?.split("@")[0]}
              </p>
              <Stars value={review.rating || 0} size="w-3 h-3" />
            </div>
            <p className="text-xs text-foreground mt-1 whitespace-pre-wrap">{review.content}</p>
            <p className="text-[11px] text-muted-foreground mt-1"><TimeAgo date={review.created_date} /></p>
          </div>
        ))}
      </div>
    </div>
  );
}
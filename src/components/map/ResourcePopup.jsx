import { useState, useEffect } from "react";
import { Phone, MapPin, Clock, Globe, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TYPE_CONFIG } from "./MapLegend";
import { base44 } from "@/api/base44Client";
import StarRatingInput from "./StarRatingInput";
import { toast } from "sonner";

export default function ResourcePopup({ resource }) {
  const cfg = TYPE_CONFIG[resource.type] || TYPE_CONFIG.Other;
  const [user, setUser] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const handleCancel = () => {
    setShowReviewForm(false);
    setRating(0);
    setReviewText("");
  };

  const handleSubmit = async () => {
    if (!rating) { toast.error("Please select a star rating."); return; }
    if (!reviewText.trim()) { toast.error("Please write a review."); return; }
    setSubmitting(true);
    await base44.entities.Review.create({
      food_resource_id: resource.id,
      rating,
      content: reviewText.trim(),
      user_email: user.email,
      user_name: user.full_name || user.email,
    });
    toast.success("Review submitted!");
    handleCancel();
    setSubmitting(false);
  };

  const handleFlag = async () => {
    toast.info("Thank you — this review has been flagged for moderation.");
  };

  return (
    <div className="w-64 text-sm">
      {/* Header — always visible */}
      <div className="flex items-start gap-2 mb-2">
        <span className="text-xl">{cfg.emoji}</span>
        <div>
          <p className="font-bold text-gray-900 leading-tight">{resource.name}</p>
          <Badge
            className="mt-0.5 text-white text-xs px-1.5 py-0"
            style={{ backgroundColor: cfg.color }}
          >
            {cfg.label}
          </Badge>
        </div>
      </div>

      {!showReviewForm ? (
        <>
          {/* Star rating display row */}
          <div className="mb-2">
            <StarRatingInput rating={0} onChange={() => {}} />
          </div>

          {resource.address && (
            <div className="flex gap-1.5 text-gray-600 mt-1">
              <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0 text-green-700" />
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(resource.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 hover:underline"
              >
                {resource.address}
              </a>
            </div>
          )}
          {resource.hours && (
            <div className="flex gap-1.5 text-gray-600 mt-1">
              <Clock className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span className="whitespace-pre-wrap">{resource.hours}</span>
            </div>
          )}
          {resource.phone && (
            <div className="flex gap-1.5 text-gray-600 mt-1">
              <Phone className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <a href={`tel:${resource.phone}`} className="text-green-700 hover:underline">{resource.phone}</a>
            </div>
          )}
          {resource.url && (
            <div className="flex gap-1.5 text-gray-600 mt-1">
              <Globe className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-green-700 hover:underline truncate">Website</a>
            </div>
          )}

          <div className="flex flex-wrap gap-1 mt-2">
            {resource.ebt_accepted && <Badge className="bg-blue-100 text-blue-800 text-xs">EBT/SNAP</Badge>}
            {resource.dufb_offered && <Badge className="bg-orange-100 text-orange-800 text-xs">Double Up $</Badge>}
            {resource.wic_accepted && <Badge className="bg-purple-100 text-purple-800 text-xs">WIC</Badge>}
          </div>

          {resource.notes && (
            <p className="mt-2 text-xs text-gray-500 border-t pt-1">{resource.notes}</p>
          )}

          {user && (
            <div className="mt-3 pt-2 border-t">
              <Button
                size="sm"
                className="w-full bg-green-700 hover:bg-green-800 h-8 text-xs"
                style={{ backgroundColor: "#1D8348" }}
                onClick={() => setShowReviewForm(true)}
              >
                ✏️ Write a Review
              </Button>
            </div>
          )}
        </>
      ) : (
        /* Review form */
        <div className="space-y-2">
          <p className="text-xs text-gray-500">Rate your experience:</p>
          <StarRatingInput rating={rating} onChange={setRating} />

          <Textarea
            placeholder="Share your experience with this location..."
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            className="text-xs h-24 resize-none"
          />

          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 h-8 text-xs text-white"
              style={{ backgroundColor: "#1D8348" }}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Submitting…" : "Submit"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-8 text-xs"
              onClick={handleCancel}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>

          <div className="flex justify-end pt-1 border-t">
            <button
              onClick={handleFlag}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              <Flag className="w-3 h-3" /> Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
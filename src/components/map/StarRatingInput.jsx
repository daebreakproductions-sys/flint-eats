import { useState } from "react";
import { Star } from "lucide-react";

export default function StarRatingInput({ rating, onChange }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none"
        >
          <Star
            className="w-6 h-6 transition-colors"
            fill={(hovered || rating) >= star ? "#f59e0b" : "none"}
            stroke={(hovered || rating) >= star ? "#f59e0b" : "#9ca3af"}
          />
        </button>
      ))}
    </div>
  );
}
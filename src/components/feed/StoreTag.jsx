import { Link } from "react-router-dom";
import { Store } from "lucide-react";

export default function StoreTag({ post }) {
  if (!post.resource_id) return null;
  return (
    <Link
      to={`/Map?id=${post.resource_id}`}
      className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-semibold text-green-800 hover:bg-green-100 transition-colors"
    >
      <Store className="w-3.5 h-3.5" />
      {post.resource_name || "Tagged store"}
    </Link>
  );
}
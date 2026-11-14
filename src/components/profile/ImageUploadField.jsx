import { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, X, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const MAX_MB = 10;

export default function ImageUploadField({ label, value, onChange, previewClassName = "w-full h-32" }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const openPicker = () => {
    if (!uploading) inputRef.current?.click();
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the same file be picked again
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`Image must be smaller than ${MAX_MB}MB`);
      return;
    }

    setUploading(true);
    try {
      const res = await base44.integrations.Core.UploadPublicFile({ file });
      onChange(res.file_url);
      toast.success("Image uploaded — don't forget to save");
    } catch (err) {
      toast.error(err?.message ? `Upload failed: ${err.message}` : "Upload failed — please try again");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
          >
            <X className="w-3.5 h-3.5" /> Remove
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
        className="hidden"
      />

      {value ? (
        <div className="relative">
          <img
            src={value}
            alt={label}
            onClick={openPicker}
            className={`${previewClassName} rounded-lg object-cover border border-gray-200 cursor-pointer`}
          />
          <button
            type="button"
            onClick={openPicker}
            disabled={uploading}
            className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/70 text-white text-xs px-3 py-1.5 backdrop-blur-sm"
          >
            {uploading
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <RefreshCw className="w-3.5 h-3.5" />}
            {uploading ? "Uploading…" : "Replace"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={openPicker}
          disabled={uploading}
          className={`${previewClassName} w-full rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              <span className="text-sm text-gray-500 mt-2">Uploading…</span>
            </>
          ) : (
            <>
              <Upload className="w-6 h-6 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600 font-medium">Tap to upload</span>
              <span className="text-xs text-gray-400">PNG, JPG up to {MAX_MB}MB</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
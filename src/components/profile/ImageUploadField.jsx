import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ImageUploadField({ label, value, onChange, previewClassName = "w-full h-32" }) {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    setUploading(true);
    try {
      const res = await base44.integrations.Core.UploadFile({ file });
      onChange(res.file_url);
      toast.success("Image uploaded successfully!");
    } catch (err) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-2 block">{label}</label>
      <div className="relative">
        {value ? (
          <div className="relative group">
            <img src={value} alt={label} className={`${previewClassName} rounded-lg object-cover border border-gray-200`} />
            <button
              onClick={() => onChange("")}
              className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className={`${previewClassName} rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition`}>
            {uploading ? (
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            ) : (
              <>
                <Upload className="w-6 h-6 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600 font-medium">Click to upload</span>
                <span className="text-xs text-gray-400">PNG, JPG up to 5MB</span>
              </>
            )}
            <input type="file" accept="image/*" onChange={handleFileSelect} disabled={uploading} className="hidden" />
          </label>
        )}
      </div>
    </div>
  );
}
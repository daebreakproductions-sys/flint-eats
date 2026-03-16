import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageCircle, Send, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// We send to a shared org inbox — using a fixed org representative email or fallback
const ORG_REP_EMAIL = "info@flinteats.org";
const ORG_REP_NAME = "Flint Eats Team";

export default function StartMessageModal({ resource, user, open, onClose }) {
  const navigate = useNavigate();
  const [text, setText] = useState("");

  const mutation = useMutation({
    mutationFn: async (content) => {
      // conversation_id is unique per user+resource pair
      const convId = `${user.email}__${resource.id}`;
      await base44.entities.Message.create({
        conversation_id: convId,
        sender_email: user.email,
        sender_name: user.full_name || user.email.split("@")[0],
        recipient_email: resource.email || ORG_REP_EMAIL,
        recipient_name: resource.name || ORG_REP_NAME,
        content,
        resource_id: resource.id,
        resource_name: resource.name,
        is_read: false,
      });
      return convId;
    },
    onSuccess: (convId) => {
      toast.success("Message sent!");
      onClose();
      navigate(`/Messages?conversation_id=${convId}`);
    },
  });

  const handleSend = () => {
    if (!text.trim()) return;
    mutation.mutate(text.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-700" />
            Message {resource?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-green-50 rounded-lg px-3 py-2">
            <Building2 className="w-4 h-4 text-green-700 shrink-0" />
            <span>Your message will be sent to <strong>{resource?.name}</strong></span>
          </div>

          <Textarea
            placeholder={`Hi! I have a question about ${resource?.name}...`}
            value={text}
            onChange={e => setText(e.target.value)}
            rows={4}
            className="resize-none text-sm"
            autoFocus
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              onClick={handleSend}
              disabled={!text.trim() || mutation.isPending}
              className="bg-green-700 hover:bg-green-800"
            >
              <Send className="w-4 h-4 mr-2" />
              {mutation.isPending ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
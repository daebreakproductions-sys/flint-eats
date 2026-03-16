import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, ArrowLeft, MessageCircle, Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

function getInitials(name) {
  return (name || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function groupConversations(messages, myEmail) {
  const map = {};
  messages.forEach(msg => {
    const id = msg.conversation_id;
    if (!map[id]) map[id] = { conversation_id: id, messages: [], resource_name: msg.resource_name, resource_id: msg.resource_id };
    map[id].messages.push(msg);
  });
  return Object.values(map).map(conv => {
    const sorted = [...conv.messages].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    const last = sorted[sorted.length - 1];
    const otherEmail = last.sender_email === myEmail ? last.recipient_email : last.sender_email;
    const otherName = last.sender_email === myEmail ? last.recipient_name : last.sender_name;
    const unread = conv.messages.filter(m => m.recipient_email === myEmail && !m.is_read).length;
    return { ...conv, messages: sorted, last, otherEmail, otherName, unread };
  }).sort((a, b) => new Date(b.last.created_date) - new Date(a.last.created_date));
}

function ConversationList({ conversations, selected, onSelect, myEmail }) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center px-4">
        <MessageCircle className="w-10 h-10 text-gray-300 mb-2" />
        <p className="text-gray-500 text-sm font-medium">No messages yet</p>
        <p className="text-gray-400 text-xs mt-1">Start a conversation from a resource profile on the Map or Directory</p>
      </div>
    );
  }
  return (
    <div className="divide-y">
      {conversations.map(conv => (
        <button
          key={conv.conversation_id}
          onClick={() => onSelect(conv)}
          className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition flex gap-3 items-start ${selected?.conversation_id === conv.conversation_id ? "bg-green-50 border-r-2 border-green-600" : ""}`}
        >
          <div className="w-9 h-9 rounded-full bg-green-700 flex items-center justify-center shrink-0 text-white text-xs font-bold">
            {getInitials(conv.otherName)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-sm text-gray-900 truncate">{conv.otherName || conv.otherEmail}</span>
              <span className="text-xs text-gray-400 shrink-0">{formatDistanceToNow(new Date(conv.last.created_date), { addSuffix: true })}</span>
            </div>
            {conv.resource_name && (
              <p className="text-xs text-green-700 flex items-center gap-1"><Building2 className="w-3 h-3" />{conv.resource_name}</p>
            )}
            <p className="text-xs text-gray-500 truncate mt-0.5">{conv.last.content}</p>
          </div>
          {conv.unread > 0 && (
            <span className="w-5 h-5 rounded-full bg-green-600 text-white text-xs flex items-center justify-center shrink-0 mt-1">{conv.unread}</span>
          )}
        </button>
      ))}
    </div>
  );
}

function MessageThread({ conv, myEmail, myName, onBack, qc }) {
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  const sendMutation = useMutation({
    mutationFn: (data) => base44.entities.Message.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["messages"] }); setText(""); },
  });

  // Mark messages as read
  useEffect(() => {
    conv.messages.filter(m => m.recipient_email === myEmail && !m.is_read).forEach(m => {
      base44.entities.Message.update(m.id, { is_read: true });
    });
  }, [conv.conversation_id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conv.messages.length]);

  const handleSend = () => {
    if (!text.trim()) return;
    sendMutation.mutate({
      conversation_id: conv.conversation_id,
      sender_email: myEmail,
      sender_name: myName,
      recipient_email: conv.otherEmail,
      recipient_name: conv.otherName,
      content: text.trim(),
      resource_id: conv.resource_id,
      resource_name: conv.resource_name,
      is_read: false,
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Thread header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-white sticky top-0 z-10">
        <button onClick={onBack} className="md:hidden text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-9 h-9 rounded-full bg-green-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {getInitials(conv.otherName)}
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-900">{conv.otherName || conv.otherEmail}</p>
          {conv.resource_name && (
            <p className="text-xs text-green-700 flex items-center gap-1"><Building2 className="w-3 h-3" />{conv.resource_name}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {conv.messages.map(msg => {
          const isMe = msg.sender_email === myEmail;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${isMe ? "bg-green-700 text-white rounded-br-sm" : "bg-white text-gray-800 rounded-bl-sm border"}`}>
                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-xs mt-1 ${isMe ? "text-green-200" : "text-gray-400"}`}>
                  {formatDistanceToNow(new Date(msg.created_date), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-white px-4 py-3 flex gap-2 items-end">
        <Textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message..."
          rows={2}
          className="resize-none text-sm rounded-xl flex-1"
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
        />
        <Button onClick={handleSend} disabled={!text.trim() || sendMutation.isPending} className="bg-green-700 hover:bg-green-800 h-10 px-4 shrink-0">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default function Messages() {
  const qc = useQueryClient();
  const [user, setUser] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: messages = [] } = useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      if (!user) return [];
      const [sent, received] = await Promise.all([
        base44.entities.Message.filter({ sender_email: user.email }, "-created_date", 500),
        base44.entities.Message.filter({ recipient_email: user.email }, "-created_date", 500),
      ]);
      return [...sent, ...received];
    },
    enabled: !!user,
    refetchInterval: 15000,
  });

  const conversations = user ? groupConversations(messages, user.email) : [];
  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0);

  // Auto-select conversation from URL param (e.g. from Message button)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const convId = params.get("conversation_id");
    if (convId && conversations.length > 0) {
      const found = conversations.find(c => c.conversation_id === convId);
      if (found) setSelected(found);
    }
  }, [conversations.length]);

  if (!user) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-4 border-green-200 border-t-green-700 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-56px)] flex border-x bg-white shadow-sm">
      {/* Sidebar */}
      <div className={`w-full md:w-80 border-r flex flex-col shrink-0 ${selected ? "hidden md:flex" : "flex"}`}>
        <div className="px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-gray-900 text-lg">Messages</h2>
            {totalUnread > 0 && <Badge className="bg-green-600 text-white text-xs">{totalUnread}</Badge>}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ConversationList conversations={conversations} selected={selected} onSelect={setSelected} myEmail={user.email} />
        </div>
      </div>

      {/* Thread panel */}
      <div className={`flex-1 flex flex-col ${selected ? "flex" : "hidden md:flex"}`}>
        {selected ? (
          <MessageThread
            conv={selected}
            myEmail={user.email}
            myName={user.full_name || user.email.split("@")[0]}
            onBack={() => setSelected(null)}
            qc={qc}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <MessageCircle className="w-14 h-14 text-gray-200 mb-3" />
            <p className="text-gray-400 font-medium">Select a conversation</p>
            <p className="text-gray-300 text-sm mt-1">Or start one from a resource on the Map or Directory</p>
          </div>
        )}
      </div>
    </div>
  );
}
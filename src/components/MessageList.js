import { useState } from "react";
import toast from "react-hot-toast";

export default function MessageList({ messages }) {
  const [replies, setReplies] = useState({});
  const [sentReplies, setSentReplies] = useState({});

  const handleReply = async (msgId, senderId, itemId) => {
    const replyText = replies[msgId]?.trim();
    if (!replyText) return;

    try {
      const res = await fetch("http://localhost:5000/api/reply", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiver_id: senderId,
          item_id: itemId,
          message: replyText,
        }),
      });

      if (res.ok) {
        toast.success("Reply sent!");

        // Store the sent reply
        setSentReplies((prev) => ({
          ...prev,
          [msgId]: [
            ...(prev[msgId] || []),
            {
              text: replyText,
              timestamp: new Date().toLocaleString(),
            },
          ],
        }));

        // Clear the input
        setReplies((prev) => ({ ...prev, [msgId]: "" }));
      } else {
        const err = await res.json();
        toast.error(err?.error || "Failed to send reply.");
      }
    } catch (error) {
      console.error("Reply error:", error);
      toast.error("Server error while sending reply.");
    }
  };

  if (!messages.length)
    return <p className="text-gray-500 text-sm italic">No messages yet.</p>;

  return (
    <div className="space-y-6">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
        >
          <div className="mb-2">
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">From:</span>{" "}
              {msg.sender_name}
            </p>
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">Regarding Item:</span>{" "}
              {msg.item_name}
            </p>
          </div>

          <div className="mb-4">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-gray-800 text-sm leading-relaxed">
              {msg.message}
            </div>
            <div className="text-xs text-gray-400 mt-1">{msg.sent_at}</div>
          </div>

          {sentReplies[msg.id]?.length > 0 && (
            <div className="mb-4 space-y-3">
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                Your Replies
              </div>
              {sentReplies[msg.id].map((reply, index) => (
                <div key={index} className="flex justify-end">
                  <div className="max-w-xs lg:max-w-md">
                    <div className="bg-blue-600 text-white rounded-xl px-4 py-2 text-sm">
                      {reply.text}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 text-right">
                      {reply.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <textarea
            placeholder="Write your reply..."
            className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
            rows="3"
            value={replies[msg.id] || ""}
            onChange={(e) =>
              setReplies((prev) => ({ ...prev, [msg.id]: e.target.value }))
            }
          />

          <div className="text-right mt-3">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handleReply(msg.id, msg.sender_id, msg.item_id)}
              disabled={!replies[msg.id]?.trim()}
            >
              Send Reply
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

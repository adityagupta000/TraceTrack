import { useState } from "react";

export default function MessageList({ messages }) {
  const [replies, setReplies] = useState({});

  const handleReply = async (msgId, senderId, itemId) => {
    const replyText = replies[msgId];
    if (!replyText) return;

    await fetch("/reply_message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        receiver_id: senderId,
        item_id: itemId,
        reply: replyText,
      }),
    });

    setReplies((r) => ({ ...r, [msgId]: "" }));
    alert("Reply sent.");
  };

  if (!messages.length)
    return <p className="text-gray-500">No messages yet.</p>;

  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className="border p-4 rounded shadow-sm bg-white space-y-2"
        >
          <h4 className="font-bold">From: {msg.sender_name}</h4>
          <p className="text-sm">Item: {msg.item_name}</p>
          <p>{msg.message}</p>
          <textarea
            placeholder="Reply..."
            className="w-full border rounded p-2 text-sm"
            rows="2"
            value={replies[msg.id] || ""}
            onChange={(e) =>
              setReplies((prev) => ({ ...prev, [msg.id]: e.target.value }))
            }
          />
          <button
            className="mt-2 px-3 py-1 text-sm bg-blue-600 text-white rounded"
            onClick={() => handleReply(msg.id, msg.sender_id, msg.item_id)}
          >
            Send Reply
          </button>
        </div>
      ))}
    </div>
  );
}

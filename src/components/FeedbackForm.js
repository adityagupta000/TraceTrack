import { useState } from "react";

export default function FeedbackForm() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/submit_feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ feedback: text }),
    });

    if (res.ok) {
      setStatus("Thank you for your feedback!");
      setText("");
    } else {
      setStatus("Error submitting feedback.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        className="w-full border rounded p-2"
        rows="3"
        required
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your feedback..."
      />
      <button className="bg-green-600 text-white px-4 py-2 rounded">
        Submit
      </button>
      {status && <p className="text-sm text-gray-600 mt-2">{status}</p>}
    </form>
  );
}

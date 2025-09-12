import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ItemTable from "../components/ItemTable";
import MessageList from "../components/MessageList";
import ClaimsTable from "../components/ClaimsTable";

export default function HomePage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/dashboard", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          navigate("/");
          return;
        }

        const data = await res.json();

        setName(data.user.name);
        setRole(data.user.role);
        setItems(data.items || []);
        setClaims(data.claims || []);
        setMessages(data.messages || []);
      } catch (err) {
        console.error("Failed to fetch dashboard:", err);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [navigate]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    try {
      const res = await fetch("http://localhost:5000/api/feedback", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ feedback: feedbackText.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setFeedbackMessage(data.message || "Thank you for your feedback!");
        setFeedbackText("");
      } else {
        const err = await res.json();
        setFeedbackMessage(err.error || "Failed to submit feedback.");
      }
    } catch (err) {
      console.error(err);
      setFeedbackMessage("Something went wrong while submitting feedback.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading your dashboard...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">Welcome, {name}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Here’s an overview of your account and activity.
        </p>
      </div>

      <section className="bg-white p-6 rounded-2xl shadow-sm border">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">My Registered Items</h2>
        <ItemTable items={items} />
      </section>

      <section className="bg-white p-6 rounded-2xl shadow-sm border">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">My Claims</h2>
        <ClaimsTable claims={claims} />
      </section>

      <section className="bg-white p-6 rounded-2xl shadow-sm border">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Messages</h2>
        <MessageList messages={messages} />
      </section>

      {role !== "admin" && (
        <section className="bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Platform Feedback</h2>
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <textarea
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Write your feedback here..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              required
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition"
              >
                Submit Feedback
              </button>
            </div>
          </form>
          {feedbackMessage && (
            <div className="mt-3 text-sm text-center text-green-600">
              {feedbackMessage}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const [showMessageBox, setShowMessageBox] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    fetchUser();
    fetchItems();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/user", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
      }
    } catch (err) {
      console.error("Failed to fetch user");
    }
  };

  const fetchItems = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/items", {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch items");

      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClaim = async (itemId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/items/${itemId}/claim`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (res.ok) {
        setMessage("✅ Item claimed successfully!");
        fetchItems();
      } else {
        const data = await res.json();
        setMessage(`❌ ${data.error || "Failed to claim item."}`);
      }
    } catch (err) {
      console.error("Claim failed", err);
      setMessage("❌ Something went wrong.");
    }
  };

  const handleSendMessage = async () => {
    if (!currentItem || !messageText.trim()) return;

    try {
      const res = await fetch("http://localhost:5000/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          receiver_id: currentItem.created_by,
          item_id: currentItem.id,
          message: messageText.trim(),
        }),
      });

      if (res.ok) {
        setMessage("✅ Message sent!");
      } else {
        const err = await res.json();
        setMessage(`❌ ${err.error || "Failed to send message."}`);
      }
    } catch (err) {
      console.error("Message failed", err);
      setMessage("❌ Something went wrong.");
    } finally {
      setShowMessageBox(false);
      setMessageText("");
      setCurrentItem(null);
    }
  };

  const filteredItems = items.filter((item) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      item.name.toLowerCase().includes(searchText) ||
      item.location.toLowerCase().includes(searchText) ||
      item.description.toLowerCase().includes(searchText);

    const matchesFilter =
      filter === "all" ? true : item.status.toLowerCase() === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-blue-600 text-center">
        Lost and Found Items
      </h1>

      {message && (
        <div className="text-sm text-center text-green-700">{message}</div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mt-4">
        <input
          type="text"
          placeholder="Search by name, location, or description..."
          className="w-full sm:w-1/2 px-4 py-2 border rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="all">All</option>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
          <option value="claimed">Claimed</option>
        </select>
      </div>

      {/* Items Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="border rounded-lg overflow-hidden shadow bg-white flex flex-col"
          >
            {item.image && (
              <img
                src={`http://localhost:5000/static/${item.image}`}
                alt={item.name}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-semibold">{item.name}</h2>
                <p className="text-sm text-gray-500">{item.location}</p>
                <p className="text-sm">{item.description}</p>
              </div>

              <div className="text-xs text-gray-500 mt-1">
                <p>
                  Posted by: <strong>{item.creator_name}</strong>
                </p>
                <p>
                  On: <span>{new Date(item.created_at).toLocaleString()}</span>
                </p>
              </div>

              <div className="mt-2">
                <span
                  className={`inline-block text-xs px-2 py-1 rounded ${
                    item.status === "found"
                      ? "bg-green-100 text-green-700"
                      : item.status === "lost"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {item.status.toUpperCase()}
                </span>
              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-3 space-y-1">
                {item.status === "claimed" ? (
                  <p className="text-sm text-red-700 mt-1">
                    This item has been claimed
                  </p>
                ) : currentUser && item.created_by === currentUser.id ? (
                  <p className="text-sm text-gray-700 mt-1 italic">
                    You posted this item
                  </p>
                ) : item.status === "found" ? (
                  <>
                    <button
                      onClick={() => handleClaim(item.id)}
                      className="w-full text-sm bg-blue-600 text-white py-1 rounded hover:bg-blue-700 transition"
                    >
                      Claim
                    </button>
                    <button
                      onClick={() => {
                        setCurrentItem(item);
                        setShowMessageBox(true);
                      }}
                      className="w-full text-sm bg-gray-700 text-white py-1 rounded hover:bg-gray-800 transition"
                    >
                      Send Message
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <p className="text-center text-gray-500 mt-10">No items found.</p>
      )}

      {/* Message Modal */}
      {showMessageBox && currentItem && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-blue-600">Send Message</h3>
            <p className="text-sm text-gray-600">
              To: <strong>{currentItem.creator_name}</strong> <br />
              Item: <strong>{currentItem.name}</strong>
            </p>
            <textarea
              rows={4}
              className="w-full border rounded px-3 py-2"
              placeholder="Type your message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowMessageBox(false)}
                className="text-sm px-4 py-1 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                className="text-sm px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

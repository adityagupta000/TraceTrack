import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminTable from "../components/AdminTable";

export default function AdminPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [message, setMessage] = useState("");

  // Step 1: Fetch user and validate admin access
  const validateAdminAccess = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/user", {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Not authenticated");

      const user = await res.json();

      if (!user || user.role !== "admin") {
        navigate("/"); // not admin, redirect
        return false;
      }

      return true;
    } catch (err) {
      console.warn("Admin access denied:", err);
      navigate("/"); // redirect if not admin
      return false;
    }
  };

  // Step 2: Load admin dashboard data
  const fetchAdminData = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/dashboard", {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to load dashboard");

      const data = await res.json();
      setItems(data.items || []);
      setClaims(data.claims || []);
      setUsers(data.users || []);
      setFeedback(data.feedback || []);
    } catch (err) {
      console.error("Admin fetch error", err);
      setMessage("❌ Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const isAdmin = await validateAdminAccess();
      if (isAdmin) await fetchAdminData();
    };
    init();
  }, []);

  // Step 3: Handle item/user/claim/feedback deletion
  const handleDelete = async (type, id) => {
    const url = `http://localhost:5000/api/admin/${type}s/${id}`;
    const res = await fetch(url, {
      method: "DELETE",
      credentials: "include",
    });

    if (res.ok) {
      setMessage(`✅ ${type} deleted successfully.`);
      await fetchAdminData(); // reload fresh data
    } else {
      setMessage(`❌ Failed to delete ${type}.`);
    }
  };

  // Step 4: Show loader until page is ready
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        🔐 Verifying admin access...
      </div>
    );
  }

  // Step 5: Render admin page
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      <h1 className="text-2xl font-bold text-center text-blue-600">
        Admin Dashboard
      </h1>

      {message && (
        <div className="text-center text-sm text-green-700">{message}</div>
      )}

      {/* Items Table */}
      <AdminTable
        title="Registered Items"
        type="item"
        data={items}
        headers={["Name", "Location", "Status", "Actions"]}
        rowRenderer={(item) => [
          item.name,
          item.location,
          item.status,
          <button
            onClick={() => handleDelete("item", item.id)}
            className="text-red-600 hover:underline text-sm"
          >
            Delete
          </button>,
        ]}
      />

      {/* Claims Table */}
      <AdminTable
        title="Claims"
        type="claim"
        data={claims}
        headers={["Item", "Claimer", "Location", "Actions"]}
        rowRenderer={(claim) => [
          claim.item_name,
          claim.claimer_name || claim.claimed_by,
          claim.location,
          <button
            onClick={() => handleDelete("claim", claim.id)}
            className="text-red-600 hover:underline text-sm"
          >
            Delete
          </button>,
        ]}
      />

      {/* Users Table */}
      <AdminTable
        title="Users"
        type="user"
        data={users}
        headers={["Name", "Email", "Role", "Actions"]}
        rowRenderer={(user) => [
          user.name,
          user.email,
          user.role || "user",
          <button
            onClick={() => handleDelete("user", user.id)}
            className="text-red-600 hover:underline text-sm"
          >
            Delete
          </button>,
        ]}
      />

      {/* Feedback Table */}
      <AdminTable
        title="Feedback"
        type="feedback"
        data={feedback}
        headers={["User", "Message", "Actions"]}
        rowRenderer={(fb) => [
          fb.user_name || "Anonymous",
          fb.feedback_text,
          <button
            onClick={() => handleDelete("feedback", fb.id)}
            className="text-red-600 hover:underline text-sm"
          >
            Delete
          </button>,
        ]}
      />
    </div>
  );
}

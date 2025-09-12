import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminTable from "../components/AdminTable";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export default function AdminPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState([]);

  // 🔐 Step 1: Validate Admin Access
  const validateAdminAccess = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/user", {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Not authenticated");

      const user = await res.json();
      if (!user || user.role !== "admin") {
        toast.error("Access denied. Redirecting...");
        navigate("/");
        return false;
      }
      return true;
    } catch (err) {
      toast.error("Error validating admin access.");
      navigate("/");
      return false;
    }
  };

  // 📦 Step 2: Fetch Admin Dashboard Data
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
      toast.error("Failed to load admin data.");
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

  // 🗑️ Step 3: Delete Handler with Confirmation
  const handleDelete = async (type, id) => {
    const confirmed = await MySwal.fire({
      title: `Delete this ${type}?`,
      text: `This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!confirmed.isConfirmed) return;

    let url;
    if (type === "feedback") {
      url = `http://localhost:5000/api/admin/feedback/${id}`;
    } else {
      url = `http://localhost:5000/api/admin/${type}s/${id}`;
    }

    try {
      const res = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        toast.success(
          `${type.charAt(0).toUpperCase() + type.slice(1)} deleted.`
        );
        await fetchAdminData();
      } else {
        const data = await res.json();
        toast.error(data?.error || ` Failed to delete ${type}.`);
      }
    } catch (err) {
      toast.error(`Error deleting ${type}.`);
    }
  };

  // ⏳ Step 4: Show loader while validating
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Verifying admin access...
      </div>
    );
  }

  // 🎯 Step 5: Render Admin Dashboard
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      <Toaster position="top-center w-half" />

      <h1 className="text-2xl font-bold text-center text-blue-600 mb-4">
        Admin Dashboard
      </h1>

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

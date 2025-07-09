import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Header() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/user", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (loading) return null;

  return (
    <header className="bg-blue-600 text-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to={user?.role === "admin" ? "/admin" : "/home"}>
          <h1 className="text-lg font-bold">🔍 Lost & Found</h1>
        </Link>

        {user ? (
          <nav className="flex items-center gap-4 text-sm">
            {/* ✅ Show to all users including admin */}
            <Link
              to="/register-item"
              className="hover:underline hover:text-gray-100"
            >
              Register Item
            </Link>
            <Link
              to="/lost-found-items"
              className="hover:underline hover:text-gray-100"
            >
              Browse Items
            </Link>

            {/* ✅ Show admin dashboard only if role is admin */}
            {user.role === "admin" && (
              <Link to="/admin" className="hover:underline hover:text-gray-100">
                Admin Dashboard
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-100 transition"
            >
              Logout
            </button>
          </nav>
        ) : (
          <nav className="flex gap-3 text-sm">
            <Link to="/" className="hover:underline">
              Login
            </Link>
            <Link to="/register" className="hover:underline">
              Register
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}

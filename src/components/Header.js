import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Header() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    <>
      <header className=" text-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to={user?.role === "admin" ? "/admin" : "/home"}>
            <h1 className="text-2xl font-bold">Lost & Found</h1>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {/* Home link (always visible) */}
            <Link to="/home" className="hover:underline">
              Home
            </Link>

            {user ? (
              <>
                <Link to="/register-item" className="hover:underline">
                  Register Item
                </Link>
                <Link to="/lost-found-items" className="hover:underline">
                  Browse Items
                </Link>
                {user.role === "admin" && (
                  <Link to="/admin" className="hover:underline">
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/" className="hover:underline">
                  Login
                </Link>
                <Link to="/register" className="hover:underline">
                  Register
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-opacity-40 z-40"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden`}
      >
        <div className="p-4 flex items-center justify-between border-b">
          <h2 className="text-lg font-bold text-blue-600">Menu</h2>
          <button
            className="text-gray-600"
            onClick={() => setSidebarOpen(false)}
          >
            close
          </button>
        </div>
        <div className="flex flex-col gap-4 p-4 text-sm ">
          {user ? (
            <>
              <Link to="/register-item" onClick={() => setSidebarOpen(false)}>
                Register Item
              </Link>
              <Link
                to="/lost-found-items"
                onClick={() => setSidebarOpen(false)}
              >
                Browse Items
              </Link>
              {user.role === "admin" && (
                <Link to="/admin" onClick={() => setSidebarOpen(false)}>
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  setSidebarOpen(false);
                }}
                className="text-left text-red-600 hover:underline"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/" onClick={() => setSidebarOpen(false)}>
                Login
              </Link>
              <Link to="/register" onClick={() => setSidebarOpen(false)}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}

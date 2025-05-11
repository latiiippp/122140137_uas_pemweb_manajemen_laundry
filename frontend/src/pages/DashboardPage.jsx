import { useState } from "react";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Simple header */}
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            Menu
          </button>
          <h1>Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-2 py-1"
          >
            Logout
          </button>
        </header>

        {/* Page content */}
        <main className="p-4">
          <div className="bg-white p-4 shadow">
            <h2>Username: {user?.username}</h2>
            <p>Role: {user?.role}</p>
          </div>
        </main>
      </div>
    </div>
  );
}

import React from "react";

export default function DashboardHeader({ onToggleSidebar, onLogout }) {
  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <button className="lg:hidden" onClick={onToggleSidebar}>
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          ></path>
        </svg>
      </button>
      <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
      <button
        onClick={onLogout}
        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
      >
        Logout
      </button>
    </header>
  );
}

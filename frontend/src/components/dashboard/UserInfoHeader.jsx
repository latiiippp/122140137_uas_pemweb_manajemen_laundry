import React from "react";

export default function UserInfoHeader({ user, onNewOrder }) {
  return (
    <div className="bg-white p-4 shadow rounded-lg mb-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-800">
            Selamat datang, {user?.username}
          </h2>
          <p className="text-sm text-gray-600">Role: {user?.role}</p>
        </div>
        <button
          onClick={onNewOrder}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            ></path>
          </svg>
          Buat Pesanan Baru
        </button>
      </div>
    </div>
  );
}

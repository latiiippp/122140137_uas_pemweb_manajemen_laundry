import React from "react";

export default function UserProfile({ user }) {
  return (
    <div className="bg-blue-50 p-4 border-b border-blue-100">
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
          {user?.username?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div className="ml-3">
          <p className="font-medium text-gray-800">
            {user?.username || "User"}
          </p>
          <div className="flex items-center">
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                user?.role === "admin"
                  ? "bg-yellow-200 text-yellow-800"
                  : "bg-blue-200 text-blue-800"
              }`}
            >
              {user?.role || "Role"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

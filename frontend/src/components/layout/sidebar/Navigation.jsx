import React from "react";
import { Link } from "react-router-dom";

export default function Navigation({ items, user, activePath }) {
  return (
    <nav className="mt-4 px-3">
      <ul className="space-y-2">
        {items.map(
          (item) =>
            item.access.includes(user?.role) && (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-2.5 rounded-lg transition-all ${
                    activePath === item.path
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "text-gray-700 hover:bg-blue-50"
                  }`}
                >
                  <span className="mr-3 text-blue-500">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            )
        )}
      </ul>
    </nav>
  );
}

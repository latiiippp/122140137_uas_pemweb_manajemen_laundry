import { useState } from "react";
import { AuthContext } from "./context";

// Dummy users for testing
const DUMMY_USERS = [
  { username: "admin", password: "admin123", role: "admin" },
  { username: "karyawan", password: "karyawan123", role: "karyawan" },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (credentials) => {
    return new Promise((resolve, reject) => {
      // Simulate API delay
      setTimeout(() => {
        // Find matching user
        const matchedUser = DUMMY_USERS.find(
          (u) =>
            u.username === credentials.username &&
            u.password === credentials.password
        );

        if (matchedUser) {
          // Create user object without password
          const userData = {
            username: matchedUser.username,
            role: matchedUser.role,
          };

          // Store in localStorage and state
          localStorage.setItem("user", JSON.stringify(userData));
          setUser(userData);
          resolve(userData);
        } else {
          reject(new Error("Invalid username or password"));
        }
      }, 800); // Simulate network delay
    });
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  // Check for existing user in localStorage on app load
  useState(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        localStorage.removeItem("user");
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

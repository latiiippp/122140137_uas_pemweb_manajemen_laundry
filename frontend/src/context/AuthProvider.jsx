import { useState, useEffect } from "react";
import { AuthContext } from "./authContext";
import { DUMMY_USERS } from "../data/users";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (credentials) => {
    return new Promise((resolve, reject) => {
      // Simulasi API delay
      setTimeout(() => {
        // Cari user yang cocok dari data terpisah
        const matchedUser = DUMMY_USERS.find(
          (u) =>
            u.username === credentials.username &&
            u.password === credentials.password
        );

        if (matchedUser) {
          // Buat objek user tanpa password untuk keamanan
          const userData = {
            username: matchedUser.username,
            role: matchedUser.role,
          };

          // Simpan di sessionStorage (bukan localStorage) dan state
          sessionStorage.setItem("user", JSON.stringify(userData));
          setUser(userData);
          resolve(userData);
        } else {
          reject(new Error("Invalid credentials"));
        }
      }, 800);
    });
  };

  const logout = () => {
    sessionStorage.removeItem("user");
    setUser(null);
  };

  // Auto login dari sessionStorage saat aplikasi dimuat
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from sessionStorage", e);
        sessionStorage.removeItem("user");
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

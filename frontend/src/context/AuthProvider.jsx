import React, { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./authContext";
import api from "../services/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Hanya untuk initial load

  useEffect(() => {
    const storedToken = sessionStorage.getItem("token");
    const storedUserDetails = sessionStorage.getItem("user_details");
    if (storedToken && storedUserDetails) {
      try {
        const parsedUserDetails = JSON.parse(storedUserDetails);
        setUser(parsedUserDetails);
        // Jika Anda menggunakan instance axios global (api.js) untuk header Authorization:
        // api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } catch (e) {
        console.error("Failed to parse user_details from sessionStorage", e);
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user_details");
      }
    }
    setLoading(false); // Selesai loading awal
  }, []);

  const login = async (credentials) => {
    // Tidak perlu setLoading(true) di sini, LoginPage sudah punya state loading sendiri
    try {
      const response = await api.post("/login", credentials);
      const { token, user: userDetails } = response.data;

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user_details", JSON.stringify(userDetails));
      setUser(userDetails);

      // Jika Anda menggunakan instance axios global (api.js) untuk header Authorization:
      // api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Tidak perlu setLoading(false) di sini
      return userDetails;
    } catch (error) {
      // Tidak perlu setLoading(false) di sini
      console.error(
        "Login failed:",
        error.response?.data?.message || error.message
      );
      throw new Error(
        error.response?.data?.message ||
          "Login gagal. Periksa kembali username dan password Anda."
      );
    }
  };

  const logout = useCallback(() => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user_details");
    setUser(null);
    // Jika Anda menggunakan instance axios global (api.js) untuk header Authorization:
    // delete api.defaults.headers.common['Authorization'];
    // Bisa tambahkan navigate('/') di sini jika logout selalu redirect ke landing page
    // import { useNavigate } from 'react-router-dom'; (tapi AuthProvider tidak ideal untuk navigasi langsung)
    // Lebih baik navigasi dilakukan di komponen yang memanggil logout.
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user, // Benar, ini akan update saat user berubah
        loading, // Ini adalah loading untuk pengecekan auth awal
      }}
    >
      {/* Render children setelah loading awal selesai */}
      {!loading && children}
    </AuthContext.Provider>
  );
}

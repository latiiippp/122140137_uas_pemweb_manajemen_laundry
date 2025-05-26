import { useState, useEffect } from "react";
import { AuthContext } from "./authContext";
import api from "../services/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = sessionStorage.getItem("token");
    const storedUserDetails = sessionStorage.getItem("user_details");
    if (storedToken && storedUserDetails) {
      try {
        setUser(JSON.parse(storedUserDetails));
      } catch (e) {
        console.error("Failed to parse user_details from sessionStorage", e);
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user_details");
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await api.post("/login", credentials);
      const { token, user: userDetails } = response.data;

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user_details", JSON.stringify(userDetails));
      setUser(userDetails);
      setLoading(false);
      return userDetails;
    } catch (error) {
      setLoading(false);
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

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user_details");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

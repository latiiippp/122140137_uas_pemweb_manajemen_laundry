import { useState, useEffect, useCallback } from "react";
import { UserContext } from "./userContext";
import api from "../services/api";

// Provider component
export function UserProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true); // Untuk loading awal
  const [error, setError] = useState(null); // Untuk menangani error API

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/users");
      setUsers(response.data.users || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError(err.response?.data?.message || "Gagal mengambil data pengguna.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Fungsi untuk menambah pengguna baru
  const addUser = async (userData) => {
    setError(null);
    try {
      const response = await api.post("/users", userData);
      fetchUsers();
      return response.data;
    } catch (err) {
      console.error("Failed to add user:", err);
      setError(err.response?.data?.message || "Gagal menambah pengguna.");
      throw err;
    }
  };

  // Fungsi untuk memperbarui pengguna
  const updateUser = async (userId, updatedData) => {
    setError(null);
    try {
      const response = await api.put(`/users/${userId}`, updatedData); //
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId
            ? { ...user, ...(response.data.user || response.data) }
            : user
        )
      );
      return response.data;
    } catch (err) {
      console.error("Failed to update user:", err);
      setError(err.response?.data?.message || "Gagal memperbarui pengguna.");
      throw err;
    }
  };

  // Fungsi untuk menghapus pengguna
  const deleteUser = async (userId) => {
    setError(null);
    try {
      await api.delete(`/users/${userId}`);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    } catch (err) {
      console.error("Failed to delete user:", err);
      setError(err.response?.data?.message || "Gagal menghapus pengguna.");
      throw err;
    }
  };

  return (
    <UserContext.Provider
      value={{
        users,
        loading,
        error,
        fetchUsers,
        addUser,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

import { useState, useEffect, useCallback, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "./authContext";
import { UserContext } from "./userContext";
export function UserProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token: authToken } = useContext(AuthContext);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/users");
      setUsers(response.data.users || response.data || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      if (err.response?.status !== 401) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Gagal mengambil data pengguna."
        );
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const tokenToUse = authToken || sessionStorage.getItem("token");

    if (tokenToUse) {
      fetchUsers();
    } else {
      setLoading(false);
      setUsers([]);
    }
  }, [fetchUsers, authToken]);

  const addUser = async (userData) => {
    setError(null);
    try {
      const response = await api.post("/users", userData);
      await fetchUsers();
      return response.data;
    } catch (err) {
      console.error("Failed to add user:", err);
      setError(
        err.response?.data?.message || err.message || "Gagal menambah pengguna."
      );
      throw err;
    }
  };

  // Fungsi untuk memperbarui pengguna
  const updateUser = async (userId, updatedData) => {
    setError(null);
    try {
      const response = await api.put(`/users/${userId}`, updatedData);
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
      setError(
        err.response?.data?.message ||
          err.message ||
          "Gagal memperbarui pengguna."
      );
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
      setError(
        err.response?.data?.message ||
          err.message ||
          "Gagal menghapus pengguna."
      );
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

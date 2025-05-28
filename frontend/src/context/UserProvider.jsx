import React, { useState, useEffect, useCallback, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "./authContext"; // Pastikan path ini benar
import { UserContext } from "./userContext"; // Pastikan path ini benar

export function UserProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true); // Loading awal untuk user
  const [error, setError] = useState(null);
  const { isAuthenticated, user } = useContext(AuthContext); // Dapatkan user dan status auth

  const fetchUsers = useCallback(async () => {
    // 1. Periksa apakah pengguna terautentikasi dan ada objek user
    if (!isAuthenticated || !user) {
      setUsers([]);
      setLoading(false); // Selesai loading jika tidak ada auth
      return;
    }

    // 2. Periksa peran pengguna SEBELUM melakukan fetch
    if (user.role !== "admin") {
      setUsers([]); // Kosongkan data users jika bukan admin
      setLoading(false); // Selesai loading
      // Tidak perlu setError di sini karena ini adalah perilaku yang diharapkan, bukan error aplikasi.
      // console.log("UserProvider: Pengguna bukan admin, tidak mengambil daftar semua pengguna.");
      return; // Hentikan eksekusi jika bukan admin
    }

    // Hanya lanjutkan jika admin
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/users");
      setUsers(response.data.users || response.data || []);
    } catch (err) {
      console.error("UserProvider: Failed to fetch users:", err);
      // Jangan set error jika 403 karena ini sudah ditangani oleh pengecekan role di atas
      // atau jika memang ada error lain selain 401/403
      if (err.response?.status !== 401 && err.response?.status !== 403) {
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
  }, [isAuthenticated, user]); // fetchUsers akan dibuat ulang jika isAuthenticated atau user berubah

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); // Panggil fetchUsers saat fungsi fetchUsers (atau dependensinya) berubah

  const addUser = async (userData) => {
    if (!isAuthenticated || (user && user.role !== "admin")) {
      // Hanya admin yang bisa tambah user
      throw new Error("Hanya admin yang dapat menambah pengguna.");
    }
    setError(null);
    try {
      const response = await api.post("/users", userData);
      await fetchUsers(); // Muat ulang users setelah menambah (hanya jika admin)
      return response.data;
    } catch (err) {
      console.error("UserProvider: Failed to add user:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Gagal menambah pengguna.";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateUser = async (userId, updatedData) => {
    if (!isAuthenticated || (user && user.role !== "admin")) {
      // Hanya admin yang bisa update user
      throw new Error("Hanya admin yang dapat memperbarui pengguna.");
    }
    setError(null);
    try {
      const response = await api.put(`/users/${userId}`, updatedData);
      // Update state lokal atau muat ulang semua
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === userId
            ? { ...u, ...(response.data.user || response.data) }
            : u
        )
      );
      return response.data;
    } catch (err) {
      console.error("UserProvider: Failed to update user:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Gagal memperbarui pengguna.";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteUser = async (userId) => {
    if (!isAuthenticated || (user && user.role !== "admin")) {
      // Hanya admin yang bisa hapus user
      throw new Error("Hanya admin yang dapat menghapus pengguna.");
    }
    setError(null);
    try {
      await api.delete(`/users/${userId}`);
      setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId));
    } catch (err) {
      console.error("UserProvider: Failed to delete user:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Gagal menghapus pengguna.";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return (
    <UserContext.Provider
      value={{
        users,
        loading,
        error,
        fetchUsers, // Mungkin tidak perlu diekspos jika hanya dipanggil internal
        addUser,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

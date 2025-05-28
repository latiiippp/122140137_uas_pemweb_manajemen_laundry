import React, { useState, useEffect, useCallback, useContext } from "react";
import { OrderContext } from "./orderContext"; // Pastikan impor ini benar dari file orderContext.js
import api from "../services/api";
import { AuthContext } from "./authContext"; // Impor AuthContext

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true); // Loading untuk data pesanan
  const [error, setError] = useState(null);
  const { isAuthenticated, user } = useContext(AuthContext); // Gunakan isAuthenticated dan user dari AuthContext

  // Fungsi untuk memuat pesanan dari backend
  const loadOrders = useCallback(async () => {
    // Hanya muat pesanan jika pengguna terautentikasi dan user object ada
    if (!isAuthenticated || !user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Asumsi instance 'api' sudah dikonfigurasi untuk mengirim token
      const response = await api.get("/pesanan");
      setOrders(
        response.data.pesanan || response.data.orders || response.data || []
      );
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      if (err.response?.status !== 401) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.detail ||
            err.message ||
            "Gagal memuat data pesanan."
        );
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]); // loadOrders akan dibuat ulang jika isAuthenticated atau user berubah

  // useEffect untuk memanggil loadOrders saat komponen mount atau isAuthenticated/user berubah
  useEffect(() => {
    loadOrders();
  }, [loadOrders]); // Panggil loadOrders saat fungsi loadOrders (atau dependensinya) berubah

  // Fungsi untuk menambah pesanan baru ke backend
  const addOrder = async (newOrderData) => {
    if (!isAuthenticated) throw new Error("Autentikasi diperlukan.");
    setError(null);
    try {
      const response = await api.post("/pesanan", newOrderData);
      await loadOrders(); // Muat ulang pesanan setelah menambah
      return response.data;
    } catch (err) {
      console.error("Failed to add order:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Gagal menambah pesanan.";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Fungsi untuk update catatan pesanan di backend
  const updateOrderNotes = async (orderId, notes) => {
    if (!isAuthenticated) throw new Error("Autentikasi diperlukan.");
    setError(null);
    try {
      const response = await api.put(`/pesanan/${orderId}`, { catatan: notes });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? { ...order, ...(response.data.pesanan || response.data) }
            : order
        )
      );
      return response.data;
    } catch (err) {
      console.error("Failed to update order notes:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Gagal memperbarui catatan pesanan.";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Fungsi untuk update status pesanan di backend
  const updateOrderStatus = async (orderId, newStatus) => {
    if (!isAuthenticated) throw new Error("Autentikasi diperlukan.");
    setError(null);
    try {
      const response = await api.put(`/pesanan/${orderId}`, {
        status: newStatus,
      });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? { ...order, ...(response.data.pesanan || response.data) }
            : order
        )
      );
      return response.data;
    } catch (err) {
      console.error("Failed to update order status:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Gagal memperbarui status pesanan.";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Fungsi untuk menghapus pesanan dari backend
  const deleteOrder = async (orderId) => {
    if (!isAuthenticated) throw new Error("Autentikasi diperlukan.");
    setError(null);
    try {
      await api.delete(`/pesanan/${orderId}`);
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== orderId)
      );
    } catch (err) {
      console.error("Failed to delete order:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Gagal menghapus pesanan.";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Fungsi untuk mendapatkan statistik pesanan
  const getOrderStats = useCallback(() => {
    const statusProcessing = "dilaundry";
    const statusReady = "siap_diambil";

    if (!Array.isArray(orders)) {
      return { activeOrders: 0, readyForPickup: 0 };
    }
    return {
      activeOrders: orders.filter(
        (order) => order && order.status === statusProcessing
      ).length,
      readyForPickup: orders.filter(
        (order) => order && order.status === statusReady
      ).length,
    };
  }, [orders]);

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        error,
        loadOrders,
        addOrder,
        updateOrderStatus,
        updateOrderNotes,
        deleteOrder,
        getOrderStats,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

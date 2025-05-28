import { useState, useEffect, useCallback, useContext } from "react";
import { OrderContext } from "./orderContext";
import api from "../services/api";
import { AuthContext } from "./authContext";

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token: authToken } = useContext(AuthContext);

  // Fungsi untuk memuat pesanan dari backend
  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
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
  }, []);

  useEffect(() => {
    const tokenToUse = authToken || sessionStorage.getItem("token");
    if (tokenToUse) {
      loadOrders();
    } else {
      setLoading(false);
      setOrders([]);
    }
  }, [loadOrders, authToken]);

  // Fungsi untuk menambah pesanan baru ke backend
  const addOrder = async (newOrderData) => {
    setError(null);
    try {
      const response = await api.post("/pesanan", newOrderData);
      await loadOrders();
      return response.data;
    } catch (err) {
      console.error("Failed to add order:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          err.message ||
          "Gagal menambah pesanan."
      );
      throw err;
    }
  };

  // Fungsi untuk update catatan pesanan di backend
  const updateOrderNotes = async (orderId, notes) => {
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
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          err.message ||
          "Gagal memperbarui catatan pesanan."
      );
      throw err;
    }
  };

  // Fungsi untuk update status pesanan di backend
  const updateOrderStatus = async (orderId, newStatus) => {
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
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          err.message ||
          "Gagal memperbarui status pesanan."
      );
      throw err;
    }
  };

  // Fungsi untuk menghapus pesanan dari backend
  const deleteOrder = async (orderId) => {
    setError(null);
    try {
      await api.delete(`/pesanan/${orderId}`);
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== orderId)
      );
    } catch (err) {
      console.error("Failed to delete order:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          err.message ||
          "Gagal menghapus pesanan."
      );
      throw err;
    }
  };

  // Fungsi untuk mendapatkan statistik pesanan (tetap bisa dari state frontend)
  const getOrderStats = () => {
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
  };

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

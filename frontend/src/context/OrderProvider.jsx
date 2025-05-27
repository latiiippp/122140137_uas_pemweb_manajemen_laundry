import {
  useState,
  useEffect,
  useCallback,
  useContext, // Tambahkan useContext
} from "react";
import { OrderContext } from "./orderContext";
// Hapus import data dummy:
// import { RECENT_ORDERS } from "../data/orders";
// import { ORDER_STATUS } from "../data/constants"; // Anda mungkin masih memerlukan ini jika status di frontend berbeda dari backend
// atau jika Anda ingin memvalidasi status.
// Untuk sekarang, kita asumsikan status dari backend adalah string.
import api from "../services/api"; // Impor instance axios
import { AuthContext } from "./authContext"; // Impor AuthContext

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true); // State untuk loading
  const [error, setError] = useState(null); // State untuk error
  const { token: authToken } = useContext(AuthContext); // Ambil token

  // Fungsi untuk memuat pesanan dari backend
  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Pastikan path '/pesanan' sudah benar sesuai rute backend dan baseURL di api.js
      const response = await api.get("/pesanan");
      // Sesuaikan dengan struktur respons backend Anda
      // Jika backend mengembalikan { "pesanan": [...] } atau { "orders": [...] }
      // atau array langsung [...]
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
      // setError("Silakan login untuk melihat data pesanan."); // Opsional
    }
  }, [loadOrders, authToken]);

  // Fungsi untuk menambah pesanan baru ke backend
  const addOrder = async (newOrderData) => {
    setError(null);
    // setLoading(true); // Opsional, loadOrders akan set loading
    try {
      // newOrderData harus berisi semua field yang dibutuhkan backend
      // seperti nama_pelanggan, no_hp, layanan_id, berat, dll.
      // Backend akan meng-generate ID dan entryDate
      const response = await api.post("/pesanan", newOrderData);
      await loadOrders(); // Muat ulang semua pesanan untuk mendapatkan data terbaru
      // Atau, tambahkan respons ke state secara optimis jika backend mengembalikan pesanan yang baru dibuat:
      // setOrders((prevOrders) => [response.data.pesanan || response.data, ...prevOrders]);
      return response.data; // Kembalikan data pesanan yang baru dibuat dari backend
    } catch (err) {
      console.error("Failed to add order:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          err.message ||
          "Gagal menambah pesanan."
      );
      // setLoading(false);
      throw err;
    }
  };

  // Fungsi untuk update catatan pesanan di backend
  const updateOrderNotes = async (orderId, notes) => {
    setError(null);
    try {
      // Backend mungkin mengharapkan seluruh objek pesanan atau hanya field yang diupdate
      // Asumsi backend menerima { catatan: "notes baru" } atau seluruh objek dengan catatan baru
      const response = await api.put(`/pesanan/${orderId}`, { catatan: notes });
      // Update state secara optimis atau panggil loadOrders()
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? { ...order, ...(response.data.pesanan || response.data) }
            : order
        )
      );
      // await loadOrders();
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
      // Backend mungkin mengharapkan seluruh objek pesanan atau hanya field yang diupdate
      // Asumsi backend menerima { status: "status_baru" } atau seluruh objek dengan status baru
      // Backend juga bisa menangani 'completionDate' jika statusnya 'selesai'
      const response = await api.put(`/pesanan/${orderId}`, {
        status: newStatus,
      });
      // Update state secara optimis atau panggil loadOrders()
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? { ...order, ...(response.data.pesanan || response.data) }
            : order
        )
      );
      // await loadOrders();
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
      // Hapus dari state secara optimis atau panggil loadOrders()
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== orderId)
      );
      // await loadOrders();
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
    // Pastikan nilai status ini sesuai dengan yang ada di backend Anda
    // Misal: 'diproses', 'siap_diambil', 'selesai'
    const statusProcessing = "dilaundry"; // Ganti dengan nilai status dari backend
    const statusReady = "siap_diambil"; // Ganti dengan nilai status dari backend

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
        loading, // Sediakan loading state
        error, // Sediakan error state
        loadOrders, // Mungkin perlu diekspos jika ingin refresh manual dari komponen
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

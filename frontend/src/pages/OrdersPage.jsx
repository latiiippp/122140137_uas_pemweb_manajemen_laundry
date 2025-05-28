import { useState, useMemo } from "react";
import { useOrders } from "../context/useOrder";
import { useAuth } from "../context/useAuth";
import api from "../services/api";
import Sidebar from "../components/layout/Sidebar";
import PageHeader from "../components/layout/PageHeader";
import OrdersTable from "../components/order/OrdersTable";
import DeleteOrderModal from "../components/order/DeleteOrderModal"; // Nama tetap, tapi fungsinya lebih generik
import SearchBar from "../components/order/SearchBar";
import OrderForm from "../components/order/OrderForm";

export default function OrdersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // State untuk modal konfirmasi generik
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [confirmationModalTitle, setConfirmationModalTitle] = useState("");
  const [confirmationModalMessage, setConfirmationModalMessage] = useState("");
  const [onConfirmationModalConfirm, setOnConfirmationModalConfirm] =
    useState(null); // Akan menyimpan fungsi () => {}

  const [orderToDelete, setOrderToDelete] = useState(null); // Tetap dibutuhkan untuk menghapus order spesifik
  const [searchTerm, setSearchTerm] = useState("");
  const [orderFormOpen, setOrderFormOpen] = useState(false);
  const [currentOrderToEdit, setCurrentOrderToEdit] = useState(null);

  const {
    orders,
    loading,
    error,
    updateOrderStatus,
    deleteOrder,
    fetchOrders,
  } = useOrders();
  const { user: currentUser } = useAuth();

  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = orders.filter((order) => {
      const orderIdString =
        order.id != null ? String(order.id).toLowerCase() : "";
      const customerName = order.nama_pelanggan
        ? order.nama_pelanggan.toLowerCase()
        : "";
      const phoneNumber = order.nomor_hp ? String(order.nomor_hp) : "";
      const status = order.status ? order.status.toLowerCase() : "";
      const kategoriLayanan = order.kategori_layanan
        ? order.kategori_layanan.toLowerCase()
        : "";
      const jenisLayanan = order.jenis_layanan
        ? order.jenis_layanan.toLowerCase()
        : "";
      return (
        orderIdString.includes(lowerSearchTerm) ||
        customerName.includes(lowerSearchTerm) ||
        phoneNumber.includes(searchTerm) ||
        status.includes(lowerSearchTerm) ||
        kategoriLayanan.includes(lowerSearchTerm) ||
        jenisLayanan.includes(lowerSearchTerm)
      );
    });
    return [...filtered].sort(
      (a, b) => new Date(b.tanggal_masuk || 0) - new Date(a.tanggal_masuk || 0)
    );
  }, [orders, searchTerm]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateOrderStatus(id, newStatus);
    } catch (err) {
      console.error("Gagal update status:", err);
    }
  };

  const handleCloseConfirmationModal = () => {
    setIsConfirmationModalOpen(false);
    setConfirmationModalTitle("");
    setConfirmationModalMessage("");
    setOnConfirmationModalConfirm(null);
    setOrderToDelete(null); // Reset orderToDelete juga
  };

  const handleActualDeleteOrder = async () => {
    if (orderToDelete) {
      try {
        await deleteOrder(orderToDelete);
        // fetchOrders(); // useOrders context seharusnya sudah menangani ini
      } catch (err) {
        console.error("Gagal menghapus pesanan:", err);
        alert("Gagal menghapus pesanan.");
      }
    }
  };

  // Untuk menghapus satu pesanan
  const handleOpenDeleteOrderModal = (orderId) => {
    setOrderToDelete(orderId);
    setConfirmationModalTitle("Konfirmasi Hapus Pesanan");
    setConfirmationModalMessage(
      "Apakah Anda yakin ingin menghapus pesanan ini? Tindakan ini tidak dapat dibatalkan."
    );
    // Bungkus aksi dalam fungsi agar bisa dipanggil oleh setOnConfirmationModalConfirm
    setOnConfirmationModalConfirm(() => () => handleActualDeleteOrder());
    setIsConfirmationModalOpen(true);
  };

  const handleActualDeleteOldOrders = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        alert("Otentikasi diperlukan. Silakan login kembali.");
        return;
      }
      const response = await api.post(
        "/delete_old_orders_completed",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert(response.data.message);
      if (fetchOrders) {
        fetchOrders();
      }
    } catch (err) {
      console.error(
        "Gagal menghapus pesanan lama:",
        err.response?.data?.error || err.message
      );
      alert(
        `Gagal menghapus pesanan lama: ${
          err.response?.data?.error || err.message
        }`
      );
    }
  };

  // Untuk menghapus pesanan lama
  const handleDeleteOldCompletedOrders = () => {
    setConfirmationModalTitle("Konfirmasi Hapus Pesanan Lama");
    setConfirmationModalMessage(
      "Anda yakin ingin menghapus semua pesanan selesai yang berumur lebih dari 7 hari? Tindakan ini tidak dapat diurungkan."
    );
    setOnConfirmationModalConfirm(() => () => handleActualDeleteOldOrders());
    setIsConfirmationModalOpen(true);
  };

  const handleOpenOrderForm = (order = null) => {
    setCurrentOrderToEdit(order);
    setOrderFormOpen(true);
  };

  const handleCloseOrderForm = () => {
    setOrderFormOpen(false);
    setCurrentOrderToEdit(null);
  };

  if (loading && !orders.length) {
    // Tampilkan loading hanya jika belum ada data sama sekali
    return (
      <div className="flex justify-center items-center min-h-screen">
        Memuat data pesanan...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 flex flex-col lg:ml-64">
        <PageHeader
          title="Data Pesanan"
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="p-4">
          <div className="mb-4">
            <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />
          </div>

          {searchTerm && (
            <div className="mb-4 flex items-center text-sm text-gray-600">
              <span>
                Menampilkan {filteredOrders.length} hasil untuk "{searchTerm}"
              </span>
              {(filteredOrders.length > 0 || searchTerm) && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  Reset
                </button>
              )}
            </div>
          )}

          <OrdersTable
            orders={filteredOrders}
            onUpdateStatus={handleUpdateStatus}
            onDeleteOrder={handleOpenDeleteOrderModal} // Menggunakan handler baru
            onAddOrder={() => handleOpenOrderForm()}
            onEditOrder={handleOpenOrderForm}
            currentUser={currentUser}
            onDeleteOldOrders={handleDeleteOldCompletedOrders} // Ini akan membuka modal
          />
        </main>
      </div>

      <DeleteOrderModal
        isOpen={isConfirmationModalOpen}
        onClose={handleCloseConfirmationModal}
        onConfirm={() => {
          if (typeof onConfirmationModalConfirm === "function") {
            const actionToRun = onConfirmationModalConfirm(); // Dapatkan fungsi sebenarnya
            if (typeof actionToRun === "function") {
              actionToRun(); // Jalankan fungsi sebenarnya
            }
          }
          handleCloseConfirmationModal(); // Selalu tutup modal setelah konfirmasi
        }}
        title={confirmationModalTitle}
        message={confirmationModalMessage}
      />
      <OrderForm
        isOpen={orderFormOpen}
        onClose={handleCloseOrderForm}
        orderToEdit={currentOrderToEdit}
      />
    </div>
  );
}

import { useState, useMemo } from "react";
import { useOrders } from "../context/useOrder";
import Sidebar from "../components/layout/Sidebar";
import PageHeader from "../components/layout/PageHeader";
import OrdersTable from "../components/order/OrdersTable";
import DeleteOrderModal from "../components/order/DeleteOrderModal";
import SearchBar from "../components/order/SearchBar";
import OrderForm from "../components/order/OrderForm";

export default function OrdersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [orderFormOpen, setOrderFormOpen] = useState(false);
  const [currentOrderToEdit, setCurrentOrderToEdit] = useState(null);

  const { orders, loading, error, updateOrderStatus, deleteOrder } =
    useOrders();

  // Fungsi untuk mencari dan mengurutkan pesanan
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

  // Handler untuk konfirmasi update status
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateOrderStatus(id, newStatus);
    } catch (err) {
      console.error("Gagal update status:", err);
    }
  };

  // Handler untuk menampilkan modal konfirmasi hapus
  const handleOpenDeleteModal = (orderId) => {
    // Menerima orderId
    setOrderToDelete(orderId);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setOrderToDelete(null);
  };

  // Handler untuk konfirmasi hapus
  const handleDeleteConfirm = async () => {
    if (orderToDelete) {
      try {
        await deleteOrder(orderToDelete); // Menggunakan orderToDelete (ID)
        handleCloseDeleteModal();
      } catch (err) {
        console.error("Gagal menghapus pesanan:", err);
        handleCloseDeleteModal();
      }
    }
  };

  // Handler untuk menampilkan form tambah/edit pesanan
  const handleOpenOrderForm = (order = null) => {
    // Menerima order untuk edit
    setCurrentOrderToEdit(order);
    setOrderFormOpen(true);
  };

  const handleCloseOrderForm = () => {
    setOrderFormOpen(false);
    setCurrentOrderToEdit(null);
  };

  if (loading) {
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
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        <PageHeader
          title="Data Pesanan" // Judul dari kode Anda sebelumnya
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        ></PageHeader>

        <main className="p-4">
          {/* Search Bar */}
          <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />

          {/* Indikator hasil pencarian jika ada kata kunci pencarian */}
          {searchTerm && (
            <div className="mb-4 flex items-center text-sm text-gray-600">
              <span>
                Menampilkan {filteredOrders.length} hasil untuk "{searchTerm}"
              </span>
              {/* Tombol reset hanya tampil jika ada hasil atau searchTerm tidak kosong */}
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

          {/* Tabel Pesanan */}
          <OrdersTable
            orders={filteredOrders}
            onUpdateStatus={handleUpdateStatus}
            onDeleteOrder={handleOpenDeleteModal}
            onAddOrder={() => handleOpenOrderForm()}
            onEditOrder={handleOpenOrderForm}
          />
        </main>
      </div>

      {/* Modal konfirmasi hapus */}
      <DeleteOrderModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
      />

      {/* Form tambah pesanan */}
      <OrderForm
        isOpen={orderFormOpen}
        onClose={handleCloseOrderForm}
        orderToEdit={currentOrderToEdit}
      />

      <div className="fixed bottom-4 right-4">
        <div className="h-1 w-20 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full"></div>
      </div>
    </div>
  );
}

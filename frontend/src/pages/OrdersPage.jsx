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

  // Gunakan OrderContext
  const { orders, updateOrderStatus, deleteOrder } = useOrders();

  // Fungsi untuk mencari dan mengurutkan pesanan
  const filteredOrders = useMemo(() => {
    // 1. Filter berdasarkan kata kunci pencarian
    const filtered = searchTerm
      ? orders.filter(
          (order) =>
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.nama_pelanggan
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            order.nomor_hp.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.status.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : orders;

    // 2. Urutkan berdasarkan tanggal masuk (terbaru dulu)
    return [...filtered].sort(
      (a, b) => new Date(b.entryDate) - new Date(a.entryDate)
    );
  }, [orders, searchTerm]);

  // Handler untuk konfirmasi update status
  const handleUpdateStatus = (id, newStatus) => {
    updateOrderStatus(id, newStatus);
  };

  // Handler untuk menampilkan modal konfirmasi
  const handleOpenDeleteModal = (id) => {
    setOrderToDelete(id);
    setShowDeleteModal(true);
  };

  // Handler untuk konfirmasi hapus
  const handleDeleteConfirm = () => {
    if (orderToDelete) {
      deleteOrder(orderToDelete);
      setShowDeleteModal(false);
      setOrderToDelete(null);
    }
  };

  // Handler untuk menampilkan form tambah pesanan
  const handleOpenOrderForm = () => {
    setOrderFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Header menggunakan komponen PageHeader */}
        <PageHeader
          title="Data Pesanan"
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="p-4">
          {/* Search Bar */}
          <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />

          {/* Indikator hasil pencarian jika ada kata kunci pencarian */}
          {searchTerm && (
            <div className="mb-4 flex items-center text-sm text-gray-600">
              <span>
                Menampilkan {filteredOrders.length} hasil untuk "{searchTerm}"
              </span>
              {filteredOrders.length > 0 && (
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
            onAddOrder={handleOpenOrderForm}
          />
        </main>
      </div>

      {/* Modal konfirmasi hapus */}
      <DeleteOrderModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Form tambah pesanan */}
      <OrderForm
        isOpen={orderFormOpen}
        onClose={() => setOrderFormOpen(false)}
      />

      {/* Elemen visual khas tema */}
      <div className="fixed bottom-4 right-4">
        <div className="h-1 w-20 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full"></div>
      </div>
    </div>
  );
}

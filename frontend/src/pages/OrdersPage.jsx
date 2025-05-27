import { useState, useMemo } from "react";
import { useOrders } from "../context/useOrder";
import Sidebar from "../components/layout/Sidebar";
import PageHeader from "../components/layout/PageHeader";
import OrdersTable from "../components/order/OrdersTable";
import DeleteOrderModal from "../components/order/DeleteOrderModal"; // Tetap menggunakan DeleteOrderModal
import SearchBar from "../components/order/SearchBar"; // Tetap menggunakan SearchBar dari order
import OrderForm from "../components/order/OrderForm";

export default function OrdersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null); // Menyimpan ID order
  const [searchTerm, setSearchTerm] = useState("");
  const [orderFormOpen, setOrderFormOpen] = useState(false);
  const [currentOrderToEdit, setCurrentOrderToEdit] = useState(null); // Untuk edit

  // Gunakan OrderContext
  // Asumsikan context menyediakan loading dan error juga
  const { orders, loading, error, updateOrderStatus, deleteOrder } =
    useOrders();

  // Fungsi untuk mencari dan mengurutkan pesanan
  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) return []; // Pastikan orders adalah array

    const lowerSearchTerm = searchTerm.toLowerCase();

    const filtered = orders.filter((order) => {
      // Pastikan semua field yang dicari ada dan merupakan string sebelum toLowerCase
      const orderIdString =
        order.id != null ? String(order.id).toLowerCase() : "";
      const customerName = order.nama_pelanggan
        ? order.nama_pelanggan.toLowerCase()
        : "";
      const phoneNumber = order.nomor_hp ? String(order.nomor_hp) : ""; // Nomor HP mungkin angka
      const status = order.status ? order.status.toLowerCase() : "";
      // Anda bisa menambahkan field lain untuk pencarian jika perlu
      const kategoriLayanan = order.kategori_layanan
        ? order.kategori_layanan.toLowerCase()
        : "";
      const jenisLayanan = order.jenis_layanan
        ? order.jenis_layanan.toLowerCase()
        : "";

      return (
        orderIdString.includes(lowerSearchTerm) ||
        customerName.includes(lowerSearchTerm) ||
        phoneNumber.includes(searchTerm) || // Untuk nomor HP, mungkin tidak perlu toLowerCase
        status.includes(lowerSearchTerm) ||
        kategoriLayanan.includes(lowerSearchTerm) ||
        jenisLayanan.includes(lowerSearchTerm)
      );
    });

    // Urutkan berdasarkan tanggal masuk (terbaru dulu)
    // Ganti 'entryDate' dengan field tanggal yang benar dari data Anda, misal 'tanggal_masuk'
    // Jika tidak ada field tanggal yang konsisten, Anda bisa menghapus pengurutan ini
    // atau mengurutkan berdasarkan ID atau field lain.
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
      // Handle error jika perlu (misalnya tampilkan notifikasi)
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
        // Handle error jika perlu
        handleCloseDeleteModal(); // Tetap tutup modal
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

  // Jika loading, tampilkan pesan loading
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Memuat data pesanan...
      </div>
    );
  }

  // Jika ada error, tampilkan pesan error
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
        {/* Header menggunakan komponen PageHeader */}
        <PageHeader
          title="Data Pesanan" // Judul dari kode Anda sebelumnya
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        >
          {/* Tombol Tambah Pesanan bisa diletakkan di sini jika diinginkan,
             atau tetap di dalam OrdersTable/bagian lain sesuai desain Anda.
             Untuk saat ini, saya biarkan PageHeader tanpa children tombol.
             Jika tombol tambah ada di OrdersTable, pastikan onAddOrder di OrdersTable
             memanggil handleOpenOrderForm() tanpa argumen.
         */}
        </PageHeader>

        <main className="p-4">
          {/* Search Bar */}
          {/* Pastikan SearchBar Anda menerima props searchTerm dan onSearch */}
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
          {/* Pastikan OrdersTable Anda bisa menerima onEditOrder */}
          <OrdersTable
            orders={filteredOrders}
            onUpdateStatus={handleUpdateStatus}
            onDeleteOrder={handleOpenDeleteModal} // Mengirim ID
            onAddOrder={() => handleOpenOrderForm()} // Panggil tanpa argumen untuk mode tambah
            onEditOrder={handleOpenOrderForm} // Panggil dengan objek order untuk mode edit
          />
        </main>
      </div>

      {/* Modal konfirmasi hapus */}
      {/* Pastikan DeleteOrderModal Anda sesuai dengan props ini */}
      <DeleteOrderModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        // Jika DeleteOrderModal butuh info order, Anda mungkin perlu menyimpan objek orderToDelete
        // bukan hanya ID, atau mengambil detail order berdasarkan ID sebelum menampilkan modal.
        // Untuk saat ini, saya asumsikan onConfirm hanya butuh ID.
      />

      {/* Form tambah pesanan */}
      {/* Pastikan OrderForm Anda bisa menerima orderToEdit */}
      <OrderForm
        isOpen={orderFormOpen}
        onClose={handleCloseOrderForm}
        orderToEdit={currentOrderToEdit}
      />

      {/* Elemen visual khas tema (jika masih relevan) */}
      <div className="fixed bottom-4 right-4">
        <div className="h-1 w-20 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full"></div>
      </div>
    </div>
  );
}

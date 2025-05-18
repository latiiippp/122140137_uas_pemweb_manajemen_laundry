import { useState, useMemo } from "react";
import { useOrders } from "../context/useOrder";
import Sidebar from "../components/layout/Sidebar";
import PageHeader from "../components/layout/PageHeader";
import OrderForm from "../components/order/OrderForm";
import StatisticsCards from "../components/dashboard/StatisticsCards";
import OrdersTable from "../components/order/OrdersTable";
import DeleteOrderModal from "../components/order/DeleteOrderModal";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orderFormOpen, setOrderFormOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  // Gunakan OrderContext
  const { orders, updateOrderStatus, deleteOrder, getOrderStats } = useOrders();

  // Dapatkan statistik dari OrderContext
  const { activeOrders, readyForPickup } = getOrderStats();

  // Urutkan dan ambil 5 pesanan terbaru
  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate))
      .slice(0, 5);
  }, [orders]);

  // Handler untuk konfirmasi update status
  const handleUpdateStatus = (id, newStatus) => {
    updateOrderStatus(id, newStatus);
  };

  // Handler untuk menampilkan form pesanan baru
  const handleNewOrder = () => {
    setOrderFormOpen(true);
  };

  // Handler untuk menampilkan dialog konfirmasi hapus
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
          title="Dashboard"
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="p-4">
          {/* Statistik kartu */}
          <StatisticsCards
            activeOrders={activeOrders}
            readyForPickup={readyForPickup}
          />

          {/* Tabel pesanan terbaru menggunakan OrdersTable */}
          <div className="mb-4">
            <OrdersTable
              orders={recentOrders}
              onUpdateStatus={handleUpdateStatus}
              onDeleteOrder={handleOpenDeleteModal}
              onAddOrder={handleNewOrder}
            />

            {/* Link ke halaman orders */}
            <div className="bg-white rounded-b-lg shadow px-4 py-3 border-t border-gray-200 text-right">
              <Link
                to="/orders"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Lihat semua pesanan →
              </Link>
            </div>
          </div>
        </main>
      </div>

      {/* Order Form Modal */}
      <OrderForm
        isOpen={orderFormOpen}
        onClose={() => setOrderFormOpen(false)}
      />

      {/* Modal konfirmasi hapus */}
      <DeleteOrderModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

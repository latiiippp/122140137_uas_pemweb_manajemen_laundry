import { useState } from "react";
import { useOrders } from "../context/useOrder";
import Sidebar from "../components/layout/Sidebar";
import OrderForm from "../components/order/OrderForm";
import StatisticsCards from "../components/dashboard/StatisticsCards";
import RecentOrdersTable from "../components/dashboard/RecentOrdersTable";
import { formatCurrency, formatDate } from "../utils/formatters";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orderFormOpen, setOrderFormOpen] = useState(false);

  // Gunakan OrderContext
  const { orders, getOrderStats } = useOrders();

  // Dapatkan statistik dari OrderContext
  const { activeOrders, readyForPickup } = getOrderStats();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Header sederhana dengan tombol toggle saja */}
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
          {/* Tombol logout dihapus dari sini */}
          <div className="w-6 h-6"></div> {/* Spacer untuk menjaga layout */}
        </header>

        <main className="p-4">
          {/* Statistik kartu */}
          <StatisticsCards
            activeOrders={activeOrders}
            readyForPickup={readyForPickup}
          />

          {/* Tabel pesanan terbaru dengan tombol buat pesanan */}
          <RecentOrdersTable
            orders={orders.slice(0, 5)} // Hanya 5 pesanan terbaru
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            onNewOrder={() => setOrderFormOpen(true)}
          />
        </main>
      </div>

      {/* Order Form Modal */}
      <OrderForm
        isOpen={orderFormOpen}
        onClose={() => setOrderFormOpen(false)}
      />
    </div>
  );
}

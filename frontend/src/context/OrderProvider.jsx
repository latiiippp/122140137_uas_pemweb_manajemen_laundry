import { useState, useEffect } from "react";
import { OrderContext } from "./orderContext";
import { RECENT_ORDERS } from "../data/orders";
import { ORDER_STATUS } from "../data/constants";

// Provider component
export function OrderProvider({ children }) {
  // State untuk menyimpan semua pesanan
  const [orders, setOrders] = useState([]);

  // Inisialisasi orders dari data dummy
  useEffect(() => {
    setOrders(RECENT_ORDERS);
  }, []);

  // Fungsi untuk menambah pesanan baru
  const addOrder = (newOrder) => {
    // Generate ID sederhana (dalam implementasi nyata gunakan UUID atau dari backend)
    const id = `ORD-${String(orders.length + 1).padStart(3, "0")}`;

    const orderWithId = {
      ...newOrder,
      id,
      entryDate: new Date().toISOString().split("T")[0], // Format: YYYY-MM-DD
    };

    setOrders((prevOrders) => [orderWithId, ...prevOrders]);
    return orderWithId;
  };

  const updateOrderNotes = (id, notes) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => (order.id === id ? { ...order, notes } : order))
    );
  };

  // Fungsi untuk update status pesanan
  const updateOrderStatus = (id, newStatus) => {
    const now = new Date().toISOString().split("T")[0];

    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id
          ? {
              ...order,
              status: newStatus,
              completionDate:
                newStatus === ORDER_STATUS.COMPLETED
                  ? now
                  : order.completionDate,
            }
          : order
      )
    );
  };

  // Fungsi untuk menghapus pesanan
  const deleteOrder = (id) => {
    setOrders((prevOrders) => prevOrders.filter((order) => order.id !== id));
  };

  // Fungsi untuk mendapatkan statistik pesanan
  const getOrderStats = () => {
    return {
      activeOrders: orders.filter(
        (order) => order.status === ORDER_STATUS.PROCESSING
      ).length,
      readyForPickup: orders.filter(
        (order) => order.status === ORDER_STATUS.READY
      ).length,
    };
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        addOrder,
        updateOrderStatus,
        updateOrderNotes, // Menambahkan fungsi updateOrderNotes ke value provider
        deleteOrder,
        getOrderStats,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

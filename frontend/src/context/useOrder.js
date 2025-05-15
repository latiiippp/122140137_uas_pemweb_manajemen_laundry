import { useContext } from "react";
import { OrderContext } from "./orderContext"; // Import dari orderContext.js, bukan dari OrderContext.jsx

// Custom hook untuk mengakses order context
export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
};

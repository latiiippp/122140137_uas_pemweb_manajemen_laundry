import { ORDER_STATUS } from "../../data/constants";

export default function StatusBadge({ status, onClick }) {
  const getStatusLabel = () => {
    switch (status) {
      case ORDER_STATUS.PROCESSING:
        return "Dilaundry";
      case ORDER_STATUS.READY:
        return "Siap Ambil";
      case ORDER_STATUS.COMPLETED:
        return "Selesai";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case ORDER_STATUS.PROCESSING:
        return "bg-blue-100 text-blue-800";
      case ORDER_STATUS.READY:
        return "bg-yellow-100 text-yellow-800";
      case ORDER_STATUS.COMPLETED:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      onClick={onClick}
      className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full cursor-pointer hover:opacity-80 ${getStatusColor()}`}
    >
      {getStatusLabel()}
    </span>
  );
}

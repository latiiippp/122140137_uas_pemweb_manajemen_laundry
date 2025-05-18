import { ORDER_STATUS } from "../../data/constants";

export default function StatusBadge({ status, onClick }) {
  const getStatusInfo = () => {
    switch (status) {
      case ORDER_STATUS.PROCESSING:
        return {
          label: "Sedang Dilaundry",
          className: "bg-blue-100 text-blue-800",
          searchTerms: ["sedang", "dilaundry", "proses"],
        };
      case ORDER_STATUS.READY:
        return {
          label: "Siap Ambil",
          className: "bg-yellow-100 text-yellow-800",
          searchTerms: ["siap", "ambil", "ready"],
        };
      case ORDER_STATUS.COMPLETED:
        return {
          label: "Selesai",
          className: "bg-green-100 text-green-800",
          searchTerms: ["selesai", "done", "complete"],
        };
      default:
        return {
          label: status || "Unknown",
          className: "bg-gray-100 text-gray-800",
          searchTerms: [],
        };
    }
  };

  const { label, className } = getStatusInfo();

  return (
    <span
      onClick={onClick}
      className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full cursor-pointer hover:opacity-80 ${className}`}
    >
      {label}
    </span>
  );
}

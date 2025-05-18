import { useState } from "react";
import { formatCurrency, formatDate } from "../../utils/formatters";
import StatusBadge from "./StatusBadge";
import StatusEditor from "./StatusEditor";

export default function OrdersTable({
  orders,
  onUpdateStatus,
  onDeleteOrder,
  onAddOrder,
}) {
  const [editStatusId, setEditStatusId] = useState(null);
  const [editStatus, setEditStatus] = useState("");

  const handleStatusClick = (order) => {
    setEditStatusId(order.id);
    setEditStatus(order.status);
  };

  const handleStatusUpdate = (id) => {
    onUpdateStatus(id, editStatus);
    setEditStatusId(null);
  };

  const handleCancelEdit = () => {
    setEditStatusId(null);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Data Pesanan Laundry
          </h3>
        </div>
        <div>
          <button
            onClick={onAddOrder}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              ></path>
            </svg>
            Tambah Data Pesanan
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          Tidak ada pesanan yang ditemukan
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  No
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pelanggan
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Layanan
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harga
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order, index) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-700">
                    <div>
                      <div className="font-medium">{order.customer}</div>
                      <div className="text-gray-500">{order.phone}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-700">
                    <div>
                      <div>{order.service}</div>
                      <div className="text-gray-500">
                        {order.category === "kiloan" ? "Kiloan" : "Satuan"}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                    {order.quantity}{" "}
                    {order.category === "kiloan" ? "kg" : "pcs"}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                    {formatCurrency(order.price)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {editStatusId === order.id ? (
                      <StatusEditor
                        status={editStatus}
                        onStatusChange={setEditStatus}
                        onSave={() => handleStatusUpdate(order.id)}
                        onCancel={handleCancelEdit}
                      />
                    ) : (
                      <StatusBadge
                        status={order.status}
                        onClick={() => handleStatusClick(order)}
                      />
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-500">
                    <div className="font-medium">
                      Masuk: {formatDate(order.entryDate)}
                    </div>
                    {order.completionDate && (
                      <div>Keluar: {formatDate(order.completionDate)}</div>
                    )}
                    {order.notes && (
                      <div
                        className="mt-1 text-xs italic text-gray-500 truncate max-w-[150px]"
                        title={order.notes}
                      >
                        {order.notes}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                    <button
                      onClick={() => onDeleteOrder(order.id)}
                      className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"
                      title="Hapus Pesanan"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

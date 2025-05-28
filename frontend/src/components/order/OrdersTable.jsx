import React, { useState, useMemo } from "react"; // Tambahkan useMemo
import { formatCurrency, formatDate } from "../../utils/formatters";
import StatusBadge from "./StatusBadge";
import StatusEditor from "./StatusEditor";

const ITEMS_PER_PAGE = 10; // Jumlah item per halaman

export default function OrdersTable({
  orders,
  onUpdateStatus,
  onDeleteOrder,
  onAddOrder,
  // onEditOrder, // Jika Anda akan menggunakannya nanti
}) {
  const [editStatusId, setEditStatusId] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

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

  // Paginasi data
  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const lastPageIndex = firstPageIndex + ITEMS_PER_PAGE;
    return orders.slice(firstPageIndex, lastPageIndex);
  }, [orders, currentPage]);

  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0); // Scroll ke atas
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 3;

    if (totalPages <= 1) return null;

    pageNumbers.push(1);

    if (totalPages > maxVisiblePages + 2) {
      if (currentPage > maxVisiblePages - 1 && maxVisiblePages > 1) {
        if (currentPage > 2 && totalPages > 3) pageNumbers.push("...");
      }

      let startPage = Math.max(
        2,
        currentPage - Math.floor((maxVisiblePages - 1) / 2)
      );
      let endPage = Math.min(
        totalPages - 1,
        currentPage + Math.floor(maxVisiblePages / 2)
      );

      if (
        maxVisiblePages === 1 &&
        currentPage > 1 &&
        currentPage < totalPages
      ) {
        startPage = currentPage;
        endPage = currentPage;
      } else {
        if (currentPage < maxVisiblePages && maxVisiblePages > 1) {
          endPage = Math.min(totalPages - 1, maxVisiblePages);
        }
        if (
          currentPage > totalPages - maxVisiblePages + 1 &&
          maxVisiblePages > 1
        ) {
          startPage = Math.max(2, totalPages - maxVisiblePages);
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        if (i !== 1 && i !== totalPages) {
          pageNumbers.push(i);
        }
      }
      if (currentPage < totalPages - maxVisiblePages && maxVisiblePages > 1) {
        if (currentPage < totalPages - 1 && totalPages > 3)
          pageNumbers.push("...");
      }
    } else {
      for (let i = 2; i < totalPages; i++) {
        pageNumbers.push(i);
      }
    }
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    const uniquePageNumbers = [...new Set(pageNumbers)];

    return uniquePageNumbers.map((number, index) =>
      number === "..." ? (
        <span
          key={`ellipsis-${index}`}
          className="px-3 py-1.5 sm:px-4 sm:py-2 text-gray-700"
        >
          ...
        </span>
      ) : (
        <button
          key={number}
          onClick={() => handlePageChange(number)}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors
            ${
              currentPage === number
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
            }`}
        >
          {number}
        </button>
      )
    );
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Data Pesanan Laundry
          </h3>
        </div>
        {onAddOrder && (
          <div>
            <button
              onClick={onAddOrder}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors text-sm"
            >
              <svg
                className="w-5 h-5 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                ></path>
              </svg>
              Tambah Pesanan
            </button>
          </div>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          Tidak ada pesanan yang ditemukan.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              {/* Desktop Headers */}
              <thead className="bg-gray-50 hidden md:table-header-group">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                    No
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[130px]">
                    Pelanggan
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                    Layanan
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[70px]">
                    Jumlah
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Harga
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    Status
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[190px]">
                    Tanggal & Catatan
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    Aksi
                  </th>
                </tr>
              </thead>
              {/* Mobile Headers */}
              <thead className="bg-gray-50 md:hidden">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pelanggan & Info
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Layanan & Harga
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentTableData.map((order, index) => {
                  const itemNumber =
                    (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      {/* Kolom untuk semua tampilan */}
                      <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900 align-top">
                        {itemNumber}
                      </td>

                      {/* Kolom untuk Mobile */}
                      <td className="px-3 py-2 text-xs text-gray-700 align-top md:hidden">
                        <div className="font-medium">
                          {order.nama_pelanggan}
                        </div>
                        <div className="text-gray-500">{order.nomor_hp}</div>
                        <div className="mt-1">
                          <StatusBadge status={order.status} />
                        </div>
                        <div className="mt-1 text-gray-500 text-xs">
                          Masuk: {formatDate(order.tanggal_masuk)}
                        </div>
                        {order.tanggal_keluar && (
                          <div className="text-gray-500 text-xs">
                            Keluar: {formatDate(order.tanggal_keluar)}
                          </div>
                        )}
                        {order.catatan && (
                          <div
                            className="mt-1 text-xs italic text-gray-500 whitespace-normal break-words"
                            title={order.catatan}
                          >
                            Catatan:{" "}
                            {order.catatan.length > 30
                              ? `${order.catatan.substring(0, 30)}...`
                              : order.catatan}
                          </div>
                        )}
                        <div className="mt-2">
                          {" "}
                          {/* Aksi untuk mobile */}
                          <button
                            onClick={() => onDeleteOrder(order.id)}
                            className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors text-xs"
                            title="Hapus Pesanan"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-700 align-top md:hidden">
                        <div className="font-medium">
                          {formatCurrency(order.harga)}
                        </div>
                        <div className="text-gray-500">
                          {order.jenis_layanan == "cuci_setrika"
                            ? "Cuci + Setrika"
                            : order.jenis_layanan == "cuci_saja"
                            ? "Cuci Saja"
                            : "Setrika Saja"}
                        </div>
                        <div className="text-gray-500">
                          {order.kategori_layanan === "kiloan"
                            ? "Kiloan"
                            : "Satuan"}
                        </div>
                        <div className="text-gray-500">
                          {order.jumlah_dihitung_untuk_harga}{" "}
                          {order.kategori_layanan === "kiloan" ? "kg" : "pcs"}
                        </div>
                      </td>

                      {/* Kolom untuk Desktop */}
                      <td className="hidden md:table-cell px-3 py-2 text-xs text-gray-700 align-top">
                        <div>
                          <div className="font-medium">
                            {order.nama_pelanggan}
                          </div>
                          <div className="text-gray-500">{order.nomor_hp}</div>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-3 py-2 text-xs text-gray-700 align-top">
                        <div>
                          <div>
                            {order.jenis_layanan == "cuci_setrika"
                              ? "Cuci + Setrika"
                              : order.jenis_layanan == "cuci_saja"
                              ? "Cuci Saja"
                              : "Setrika Saja"}
                          </div>
                          <div className="text-gray-500">
                            {order.kategori_layanan === "kiloan"
                              ? "Kiloan"
                              : "Satuan"}
                          </div>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-3 py-2 whitespace-nowrap text-xs text-gray-500 align-top">
                        {order.jumlah_dihitung_untuk_harga}{" "}
                        {order.kategori_layanan === "kiloan" ? "kg" : "pcs"}
                      </td>
                      <td className="hidden md:table-cell px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900 align-top">
                        {formatCurrency(order.harga)}
                      </td>
                      <td className="hidden md:table-cell px-3 py-2 whitespace-nowrap align-top">
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
                      <td className="hidden md:table-cell px-3 py-2 text-xs text-gray-500 align-top">
                        <div className="font-medium">
                          Masuk: {formatDate(order.tanggal_masuk)}
                        </div>
                        {order.tanggal_keluar && (
                          <div>Keluar: {formatDate(order.tanggal_keluar)}</div>
                        )}
                        {order.catatan && (
                          <div
                            className="mt-1 text-xs italic text-gray-500 whitespace-normal break-words"
                            title={order.catatan}
                          >
                            {order.catatan}
                          </div>
                        )}
                      </td>
                      <td className="hidden md:table-cell px-3 py-2 whitespace-nowrap text-xs text-gray-500 text-center align-top">
                        <button
                          onClick={() => onDeleteOrder(order.id)}
                          className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
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
                        {/* Tombol Edit bisa ditambahkan di sini jika diperlukan */}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Kontrol Pagination */}
          {totalPages > 1 && (
            <div className="py-3 px-4 sm:px-6 flex items-center justify-between border-t border-gray-200">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              <div className="flex items-center space-x-1 sm:space-x-2">
                {renderPageNumbers()}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Berikutnya
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

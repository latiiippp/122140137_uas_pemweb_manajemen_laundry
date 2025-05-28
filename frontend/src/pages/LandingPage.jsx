import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import SearchBar from "../components/order/SearchBar";
import StatusBadge from "../components/order/StatusBadge";
import api from "../services/api";
import { formatCurrency } from "../utils/formatters"; // Pastikan path ini benar

const ORDERS_PER_PAGE = 5;

export default function LandingPage() {
  const [landingOrders, setLandingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchPublicOrders = async () => {
      setLoading(true);
      setError(null);
      setCurrentPage(1); // Reset ke halaman pertama setiap kali fetch
      try {
        const response = await api.get("/orders"); // Endpoint untuk public orders
        const sortedData = (response.data || []).sort(
          (a, b) => (b.id || 0) - (a.id || 0)
        );
        setLandingOrders(sortedData);
      } catch (err) {
        console.error("Failed to fetch public orders:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Gagal memuat data pesanan publik."
        );
        setLandingOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicOrders();
  }, []);

  const formatStatusDisplay = (statusValue) => {
    if (!statusValue) return "N/A";
    return statusValue
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getStatusTextColorClass = (status) => {
    switch (status) {
      case "dilaundry":
        return "text-blue-600";
      case "siap_diambil":
        return "text-yellow-600";
      case "selesai":
        return "text-green-600";
      case "dibatalkan":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const filteredLandingOrders = useMemo(() => {
    if (!searchTerm.trim()) {
      return landingOrders;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return landingOrders.filter((order) => {
      const nomorUrutString = String(order.nomor_urut || "").toLowerCase(); // Jika ada nomor urut
      const namaPelangganString = order.nama_pelanggan
        ? order.nama_pelanggan.toLowerCase()
        : "";
      const nomorHpString = order.nomor_hp
        ? String(order.nomor_hp).toLowerCase()
        : "";
      const kategoriLayananString = order.kategori_layanan
        ? order.kategori_layanan.toLowerCase()
        : "";
      const jenisLayananString = order.jenis_layanan
        ? order.jenis_layanan.toLowerCase()
        : "";
      const statusString = order.status
        ? formatStatusDisplay(order.status).toLowerCase()
        : "";
      const jumlahString = String(order.jumlah || "").toLowerCase();
      const hargaString = String(order.harga || "").toLowerCase();

      return (
        nomorUrutString.includes(lowerSearchTerm) ||
        namaPelangganString.includes(lowerSearchTerm) ||
        nomorHpString.includes(lowerSearchTerm) ||
        kategoriLayananString.includes(lowerSearchTerm) ||
        jenisLayananString.includes(lowerSearchTerm) ||
        statusString.includes(lowerSearchTerm) ||
        jumlahString.includes(lowerSearchTerm) ||
        hargaString.includes(lowerSearchTerm)
      );
    });
  }, [landingOrders, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * ORDERS_PER_PAGE;
    const lastPageIndex = firstPageIndex + ORDERS_PER_PAGE;
    return filteredLandingOrders.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, filteredLandingOrders]);

  const totalPages = Math.ceil(filteredLandingOrders.length / ORDERS_PER_PAGE);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 truncate">
            Laundry Express
          </h1>
          <Link to="/login">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1.5 px-3 sm:py-2 sm:px-4 rounded-md text-xs sm:text-sm whitespace-nowrap">
              Login
            </button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-grow">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2 sm:mb-3">
            Selamat Datang di Laundry Express!
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            Lacak status pesanan laundry Anda dengan mudah.
          </p>
        </div>

        <div className="mb-6">
          <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />
        </div>

        <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-700">
          Status Pesanan Terkini
        </h3>

        {searchTerm && (
          <div className="mb-4 text-sm text-gray-600">
            Menampilkan {filteredLandingOrders.length} hasil untuk "{searchTerm}
            ".
            <button
              onClick={() => setSearchTerm("")}
              className="ml-2 text-blue-600 hover:text-blue-800 underline"
            >
              Reset
            </button>
          </div>
        )}

        {loading && (
          <p className="text-center py-10 text-gray-600">
            Memuat data pesanan...
          </p>
        )}
        {error && (
          <p className="text-red-500 text-center py-10">
            Gagal memuat data: {error}
          </p>
        )}

        {!loading && !error && currentTableData.length > 0 && (
          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      No
                    </th>
                    {/* Kolom untuk Mobile: Pelanggan */}
                    <th
                      scope="col"
                      className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:hidden"
                    >
                      Pelanggan
                    </th>
                    {/* Kolom untuk Mobile: Status & Layanan */}
                    <th
                      scope="col"
                      className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:hidden"
                    >
                      Status & Layanan
                    </th>

                    {/* Kolom untuk Desktop */}
                    <th
                      scope="col"
                      className="hidden md:table-cell px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      Nama Pelanggan
                    </th>
                    <th
                      scope="col"
                      className="hidden md:table-cell px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      Nomor HP
                    </th>
                    <th
                      scope="col"
                      className="hidden md:table-cell px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      Kategori Layanan
                    </th>
                    <th
                      scope="col"
                      className="hidden md:table-cell px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      Jenis Layanan
                    </th>
                    <th
                      scope="col"
                      className="hidden md:table-cell px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      Jumlah
                    </th>
                    <th
                      scope="col"
                      className="hidden md:table-cell px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      Harga
                    </th>
                    <th
                      scope="col"
                      className="hidden md:table-cell px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentTableData.map((order, index) => {
                    const itemNumber =
                      (currentPage - 1) * ORDERS_PER_PAGE + index + 1;
                    return (
                      <tr
                        key={order.id || order.nomor_urut} // Pastikan key unik
                        className="hover:bg-gray-50"
                      >
                        <td className="px-3 py-3 sm:px-4 sm:py-4 whitespace-nowrap font-medium text-gray-900 align-top">
                          {itemNumber}
                        </td>

                        {/* Kolom Gabungan untuk Mobile: Pelanggan */}
                        <td className="px-3 py-3 sm:px-4 sm:py-4 align-top md:hidden">
                          <div className="text-gray-800 font-medium">
                            {order.nama_pelanggan || "N/A"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.nomor_hp || ""}
                          </div>
                        </td>

                        {/* Kolom Gabungan untuk Mobile: Status & Layanan */}
                        <td className="px-3 py-3 sm:px-4 sm:py-4 align-top md:hidden">
                          <div
                            className={`font-semibold ${getStatusTextColorClass(
                              order.status
                            )}`}
                          >
                            {formatStatusDisplay(order.status)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {order.kategori_layanan == "kiloan"
                              ? "Kiloan"
                              : order.kategori_layanan == "satuan"
                              ? "Satuan"
                              : "N/A"}
                            {" - "}
                            {order.jenis_layanan == "cuci_setrika"
                              ? "Cuci + Setrika"
                              : order.jenis_layanan == "cuci_saja"
                              ? "Cuci Saja"
                              : order.jenis_layanan == "setrika_saja"
                              ? "Setrika Saja"
                              : "N/A"}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Jumlah: {order.jumlah}{" "}
                            {order.kategori_layanan === "kiloan" ? "kg" : "pcs"}
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            Harga: {formatCurrency(order.harga || 0)}
                          </div>
                        </td>

                        {/* Kolom Terpisah untuk Desktop */}
                        <td className="hidden md:table-cell px-3 py-3 sm:px-4 sm:py-4 whitespace-nowrap text-gray-800 align-top">
                          {order.nama_pelanggan || "N/A"}
                        </td>
                        <td className="hidden md:table-cell px-3 py-3 sm:px-4 sm:py-4 whitespace-nowrap text-gray-500 align-top">
                          {order.nomor_hp || ""}
                        </td>
                        <td className="hidden md:table-cell px-3 py-3 sm:px-4 sm:py-4 whitespace-nowrap text-gray-500 align-top">
                          {order.kategori_layanan == "kiloan"
                            ? "Kiloan"
                            : order.kategori_layanan == "satuan"
                            ? "Satuan"
                            : "Tidak Diketahui"}
                        </td>
                        <td className="hidden md:table-cell px-3 py-3 sm:px-4 sm:py-4 whitespace-nowrap text-gray-500 align-top">
                          {order.jenis_layanan === "cuci_setrika"
                            ? "Cuci + Setrika"
                            : order.jenis_layanan === "cuci_saja"
                            ? "Cuci Saja"
                            : order.jenis_layanan === "setrika_saja"
                            ? "Setrika Saja"
                            : "Tidak Diketahui"}
                        </td>
                        <td className="hidden md:table-cell px-3 py-3 sm:px-4 sm:py-4 whitespace-nowrap text-gray-500 align-top">
                          {order.jumlah}{" "}
                          {order.kategori_layanan === "kiloan" ? "kg" : "pcs"}
                        </td>
                        <td className="hidden md:table-cell px-3 py-3 sm:px-4 sm:py-4 whitespace-nowrap text-gray-500 align-top font-medium">
                          {formatCurrency(order.harga || 0)}
                        </td>
                        <td className="hidden md:table-cell px-3 py-3 sm:px-4 sm:py-4 whitespace-nowrap text-gray-500 align-top">
                          <StatusBadge status={order.status} />
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
          </div>
        )}

        {!loading && !error && currentTableData.length === 0 && (
          <p className="text-center text-gray-500 py-10">
            {searchTerm && filteredLandingOrders.length === 0
              ? `Tidak ada hasil untuk "${searchTerm}".`
              : "Belum ada data pesanan untuk ditampilkan saat ini."}
          </p>
        )}
      </main>

      <footer className="bg-gray-800 text-white text-center p-4 sm:p-6 mt-auto">
        <p className="text-xs sm:text-sm">
          &copy; {new Date().getFullYear()} Laundry Express. Hak Cipta
          Dilindungi.
        </p>
      </footer>
    </div>
  );
}

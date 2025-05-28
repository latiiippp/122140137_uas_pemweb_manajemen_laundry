import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import SearchBar from "../components/order/SearchBar";
import StatusBadge from "../components/order/StatusBadge";
import api from "../services/api";

export default function LandingPage() {
  const [landingOrders, setLandingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPublicOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/orders");

        setLandingOrders(response.data || []);
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
      const nomorUrutString = String(order.nomor_urut).toLowerCase();
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

      return (
        nomorUrutString.includes(lowerSearchTerm) ||
        namaPelangganString.includes(lowerSearchTerm) ||
        nomorHpString.includes(lowerSearchTerm) ||
        kategoriLayananString.includes(lowerSearchTerm) ||
        jenisLayananString.includes(lowerSearchTerm) ||
        statusString.includes(lowerSearchTerm)
      );
    });
  }, [landingOrders, searchTerm]);

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

        {/* Tampilan Loading dan Error */}
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

        {/* Tabel Pesanan (hanya tampil jika tidak loading, tidak error, dan ada data) */}
        {!loading && !error && filteredLandingOrders.length > 0 && (
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
                    <th
                      scope="col"
                      className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:hidden"
                    >
                      Pelanggan
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:hidden"
                    >
                      Layanan & Status
                    </th>
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
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLandingOrders.map((order, index) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-3 py-3 sm:px-4 sm:py-4 whitespace-nowrap font-medium text-gray-900 align-top">
                        {index + 1}
                      </td>
                      <td className="px-3 py-3 sm:px-4 sm:py-4 align-top md:hidden">
                        <div className="text-gray-800 font-medium">
                          {order.nama_pelanggan}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.nomor_hp}
                        </div>
                      </td>
                      <td className="px-3 py-3 sm:px-4 sm:py-4 align-top md:hidden">
                        <div className="text-gray-800">
                          {order.kategori_layanan}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.jenis_layanan}
                        </div>
                        <div
                          className={`text-xs font-semibold mt-1 ${getStatusTextColorClass(
                            order.status
                          )}`}
                        >
                          {formatStatusDisplay(order.status)}
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-3 py-3 sm:px-4 sm:py-4 whitespace-nowrap text-gray-800 align-top">
                        {order.nama_pelanggan}
                      </td>
                      <td className="hidden md:table-cell px-3 py-3 sm:px-4 sm:py-4 whitespace-nowrap text-gray-500 align-top">
                        {order.nomor_hp}
                      </td>
                      <td className="hidden md:table-cell px-3 py-3 sm:px-4 sm:py-4 whitespace-nowrap text-gray-500 align-top">
                        {order.kategori_layanan}
                      </td>
                      <td className="hidden md:table-cell px-3 py-3 sm:px-4 sm:py-4 whitespace-nowrap text-gray-500 align-top">
                        {order.jenis_layanan}
                      </td>
                      <td className="hidden md:table-cell px-3 py-3 sm:px-4 sm:py-4 whitespace-nowrap text-gray-500 align-top">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pesan jika tidak ada data atau tidak ada hasil pencarian (setelah loading selesai dan tidak error) */}
        {!loading && !error && filteredLandingOrders.length === 0 && (
          <p className="text-center text-gray-500 py-10">
            {searchTerm
              ? `Tidak ada hasil untuk "${searchTerm}".`
              : "Belum ada data pesanan untuk ditampilkan saat ini."}
          </p>
        )}
      </main>

      {/* ... (Footer tetap sama) ... */}
      <footer className="bg-gray-800 text-white text-center p-4 sm:p-6 mt-auto">
        <p className="text-xs sm:text-sm">
          &copy; {new Date().getFullYear()} Laundry Express. Hak Cipta
          Dilindungi.
        </p>
      </footer>
    </div>
  );
}

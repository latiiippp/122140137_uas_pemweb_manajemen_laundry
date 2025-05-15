import React from "react";

export default function StatisticsCards({ activeOrders, readyForPickup }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Pesanan Sedang Dilaundry */}
      <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
        <div className="flex items-center">
          <div>
            <p className="text-sm text-gray-500">Pesanan Sedang Dilaundry</p>
            <p className="text-2xl font-bold text-gray-800">{activeOrders}</p>
          </div>
        </div>
      </div>

      {/* Pesanan Menunggu Diambil */}
      <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
        <div className="flex items-center">
          <div>
            <p className="text-sm text-gray-500">Menunggu Diambil</p>
            <p className="text-2xl font-bold text-gray-800">{readyForPickup}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

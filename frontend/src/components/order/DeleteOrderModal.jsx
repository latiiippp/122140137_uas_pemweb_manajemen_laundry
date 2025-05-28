export default function DeleteOrderModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Konfirmasi Hapus Pesanan", // Default title lebih spesifik
  message = "Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak dapat dibatalkan.", // Default message lebih spesifik
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 text-sm font-medium bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            type="button"
            className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            Konfirmasi
          </button>
        </div>
      </div>
    </div>
  );
}

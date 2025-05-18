export default function DeleteOrderModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-[50px] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Konfirmasi Hapus
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Apakah Anda yakin ingin menghapus pesanan ini? Tindakan ini tidak
          dapat dibatalkan.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import {
  FormInput,
  FormSelect,
  FormTextarea,
  FormButton,
} from "../form/FormElements";
import { CATEGORY_OPTIONS, SERVICE_OPTIONS } from "../../data/constants";

export default function OrderForm({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    customerName: "",
    phoneNumber: "",
    category: "0",
    serviceType: "0",
    quantity: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form data:", formData);
    onClose();
  };

  if (!isOpen) return null;

  // Label dinamis untuk field jumlah
  const quantityLabel =
    formData.category === "kiloan"
      ? "Jumlah (kg)"
      : formData.category === "satuan"
      ? "Jumlah (pcs)"
      : "Jumlah";

  return (
    <div className="fixed inset-0 backdrop-blur-[15px] flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-blue-800">Pesanan Baru</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Tutup"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <FormInput
                id="customerName"
                label="Nama Pelanggan"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="Masukkan nama pelanggan"
                error={errors.customerName}
                required
              />

              <FormInput
                id="phoneNumber"
                label="Nomor HP"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Masukkan nomor HP"
                error={errors.phoneNumber}
                required
              />

              <FormSelect
                id="category"
                label="Kategori Layanan"
                value={formData.category}
                onChange={handleChange}
                options={CATEGORY_OPTIONS}
                error={errors.category}
                required
              />
            </div>

            <div className="space-y-4">
              <FormSelect
                id="serviceType"
                label="Jenis Layanan"
                value={formData.serviceType}
                onChange={handleChange}
                options={SERVICE_OPTIONS}
                error={errors.serviceType}
                required
              />

              <FormInput
                id="quantity"
                label={quantityLabel}
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                placeholder={
                  formData.category === "kiloan"
                    ? "Masukkan berat (kg)"
                    : "Masukkan jumlah (pcs)"
                }
                step={formData.category === "kiloan" ? "0.1" : "1"}
                min="0.1"
                error={errors.quantity}
                disabled={formData.category === "0"}
                required
              />
            </div>
          </div>

          <div className="mt-6">
            <FormTextarea
              id="notes"
              label="Catatan (Opsional)"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Tambahkan catatan atau instruksi khusus"
            />
          </div>

          <div className="flex justify-end mt-6">
            <FormButton variant="secondary" onClick={onClose} className="mr-2">
              Batal
            </FormButton>

            <FormButton type="submit" variant="primary">
              Simpan Pesanan
            </FormButton>
          </div>
        </form>
      </div>
    </div>
  );
}

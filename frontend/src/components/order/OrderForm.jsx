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
    nama_pelanggan: "",
    nomor_hp: "",
    kategori_layanan: "0",
    jenis_layanan: "0",
    jumlah_aktual: "",
    catatan: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Khusus untuk quantity, handle berdasarkan kategori
    if (name === "jumlah_aktual" && formData.kategori_layanan === "satuan") {
      // Untuk kategori satuan
      if (value === "") {
        // Jika input kosong, biarkan kosong (untuk UX yang lebih baik)
        setFormData((prev) => ({
          ...prev,
          [name]: "",
        }));
      } else {
        // Jika ada nilai, pastikan bilangan bulat
        const intValue = parseInt(value);
        setFormData((prev) => ({
          ...prev,
          [name]: isNaN(intValue) ? "" : intValue,
        }));
      }
    } else {
      // Untuk field lainnya tetap seperti semula
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

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
    formData.kategori_layanan === "kiloan"
      ? "Jumlah (kg)"
      : formData.kategori_layanan === "satuan"
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
                id="nama_pelanggan"
                label="Nama Pelanggan"
                value={formData.nama_pelanggan}
                onChange={handleChange}
                placeholder="Masukkan nama pelanggan"
                error={errors.nama_pelanggan}
                required
              />

              <FormInput
                id="nomor_hp"
                label="Nomor HP"
                value={formData.nomor_hp}
                onChange={handleChange}
                placeholder="Masukkan nomor HP"
                error={errors.nomor_hp}
                required
              />

              <FormSelect
                id="kategori_layanan"
                label="Kategori Layanan"
                value={formData.kategori_layanan}
                onChange={handleChange}
                options={CATEGORY_OPTIONS}
                error={errors.kategori_layanan}
                required
              />
            </div>

            <div className="space-y-4">
              <FormSelect
                id="jenis_layanan"
                label="Jenis Layanan"
                value={formData.jenis_layanan}
                onChange={handleChange}
                options={SERVICE_OPTIONS}
                error={errors.jenis_layanan}
                required
              />

              <FormInput
                id="jumlah_aktual"
                label={quantityLabel}
                type="number"
                value={formData.jumlah_aktual}
                onChange={handleChange}
                placeholder={
                  formData.kategori_layanan === "kiloan"
                    ? "Masukkan berat (kg)"
                    : "Masukkan jumlah (pcs)"
                }
                step={formData.kategori_layanan === "kiloan" ? "0.1" : "1"}
                min={formData.kategori_layanan === "kiloan" ? "0.1" : "1"} // Sesuaikan min juga
                error={errors.jumlah_aktual}
                disabled={formData.kategori_layanan === "0"}
                required
              />
            </div>
          </div>

          <div className="mt-6">
            <FormTextarea
              id="catatan"
              label="Catatan (Opsional)"
              value={formData.catatan}
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

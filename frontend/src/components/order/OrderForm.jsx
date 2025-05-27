import { useState, useEffect, useMemo } from "react"; // Tambahkan useEffect dan useMemo
import {
  FormInput,
  FormSelect,
  FormTextarea,
  FormButton,
} from "../form/FormElements";
import {
  CATEGORY_OPTIONS,
  SERVICE_OPTIONS,
  VALIDATION_MESSAGES,
} from "../../data/constants"; // Asumsi VALIDATION_MESSAGES ada
import { useOrders } from "../../context/useOrder"; // Impor hook untuk context

// Ambil nilai default dari constants jika ada, atau definisikan di sini
const DEFAULT_CATEGORY_VALUE = CATEGORY_OPTIONS[0]?.value || "0";
const DEFAULT_SERVICE_VALUE = SERVICE_OPTIONS[0]?.value || "0";

export default function OrderForm({ isOpen, onClose, orderToEdit }) {
  // Tambahkan orderToEdit untuk fungsionalitas edit nanti
  const { addOrder /*, updateOrder */ } = useOrders(); // updateOrder dikomentari untuk sementara

  // Gunakan useMemo untuk initialFormData agar stabil jika dependensinya (constants) tidak berubah
  const initialFormData = useMemo(
    () => ({
      nama_pelanggan: "",
      nomor_hp: "",
      kategori_layanan: DEFAULT_CATEGORY_VALUE,
      jenis_layanan: DEFAULT_SERVICE_VALUE,
      jumlah_aktual: "",
      catatan: "",
    }),
    []
  ); // Dependensi kosong karena DEFAULT_CATEGORY_VALUE dan DEFAULT_SERVICE_VALUE berasal dari konstanta modul

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false); // State untuk loading

  // Efek untuk mengisi form jika ada orderToEdit (untuk edit) atau reset saat isOpen berubah
  useEffect(() => {
    if (isOpen) {
      if (orderToEdit) {
        setFormData({
          nama_pelanggan: orderToEdit.nama_pelanggan || "",
          nomor_hp: orderToEdit.nomor_hp || "",
          kategori_layanan:
            orderToEdit.kategori_layanan || DEFAULT_CATEGORY_VALUE,
          jenis_layanan: orderToEdit.jenis_layanan || DEFAULT_SERVICE_VALUE,
          // Sesuaikan dengan nama field jumlah dari backend jika berbeda
          jumlah_aktual:
            orderToEdit.jumlah_dihitung_untuk_harga?.toString() ||
            orderToEdit.jumlah_aktual?.toString() ||
            orderToEdit.jumlah?.toString() ||
            "",
          catatan: orderToEdit.catatan || "",
        });
      } else {
        setFormData(initialFormData); // Reset ke form kosong jika tidak ada orderToEdit
      }
      setErrors({}); // Selalu reset error saat form dibuka/data berubah
    }
  }, [orderToEdit, isOpen, initialFormData]); // Tambahkan initialFormData ke dependency array

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };

    // Jika kategori diubah dan bukan kembali ke default, reset jenis layanan ke default
    // dan juga jumlah aktual.
    if (name === "kategori_layanan") {
      if (value === DEFAULT_CATEGORY_VALUE) {
        // Jika kembali ke "--pilih kategori--"
        newFormData.jenis_layanan = DEFAULT_SERVICE_VALUE;
        newFormData.jumlah_aktual = "";
      } else {
        // Jika memilih kategori valid, reset jenis layanan agar user memilih lagi
        // Ini opsional, tergantung preferensi UX. Jika SERVICE_OPTIONS tidak difilter,
        // mungkin tidak perlu direset.
        // newFormData.jenis_layanan = DEFAULT_SERVICE_VALUE; // Baris ini bisa diaktifkan jika ingin reset jenis layanan
        newFormData.jumlah_aktual = ""; // Reset jumlah saat kategori berubah
      }
    }

    // Penanganan khusus untuk jumlah_aktual
    if (name === "jumlah_aktual") {
      if (value === "") {
        newFormData[name] = "";
      } else {
        const numValue = parseFloat(value);
        if (newFormData.kategori_layanan === "satuan") {
          // Untuk satuan, pastikan bilangan bulat dan minimal 1
          newFormData[name] = isNaN(numValue)
            ? ""
            : Math.max(1, Math.floor(numValue)).toString();
        } else if (newFormData.kategori_layanan === "kiloan") {
          // Untuk kiloan, biarkan user input desimal, validasi lebih ketat saat submit
          // Pastikan tidak negatif
          newFormData[name] = isNaN(numValue) ? "" : numValue < 0 ? "0" : value;
        } else {
          // Jika kategori belum dipilih atau tidak valid, biarkan apa adanya
          newFormData[name] = value;
        }
      }
    }

    setFormData(newFormData);

    // Hapus error untuk field yang sedang diubah
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    // Hapus error global jika ada interaksi form
    if (errors.global) {
      setErrors((prev) => ({ ...prev, global: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const messages = VALIDATION_MESSAGES || {}; // Fallback jika VALIDATION_MESSAGES tidak ada

    if (!formData.nama_pelanggan.trim())
      newErrors.nama_pelanggan =
        messages.required_name || "Nama pelanggan harus diisi";
    if (!formData.nomor_hp.trim())
      newErrors.nomor_hp = messages.required_phone || "Nomor HP harus diisi";
    else if (!/^\d+$/.test(formData.nomor_hp))
      newErrors.nomor_hp = "Nomor HP hanya boleh berisi angka.";

    if (formData.kategori_layanan === DEFAULT_CATEGORY_VALUE)
      newErrors.kategori_layanan =
        messages.required_category || "Kategori layanan wajib dipilih.";

    // Validasi jenis layanan hanya jika kategori sudah dipilih
    if (
      formData.kategori_layanan !== DEFAULT_CATEGORY_VALUE &&
      formData.jenis_layanan === DEFAULT_SERVICE_VALUE
    ) {
      newErrors.jenis_layanan =
        messages.required_service || "Jenis layanan wajib dipilih.";
    }

    // Validasi jumlah hanya jika kategori sudah dipilih
    if (formData.kategori_layanan !== DEFAULT_CATEGORY_VALUE) {
      if (formData.jumlah_aktual.toString().trim() === "") {
        newErrors.jumlah_aktual =
          messages.required_quantity || "Jumlah wajib diisi.";
      } else {
        const numJumlah = parseFloat(formData.jumlah_aktual);
        if (isNaN(numJumlah) || numJumlah <= 0) {
          newErrors.jumlah_aktual =
            messages.invalid_quantity || "Jumlah harus lebih besar dari 0.";
        } else if (formData.kategori_layanan === "kiloan" && numJumlah < 0.1) {
          newErrors.jumlah_aktual =
            "Jumlah minimal untuk kiloan adalah 0.1 kg.";
        } else if (
          formData.kategori_layanan === "satuan" &&
          (!Number.isInteger(numJumlah) || numJumlah < 1)
        ) {
          newErrors.jumlah_aktual =
            "Jumlah untuk satuan harus bilangan bulat minimal 1.";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return; // Hentikan submit jika validasi gagal
    }

    setIsSubmitting(true);
    setErrors({}); // Bersihkan error sebelumnya

    const payload = {
      nama_pelanggan: formData.nama_pelanggan,
      nomor_hp: formData.nomor_hp,
      kategori_layanan: formData.kategori_layanan,
      jenis_layanan: formData.jenis_layanan,
      jumlah: parseFloat(formData.jumlah_aktual),
      catatan: formData.catatan,
    };

    console.log("Sending payload to backend:", payload);

    try {
      if (orderToEdit && orderToEdit.id) {
        // Jika Anda mengimplementasikan update, Anda akan menggunakan updateOrder di sini
        // await updateOrder(orderToEdit.id, payload);
        console.log(
          "Mode edit belum diimplementasikan sepenuhnya di handleSubmit ini."
        );
      } else {
        await addOrder(payload);
      }
      onClose();
    } catch (error) {
      console.error("Gagal menyimpan pesanan:", error);
      const backendError = error.data?.message || error.data?.error;
      setErrors({
        global:
          backendError ||
          error.message ||
          "Terjadi kesalahan saat menyimpan pesanan.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const quantityLabel =
    formData.kategori_layanan === "kiloan"
      ? "Jumlah (kg)"
      : formData.kategori_layanan === "satuan"
      ? "Jumlah (pcs)"
      : "Jumlah";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {orderToEdit ? "Edit Pesanan" : "Pesanan Baru"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Tutup"
            disabled={isSubmitting}
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
          {errors.global && (
            <p className="text-red-500 text-sm mb-4 text-center">
              {errors.global}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <FormInput
                id="nama_pelanggan"
                name="nama_pelanggan"
                label="Nama Pelanggan"
                value={formData.nama_pelanggan}
                onChange={handleChange}
                placeholder="Masukkan nama pelanggan"
                error={errors.nama_pelanggan}
                required
                disabled={isSubmitting}
              />

              <FormInput
                id="nomor_hp"
                name="nomor_hp"
                label="Nomor HP"
                value={formData.nomor_hp}
                onChange={handleChange}
                placeholder="Masukkan nomor HP"
                error={errors.nomor_hp}
                required
                disabled={isSubmitting}
              />

              <FormSelect
                id="kategori_layanan"
                name="kategori_layanan"
                label="Kategori Layanan"
                value={formData.kategori_layanan}
                onChange={handleChange}
                options={CATEGORY_OPTIONS}
                error={errors.kategori_layanan}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-4">
              <FormSelect
                id="jenis_layanan"
                name="jenis_layanan"
                label="Jenis Layanan"
                value={formData.jenis_layanan}
                onChange={handleChange}
                options={SERVICE_OPTIONS}
                error={errors.jenis_layanan}
                disabled={
                  formData.kategori_layanan === DEFAULT_CATEGORY_VALUE ||
                  isSubmitting
                }
                required
              />

              <FormInput
                id="jumlah_aktual"
                name="jumlah_aktual"
                label={quantityLabel}
                type="number"
                value={formData.jumlah_aktual}
                onChange={handleChange}
                placeholder={
                  formData.kategori_layanan === "kiloan"
                    ? "Masukkan berat (kg)"
                    : formData.kategori_layanan === "satuan"
                    ? "Masukkan jumlah (pcs)"
                    : "Pilih kategori dulu"
                }
                step={formData.kategori_layanan === "kiloan" ? "0.01" : "1"}
                min={formData.kategori_layanan === "kiloan" ? "0.1" : "1"}
                error={errors.jumlah_aktual}
                disabled={
                  formData.kategori_layanan === DEFAULT_CATEGORY_VALUE ||
                  isSubmitting
                }
                required={formData.kategori_layanan !== DEFAULT_CATEGORY_VALUE}
              />
            </div>
          </div>

          <div className="mt-6">
            <FormTextarea
              id="catatan"
              name="catatan"
              label="Catatan (Opsional)"
              value={formData.catatan}
              onChange={handleChange}
              placeholder="Tambahkan catatan atau instruksi khusus"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end mt-8">
            <FormButton
              variant="secondary"
              onClick={onClose}
              className="mr-3"
              disabled={isSubmitting}
            >
              Batal
            </FormButton>
            <FormButton type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting
                ? orderToEdit
                  ? "Menyimpan..."
                  : "Menambahkan..."
                : orderToEdit
                ? "Simpan Perubahan"
                : "Tambah Pesanan"}
            </FormButton>
          </div>
        </form>
      </div>
    </div>
  );
}

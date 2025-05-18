// Status pesanan
export const ORDER_STATUS = {
  PROCESSING: "sedang dilaundry",
  READY: "siap ambil",
  COMPLETED: "selesai",
};

// Opsi kategori layanan
export const CATEGORY_OPTIONS = [
  { value: "0", label: "--pilih kategori--" },
  { value: "kiloan", label: "Kiloan" },
  { value: "satuan", label: "Satuan" },
];

// Opsi jenis layanan
export const SERVICE_OPTIONS = [
  { value: "0", label: "--pilih layanan--" },
  { value: "cuci_setrika", label: "Cuci + Setrika" },
  { value: "cuci_saja", label: "Cuci Saja" },
  { value: "setrika_saja", label: "Setrika Saja" },
];

// Mapping nama layanan
export const SERVICE_NAMES = {
  cuci_setrika: "Cuci + Setrika",
  cuci_saja: "Cuci Saja",
  setrika_saja: "Setrika Saja",
};

// Tarif layanan
export const SERVICE_RATES = {
  kiloan: {
    cuci_setrika: 15000,
    cuci_saja: 10000,
    setrika_saja: 8000,
  },
  satuan: {
    cuci_setrika: 12000,
    cuci_saja: 8000,
    setrika_saja: 5000,
  },
};

// Pesan error validasi
export const VALIDATION_MESSAGES = {
  required_name: "Nama pelanggan harus diisi",
  required_phone: "Nomor HP harus diisi",
  required_category: "Silakan pilih kategori layanan",
  required_service: "Silakan pilih jenis layanan",
  required_quantity: "Jumlah harus diisi",
  invalid_quantity: "Jumlah harus berupa angka lebih dari 0",
};

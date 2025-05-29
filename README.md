# Sistem Manajemen Laundry _Laundry Express_

## Deskripsi Aplikasi Web

Sistem Manajemen Laundry _Laundry Express_ adalah aplikasi web yang dirancang untuk membantu pengelolaan operasional usaha laundry. Aplikasi ini memungkinkan admin dan karyawan untuk mencatat pesanan baru, melacak status pengerjaan laundry, dan melihat data pesanan. Khusus untuk admin dapat melihat data users yang terdaftar di aplikasi dan mengedit data users apabila ada kesalahan serta menghapus data pesanan berstatus 'selesai' yang sudah berumur lebih dari 7 hari. Selain itu, pelanggan dapat langsung melacak status pesanannya langsung di dalam aplikasi ini. Sistem dibangun dengan frontend menggunakan React dan backend menggunakan Python Pyramid.

## Dependensi Paket (Library)

Berikut adalah daftar dependensi utama yang dibutuhkan untuk menjalankan aplikasi ini:

### Frontend (React)

- `react`
- `react-dom`
- `react-router-dom`
- `axios` (untuk komunikasi HTTP dengan backend)
- `tailwindcss` (untuk styling)
- `date-fns` (untuk format tanggal)
- `jwt-decode` (untuk parsing token JWT)
- Dan dependensi lain yang tercantum dalam `frontend/package.json`

### Backend (Python Pyramid)

- `pyramid`
- `pyramid_jwt` (untuk autentikasi JWT)
- `sqlalchemy` (untuk ORM dan interaksi database)
- `psycopg2-binary` (driver PostgreSQL)
- `pyramid_tm` (manajemen transaksi)
- `zope.sqlalchemy` (integrasi SQLAlchemy dengan Zope transaction manager)
- `waitress` (sebagai WSGI server production)
- `passlib` (untuk hashing password)
- `cornice` (digunakan untuk membangun REST API)
- Dan dependensi lain yang tercantum dalam `backend/manajemen_laundry/setup.py` dan `backend/manajemen_laundry/requirements.txt`

### Database

- PostgreSQL

## Fitur pada Aplikasi

### Fitur Umum

- Autentikasi pengguna (Login & Logout) berbasis JWT.
- Perlindungan route berdasarkan role pengguna (admin/karyawan).

### Fitur Publik

- Melacak status pesanan

### Fitur Admin

- **Manajemen Pesanan:**
  - Menambah pesanan laundry baru.
  - Melihat daftar semua pesanan.
  - Memperbarui status pesanan (misalnya: diterima, dicuci, disetrika, selesai, diambil).
  - Menghapus pesanan.
  - Menghapus pesanan lama yang sudah selesai lebih dari 7 hari.
- **Manajemen Pengguna (jika diimplementasikan):**
  - Menambah, mengubah, menghapus data karyawan.
- **Manajemen Layanan (jika diimplementasikan):**
  - Menambah, mengubah, menghapus jenis layanan dan harga.

### Fitur Karyawan

- **Manajemen Pesanan:**
  - Menambah pesanan laundry baru.
  - Melihat daftar semua pesanan.
  - Memperbarui status pesanan.
  - (Biasanya tidak bisa menghapus pesanan, tergantung kebijakan)

### Fitur Tambahan

- Pencarian pesanan berdasarkan nama pelanggan, nomor HP, status, dan jenis layanan.

## Cara Menjalankan Aplikasi

### Prasyarat

- Node.js dan npm (untuk frontend)
- Python 3 dan pip (untuk backend)
- PostgreSQL server sudah terinstal dan berjalan.

### Backend Setup

1.  Navigasi ke direktori `backend/manajemen_laundry`.
2.  Buat dan aktifkan virtual environment:
    ```bash
    python -m venv env
    source env/bin/activate  # Linux/macOS
    # env\Scripts\activate  # Windows
    ```
3.  Instal dependensi:
    ```bash
    pip install -e .
    # atau jika ada requirements.txt yang lebih lengkap
    # pip install -r requirements.txt
    ```
4.  Konfigurasi database:
    - Buat database PostgreSQL (misalnya `manajemen_laundry_db`).
    - Sesuaikan string koneksi `sqlalchemy.url` di `development.ini` dengan detail database Anda.
    - Sesuaikan `jwt.secret` di `development.ini`.
5.  Inisialisasi database (membuat tabel dan data awal jika ada skripnya):
    ```bash
    initialize_manajemen_laundry_db development.ini
    ```
6.  Jalankan server backend:
    ```bash
    pserve development.ini --reload
    ```
    Server backend biasanya berjalan di `http://localhost:6543`.

### Frontend Setup

1.  Navigasi ke direktori `frontend`.
2.  Instal dependensi:
    ```bash
    npm install
    ```
3.  Pastikan URL API backend di frontend (biasanya di `src/services/api.js` atau variabel environment) sudah benar menunjuk ke server backend (misalnya `http://localhost:6543`).
4.  Jalankan server development frontend:
    ```bash
    npm run dev
    ```
    Aplikasi frontend berjalan di `http://localhost:5173`

## Referensi

- [Dokumentasi React](https://reactjs.org/docs/getting-started.html)
- [Dokumentasi Pyramid Web Framework](https://docs.pylonsproject.org/projects/pyramid/en/latest/)
- [Dokumentasi SQLAlchemy](https://docs.sqlalchemy.org/en/14/)
- [Dokumentasi Tailwind CSS](https://tailwindcss.com/docs)

---

### Pengembang

- Ikhsannudin Lathief - 122140137

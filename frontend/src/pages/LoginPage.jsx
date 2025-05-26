import { useState } from "react";
import { useAuth } from "../context/useAuth"; // Anda sudah menggunakan custom hook, ini bagus!
import { useNavigate } from "react-router-dom";
import LoginHeader from "../components/login/LoginHeader";
import LoginForm from "../components/login/LoginForm";

export default function LoginPage() {
  // Ambil juga fungsi logout jika Anda ingin membersihkan state AuthProvider secara eksplisit
  const { login, logout: authLogout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (credentials) => {
    setError("");
    setLoading(true);

    try {
      if (!credentials.username || !credentials.password) {
        setError("Username dan password harus diisi.");
        setLoading(false);
        return;
      }

      const userDetails = await login(credentials); // login dari AuthProvider

      if (userDetails && userDetails.role) {
        if (userDetails.role === "admin") {
          navigate("/admin/dashboard");
        } else if (userDetails.role === "karyawan") {
          navigate("/karyawan/dashboard");
        } else {
          // Role tidak dikenali atau tidak diizinkan
          console.error(
            "Login berhasil tetapi role tidak diizinkan:",
            userDetails.role
          );
          setError(
            `Peran "${userDetails.role}" tidak diizinkan untuk mengakses sistem ini.`
          );
          // Panggil logoutuntuk membersihkan state dan sessionStorage
          authLogout();
        }
      } else {
        // Ini kondisi error jika backend mengembalikan token tapi tidak ada userDetails atau role
        console.error(
          "Login berhasil tetapi tidak ada detail user atau role yang valid."
        );
        setError(
          "Gagal memproses detail pengguna setelah login. Silakan coba lagi."
        );
        // Mungkin juga panggil authLogout() di sini
        authLogout();
      }
    } catch (err) {
      // Error dari AuthProvider.login
      setError(err.message || "Login gagal. Periksa kredensial Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LoginHeader />
        <LoginForm onSubmit={handleLogin} error={error} loading={loading} />
        <div className="flex justify-center mt-6">
          <div className="bg-yellow-400 h-1.5 w-24 rounded-full"></div>
        </div>
        <p className="text-center mt-6 text-blue-600">
          <span className="text-sm">© 2025 Manajemen Laundry</span>
        </p>
      </div>
    </div>
  );
}

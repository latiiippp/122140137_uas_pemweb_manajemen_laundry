import { useState } from "react";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import LoginHeader from "../components/login/LoginHeader";
import LoginForm from "../components/login/LoginForm";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (credentials) => {
    setError("");
    setLoading(true);

    try {
      if (!credentials.username || !credentials.password) {
        throw new Error("Username and password are required");
      }

      await login(credentials);
      // After successful login, redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LoginHeader />
        <LoginForm onSubmit={handleLogin} error={error} loading={loading} />

        {/* Yellow accent element */}
        <div className="flex justify-center mt-6">
          <div className="bg-yellow-400 h-1.5 w-24 rounded-full"></div>
        </div>

        <p className="text-center mt-6 text-blue-600">
          <span className="text-sm">© 2023 Laundry Management System</span>
        </p>
      </div>
    </div>
  );
}

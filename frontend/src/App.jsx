import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import OrdersPage from "./pages/OrdersPage";
import UsersPage from "./pages/UsersPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthProvider";
import { OrderProvider } from "./context/OrderProvider";
import { UserProvider } from "./context/UserProvider"; // Import UserProvider
import { useAuth } from "./context/useAuth";

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" /> : <LoginPage />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            {user?.role === "admin" ? (
              <UsersPage />
            ) : (
              <Navigate to="/dashboard" />
            )}
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <OrderProvider>
        <UserProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </UserProvider>
      </OrderProvider>
    </AuthProvider>
  );
}

export default App;

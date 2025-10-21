import { Navigate, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./state/AuthContext.jsx";

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

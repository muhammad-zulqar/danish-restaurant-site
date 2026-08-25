import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import AboutPage from './pages/AboutPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminLoginPage from './pages/AdminLoginPage';
import ContactPage from './pages/ContactPage';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import OrdersPage from './pages/OrdersPage';
import ReservationsPage from './pages/ReservationsPage';
import './App.css';

function ProtectedRoute({ token, children }) {
  if (!token) {
    return <Navigate to="/admin" replace />;
  }
  return children;
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('adminToken'));

  const logout = () => {
    localStorage.removeItem('adminToken');
    setToken('');
  };

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/reservations" element={<ReservationsPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/admin" element={<AdminLoginPage setToken={setToken} />} />
        <Route
          path="/admin/dashboard"
          element={(
            <ProtectedRoute token={token}>
              <AdminDashboardPage token={token} onLogout={logout} />
            </ProtectedRoute>
          )}
        />
      </Route>
    </Routes>
  );
}

export default App;

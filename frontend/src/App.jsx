import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { ToastProvider } from './components/Toast';
import Navbar        from './components/Navbar';
import Footer        from './components/Footer';
import Home          from './pages/Home';
import Shop          from './pages/Shop';
import Login         from './pages/Login';
import Register      from './pages/Register';
import Cart          from './pages/Cart';
import Orders        from './pages/Orders';
import Wishlist      from './pages/Wishlist';
import ProductDetail from './pages/ProductDetail';
import Admin         from './pages/Admin';

const PrivateRoute = ({ children }) => {
  const { user } = useSelector(s => s.auth);
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user } = useSelector(s => s.auth);
  if (!user)         return <Navigate to="/login" replace />;
  if (!user.isAdmin) return <Navigate to="/"      replace />;
  return children;
};

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ScrollToTop />
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <div style={{ flex: 1 }}>
            <Routes>
              <Route path="/"            element={<Home />} />
              <Route path="/products"    element={<Shop />} />
              <Route path="/shop"        element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/login"       element={<Login />} />
              <Route path="/register"    element={<Register />} />
              <Route path="/wishlist"    element={<Wishlist />} />
              <Route path="/cart"   element={<PrivateRoute><Cart /></PrivateRoute>} />
              <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
              <Route path="/admin"  element={<AdminRoute><Admin /></AdminRoute>} />
              <Route path="*" element={
                <div style={{ textAlign: 'center', padding: '100px 20px', minHeight: '60vh' }}>
                  <p style={{ fontSize: 80, marginBottom: 16 }}>🔍</p>
                  <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, color: '#1e293b' }}>404 — Page Not Found</h2>
                  <a href="/" style={{ color: '#6366f1', fontWeight: 700, textDecoration: 'none' }}>← Go Home</a>
                </div>
              } />
            </Routes>
          </div>
          <Footer />
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}

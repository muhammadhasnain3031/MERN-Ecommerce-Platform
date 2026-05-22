import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar        from './components/Navbar';
import Footer        from './components/Footer';
import Home          from './pages/Home';
import Shop          from './pages/Shop';
import Login         from './pages/Login';
import Register      from './pages/Register';
import Cart          from './pages/Cart';
import Orders        from './pages/Orders';
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

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"           element={<Home />}          />
        <Route path="/products"   element={<Shop />}          />
        <Route path="/shop"       element={<Shop />}          />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/login"      element={<Login />}         />
        <Route path="/register"   element={<Register />}      />
        <Route path="/cart" element={
          <PrivateRoute><Cart /></PrivateRoute>
        } />
        <Route path="/orders" element={
          <PrivateRoute><Orders /></PrivateRoute>
        } />
        <Route path="/admin" element={
          <AdminRoute><Admin /></AdminRoute>
        } />
        <Route path="*" element={
          <div style={{ textAlign:'center', padding:'100px 20px' }}>
            <p style={{ fontSize:80, marginBottom:16 }}>🔍</p>
            <h2 style={{ fontSize:28, fontWeight:900, marginBottom:8 }}>404 — Page Not Found</h2>
            <a href="/" style={{ color:'#2563eb', fontWeight:700 }}>← Go Home</a>
          </div>
        } />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
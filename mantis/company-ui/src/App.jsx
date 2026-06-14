import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CompanyLogin from './pages/CompanyLogin';
import CompanyRegister from './pages/CompanyRegister';
import Dashboard from './pages/Dashboard';
import AddProduct from './pages/AddProduct';
import UploadMaterials from './pages/UploadMaterials';

function RequireAuth({ children }) {
  const token = localStorage.getItem('company_token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<CompanyLogin />} />
        <Route path="/register" element={<CompanyRegister />} />
        <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/add-product" element={<RequireAuth><AddProduct /></RequireAuth>} />
        <Route path="/upload/:productId" element={<RequireAuth><UploadMaterials /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

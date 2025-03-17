import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products"; // ✅ Import Products Page
import Consultation from './pages/Consultation';


function App() {
  const PrivateRoute = ({ children }) => {
    return localStorage.getItem("token") ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />  {/* ✅ Protect Products Page */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/consultation" element={<PrivateRoute><Consultation /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" />} /> {/* ✅ Redirect unknown routes */}
      </Routes>
    </Router>
  );
}

export default App;

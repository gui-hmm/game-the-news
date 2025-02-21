import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/home";
import Login from "../pages/login";
import About from "../pages/about";
import PrivateRoute from "./privateRoute";
import AdminDashboard from "../pages/adminDashboard";
import UserDashboard from "../pages/userDashboard";
import { AuthProvider } from "../context/authContext";

const AppRoutes = () => {
  console.log("AppRoutes: Rendering routes");

  return (
    <AuthProvider>
      <Routes>
        <Route 
        path="/user-dashboard" 
        element={
          <PrivateRoute>
            <UserDashboard />
          </PrivateRoute>
        } />
        <Route 
        path="/admin-dashboard" 
        element={
          <PrivateRoute>
            <AdminDashboard />
          </PrivateRoute>
        } />
        <Route path="/" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<Home />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  );
};

export default AppRoutes;

import { Routes, Route, Navigate } from "react-router-dom";
import { CreateUser } from "../pages/createUser";
import Login from "../pages/login";
import PrivateRoute from "./privateRoute";
import AdminDashboard from "../pages/adminDashboard";
import UserDashboard from "../pages/userDashboard";
import { AuthProvider } from "../context/authContext";
import { Badges } from "../pages/badges";
import { Messages } from "../pages/messages";

const AppRoutes = () => {
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
        <Route 
        path="/create-user" 
        element={
          <PrivateRoute>
            <CreateUser />
          </PrivateRoute>
        } />
        <Route 
        path="/badges" 
        element={
          <PrivateRoute>
            <Badges />
          </PrivateRoute>
        } />
        <Route 
        path="/messages" 
        element={
          <PrivateRoute>
            <Messages />
          </PrivateRoute>
        } />
        <Route path="/" element={<Login />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  );
};

export default AppRoutes;

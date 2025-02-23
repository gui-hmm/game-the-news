import { JSX } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

const PrivateRoute = ({ children, adminOnly = false }: { children: JSX.Element, adminOnly?: boolean }) => {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <div>Carregando...</div>; 
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/user-dashboard" />;
  }

  return children;
};

export default PrivateRoute;
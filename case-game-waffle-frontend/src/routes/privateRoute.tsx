import { JSX } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

const PrivateRoute = ({ children, adminOnly = false }: { children: JSX.Element, adminOnly?: boolean }) => {
  const { user, isAdmin, isLoading } = useAuth();

  console.log("PrivateRoute: isLoading:", isLoading, "user:", user, "isAdmin:", isAdmin); // Log para depuração

  if (isLoading) {
    return <div>Carregando...</div>; // Exibe um indicador de carregamento
  }

  if (!user) {
    return <Navigate to="/" />; // Redireciona para a página de login se não houver usuário
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/user-dashboard" />; // Redireciona para o dashboard do usuário se não for admin
  }

  return children;
};

export default PrivateRoute;
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/userService";

interface AuthContextType {
  user: any;
  isAdmin: boolean;
  isLoading: boolean;
  authChecked: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));

        setUser(payload);
        setIsAdmin(payload.isAdmin || false);
      } catch (error) {
        console.error("Token inválido", error);
        localStorage.removeItem("token");
      }
    }
    setIsLoading(false);
    setAuthChecked(true); // Marca que a autenticação foi verificada
  }, []);

  const login = async (email: string) => {
    setIsLoading(true);
    try {
      const token = await loginUser(email);
      localStorage.setItem("token", token);

      const payload = JSON.parse(atob(token.split(".")[1]));

      setUser(payload);
      setIsAdmin(payload.isAdmin || false);

      setTimeout(() => {
        if (payload.isAdmin) {
          navigate("/admin-dashboard");
        } else {
          navigate("/user-dashboard");
        }
      }, 0);
    } catch (error) {
      console.error("Erro no login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAdmin(false);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading, authChecked, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

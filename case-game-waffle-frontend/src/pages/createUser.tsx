import React, { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { createUser } from "../services/adminService";
import Button from "../components/button";
import AdminLayout from "../layouts/adminLayout";

export const CreateUser: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(""); // Novo estado para erro

  // Função para validar o formato do email
  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async () => {
    // Validação do email antes de fazer a requisição
    if (!validateEmail(email)) {
      setError("Por favor, insira um e-mail válido.");
      return;
    }

    setError(""); // Limpa o erro se o email for válido

    const response = await createUser(email, isAdmin);
    setMessage(response.error || "Usuário criado com sucesso!");
  };
  
  return (
    <AdminLayout>
      <Card>
        <CardContent>
          <h2 className="text-3xl font-semibold pb-5">Criar Usuário</h2>
          <div className="flex justify-center">
            <div className="flex flex-col md:flex-row justify-between items-center max-w-2xl w-full space-y-4 md:space-y-0">
              <input
                type="email"
                className="border-b-2 p-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
              />
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isAdmin}
                  onChange={() => setIsAdmin(!isAdmin)}
                />{" "}
                <span>Administrador</span>
              </label>
              <Button label="Criar Usuário" onClick={handleSubmit} />
            </div>
          </div>
          {error && <p className="text-red-500 pt-6">{error}</p>}
          {message && <p className="text-green-500 pt-6">{message}</p>} 
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

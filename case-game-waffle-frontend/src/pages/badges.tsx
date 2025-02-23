import React, { useState } from "react";
import Button from "../components/button";
import { Card, CardContent } from "../components/ui/card";
import { createBadge } from "../services/adminService";
import AdminLayout from "../layouts/adminLayout";

export const Badges: React.FC = () => {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    const response = await createBadge(name, type);
    setMessage(response.error || "Badge criada com sucesso!");
  };

  return (
    <AdminLayout>
      <Card>
        <CardContent>
          <h2 className="text-3xl font-semibold pb-6">Criar Badge</h2>
          <div className="flex justify-center">
            <div className="flex flex-col md:flex-row justify-between items-center max-w-2xl w-full space-y-4 md:space-y-0">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome"
                className="border-b-2 p-1"
              />
              <input
                type="text"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="Tipo"
                className="border-b-2 p-1"
              />
              <Button label="Criar Badge" onClick={handleSubmit} />
            </div>
          </div>
          {message && <p className="mt-4 text-green-500 text-center">{message}</p>}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

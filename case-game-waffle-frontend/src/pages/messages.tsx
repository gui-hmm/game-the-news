import React, { useState } from "react";
import Button from "../components/button";
import { Card, CardContent } from "../components/ui/card";
import { createMessage } from "../services/adminService";
import AdminLayout from "../layouts/adminLayout";

export const Messages: React.FC = () => {
  const [text, setText] = useState("");
  const [type, setType] = useState("");
  const [minStreak, setMinStreak] = useState(0);
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    const response = await createMessage(text, type, minStreak);
    setMessage(response.error || "Mensagem criada com sucesso!");
  };

  return (
    <AdminLayout>
      <Card>
        <CardContent>
          <h2 className="text-3xl font-semibold pb-6">Criar Mensagem</h2>
          <div className="flex justify-center">
            <div className="flex justify-between items-center max-w-4xl w-full">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Texto"
                className="border-b-2 p-1"
              />
              <input
                type="text"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="Tipo"
                className="border-b-2 p-1"
              />
              <input
                type="number"
                value={minStreak}
                onChange={(e) => setMinStreak(Number(e.target.value))}
                placeholder="Mínimo Streak"
                className="border-2 p-1 rounded-lg ps-3"
              />
              <Button label="Criar Mensagem" onClick={handleSubmit} />
            </div>
          </div>
          {message && <p className="mt-4 text-green-500 text-center">{message}</p>}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

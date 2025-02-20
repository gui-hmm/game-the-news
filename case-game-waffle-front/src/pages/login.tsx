import { useState } from "react";
import Button from "../components/button";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray">
      <div className="bg-white p-6 rounded shadow-lg w-80">
        <h2 className="text-2xl font-bold text-black mb-4">Login</h2>
        <input
          type="text"
          placeholder="Usuário"
          className="w-full p-2 mb-2 border border-gray rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Senha"
          className="w-full p-2 mb-4 border border-gray rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button label="Entrar" onClick={() => alert("Login efetuado!")} />
      </div>
    </div>
  );
};

export default Login;

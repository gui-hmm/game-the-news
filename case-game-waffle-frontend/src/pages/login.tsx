import { useState } from "react";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email);
      navigate("/");
    } catch (err) {
      setError("Falha no login. Verifique seu email e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-yellow">
      <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md w-80">
        <div className="flex justify-center">
          <h1 className="text-black text-3xl mb-4">Login</h1>
        </div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          placeholder="Digite seu email"
          required
        />
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <button
          type="submit"
          className="w-full p-2 bg-yellow text-black rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
};

export default Login;

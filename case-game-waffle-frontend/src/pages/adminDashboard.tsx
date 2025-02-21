import { useEffect, useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

interface User {
  email: string;
  streak: number;
  max_streak: number;
  total_opens: number;
}

interface Post {
  data: {
    id: string;
    title: string;
    authors: string[];
    created_at: string;
    status: string;
    audience: string;
    tags: string[];
  };
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const usersRes = await fetch("/admin/users");
        const postsRes = await fetch("/admin/posts");

        const usersData = await usersRes.json();
        const postsData = await postsRes.json();

        setUsers(usersData.users);
        setPosts(postsData);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Contagem de status dos posts
  const postStatusCount = posts.reduce((acc, post) => {
    acc[post.data.status] = (acc[post.data.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusChartData = Object.entries(postStatusCount).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50"];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard do Administrador</h1>

      {loading ? (
        <p>Carregando dados...</p>
      ) : (
        <>
          {/* Tabela de Usuários */}
          <Card>
            <div className="mb-6">
              <CardContent>
                <h2 className="text-xl font-semibold mb-3">Usuários</h2>
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2">Email</th>
                      <th className="border p-2">Streak Atual</th>
                      <th className="border p-2">Streak Máximo</th>
                      <th className="border p-2">Total de Acessos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.email} className="text-center">
                        <td className="border p-2">{user.email}</td>
                        <td className="border p-2">{user.streak}</td>
                        <td className="border p-2">{user.max_streak}</td>
                        <td className="border p-2">{user.total_opens}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </div>
          </Card>

          {/* Gráfico de Streaks */}
          <Card >
            <div className="mb-6">
              <CardContent>
                <h2 className="text-xl font-semibold mb-3">Ranking de Streaks</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={users}>
                    <XAxis dataKey="email" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="streak" fill="#8884d8" name="Streak Atual" />
                    <Bar dataKey="max_streak" fill="#82ca9d" name="Streak Máximo" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </div>
          </Card>

          {/* Tabela de Posts */}
          <Card >
            <div className="mb-6">
              <CardContent>
                <h2 className="text-xl font-semibold mb-3">Posts Recentes</h2>
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2">ID</th>
                      <th className="border p-2">Título</th>
                      <th className="border p-2">Autores</th>
                      <th className="border p-2">Criado em</th>
                      <th className="border p-2">Status</th>
                      <th className="border p-2">Audiência</th>
                      <th className="border p-2">Tags</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr key={post.data.id} className="text-center">
                        <td className="border p-2">{post.data.id}</td>
                        <td className="border p-2">{post.data.title}</td>
                        <td className="border p-2">{post.data.authors.join(", ")}</td>
                        <td className="border p-2">{new Date(post.data.created_at).toLocaleDateString()}</td>
                        <td className="border p-2">{post.data.status}</td>
                        <td className="border p-2">{post.data.audience}</td>
                        <td className="border p-2">{post.data.tags.join(", ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </div>
          </Card>

          {/* Gráfico de Status dos Posts */}
          <Card>
            <CardContent>
              <h2 className="text-xl font-semibold mb-3">Distribuição de Status dos Posts</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {statusChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

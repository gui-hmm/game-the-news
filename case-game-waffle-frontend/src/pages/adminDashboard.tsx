import { useEffect, useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import AdminLayout from "../layouts/adminLayout";
import { fetchUsers, fetchPosts } from "../services/adminService";

interface User {
  email: string;
  streak: number | null;
  max_streak: number | null;
  total_opens: number | null;
}

interface Post {
  id: string;
  title: string;
  subtitle: string;
  authors: string[];
  created: Date | null;
  status: string;
  subject_line: string;
  preview_text: string;
  slug: string;
  thumbnail_url: string;
  web_url: string;
  audience: string;
  platform: string;
  content_tags: string | null;
  hidden_from_feed: boolean;
  publish_date: string;
  displayed_date: string;
  meta_default_description: string;
  meta_default_title: string;
  content: {
    free: {
      email: string;
      rss: string;
      web: string;
    };
    premium: {
      email: string;
      web: string;
    };
  };
  stats: {
    clicks: Array<{
      total_click_through_rate: number;
      total_clicks: number;
      total_unique_clicks: number;
    }>;
    email: {
      clicks: number;
      delivered: number;
      opens: number;
      recipients: number;
      spam_reports: number;
      unique_clicks: number;
      unique_opens: number;
      unsubscribes: number;
    };
    web: {
      clicks: number;
      views: number;
    };
  };
}

interface ApiUserResponse {
  data: {
    users?: User[];
  };
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function loadData() {
      if (!token) return;

      try {
        const usersResponse = await fetchUsers(token) as unknown  as ApiUserResponse;
        const postsResponse = await fetchPosts(token);

        console.log("Users Data:", usersResponse);
        console.log("Posts Data:", postsResponse);

        if (usersResponse?.data?.users && Array.isArray(usersResponse.data.users)) {
          setUsers(usersResponse.data.users);
        } else {
          console.error("Resposta inesperada da API (users):", usersResponse);
          setUsers([]);
        }

        if (Array.isArray(postsResponse)) {
          setPosts(postsResponse);
        }
        else if (postsResponse && 'data' in postsResponse && Array.isArray(postsResponse.data)) {
          setPosts(postsResponse.data);
        } 
        else {
          console.error("Resposta inesperada da API (posts):", postsResponse);
          setPosts([]);
        }

      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [token]);

  const postStatusCount = posts.reduce((acc, post) => {
    acc[post.status] = (acc[post.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusChartData = Object.entries(postStatusCount).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  const postPerformanceData = posts.map((post) => ({
    title: post.title,
    emailClicks: post.stats.email.clicks,
    webClicks: post.stats.web.clicks,
    webViews: post.stats.web.views,
  }));

  const emailOpenRateData = posts.map((post) => {
    const uniqueOpens = post.stats.email.unique_opens || 0;
    const recipients = post.stats.email.recipients || 0;
    const openRate = recipients !== 0 ? ((uniqueOpens / recipients) * 100).toFixed(2) : 0;
    return {
      title: post.title,
      openRate,
    };
  });

  const platformPerformanceData = posts.reduce((acc, post) => {
    const views = post.stats.web.views;
    acc[post.platform] = (acc[post.platform]) + views;
    return acc;
  }, {} as Record<string, number>);

  const platformChartData = Object.entries(platformPerformanceData).map(([platform, views]) => ({
    name: platform,
    views,
  }));

  const COLORS = ["#240E0B", "#FFCE04", "#615A5A"];

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4 text-yellow-600">Dashboard do Administrador</h1>

        {loading ? (
          <p className="text-gray-600">Carregando dados...</p>
        ) : (
          <>
            {/* Tabela de Usuários */}
            <Card>
              <CardContent>
                <h2 className="text-xl font-semibold mb-3 text-black">Usuários</h2>
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
                        <td className="border p-2">{user.streak ?? "N/A"}</td>
                        <td className="border p-2">{user.max_streak ?? "N/A"}</td>
                        <td className="border p-2">{user.total_opens ?? "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Gráfico de Ranking de Streaks */}
            <Card>
              <CardContent>
                <h2 className="text-xl font-semibold mb-3 text-black">Ranking de Streaks</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={users}>
                    <XAxis dataKey="email" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="streak" fill="#FFCE04" name="Streak Atual" />
                    <Bar dataKey="max_streak" fill="##240E0B" name="Streak Máximo" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Distribuição de Status dos Posts */}
            <Card>
              <CardContent>
                <h2 className="text-xl font-semibold mb-3 text-black">Distribuição de Status dos Posts</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={statusChartData} cx="50%" cy="50%" outerRadius={100} fill="#FFEB3B" dataKey="value">
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Clicks e Visualizações por Post */}
            <Card>
              <CardContent>
                <h2 className="text-xl font-semibold mb-3 text-black">Clicks e Visualizações por Post</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={postPerformanceData}>
                    <XAxis dataKey="title" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="emailClicks" fill="#FFC107" name="Clicks (Email)" />
                    <Bar dataKey="webClicks" fill="#240E0B" name="Clicks (Web)" />
                    <Bar dataKey="webViews" fill="#615A5A" name="Visualizações (Web)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Taxa de Abertura de Emails */}
            <Card>
              <CardContent>
                <h2 className="text-xl font-semibold mb-3 text-black">Taxa de Abertura de Emails</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={emailOpenRateData}>
                    <XAxis dataKey="title" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="openRate" stroke="#FFC107" name="Taxa de Abertura (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Desempenho por Plataforma */}
            <Card>
              <CardContent>
                <h2 className="text-xl font-semibold mb-3 text-black">Desempenho por Plataforma</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={platformChartData} cx="50%" cy="50%" outerRadius={100} fill="#FFEB3B" dataKey="views">
                      {platformChartData.map((entry, index) => (
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
    </AdminLayout>
  );
}
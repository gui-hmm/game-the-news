import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "../components/ui/card";
import { fetchStats, fetchRanking } from "../services/userService";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import UserLayout from "../layouts/userLayout";
import Button from "../components/button";

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any | null>(null);
  const [ranking, setRanking] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function loadData() {
      if (!token) return;

      try {
        const statsData = await fetchStats(token);
        const rankingData = await fetchRanking(token);
        setStats(statsData);
        setRanking(rankingData);
      } catch (error) {
        console.error("Erro ao buscar dados", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [token]);

  if (loading) {
    return (
      <UserLayout>
        <p>Carregando...</p>
      </UserLayout>
    ); 
  }

  if (!stats || !ranking) {
    return <p>Erro ao carregar os dados.</p>;
  }

  return (
    <UserLayout>
      <div className="ps-6">
        <Button label="Sair" onClick={() => { logout(); navigate("/"); }}/>
      </div>
      <div className="p-6 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent>
            <h2 className="text-xl font-semibold">🔥 Streak Atual</h2>
            <p className="text-4xl font-bold text-orange-500">{stats.streak} dias</p>
            <p className="text-gray-600">Recorde: {stats.max_streak} dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="text-xl font-semibold">📬 Histórico de Aberturas</h2>
            <p className="text-4xl font-bold text-blue-500">{stats.total_opens}</p>
            <p className="text-gray-600">Total de vezes que você abriu a newsletter</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="text-xl font-semibold">🏆 Posição no Ranking</h2>
            <p className="text-4xl font-bold text-green-500">#{ranking.userPosition}</p>
            <p className="text-gray-600">Quanto mais alto, melhor!</p>
          </CardContent>
        </Card>

        <div className="col-span-1 md:col-span-2">
          <Card>
            <CardContent>
              <h2 className="text-xl font-semibold">📊 Evolução do Streak</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[{ name: "Streak", value: stats.streak }]}>  
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {stats.message && (
          <Card>
            <CardContent>
              <div className="p-6 text-center bg-yellow-100 border-l-4 border-yellow-500">
                <h2 className="text-xl font-semibold">💡 Motivação</h2>
                <p className="text-lg italic">“{stats.message}”</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </UserLayout>
  );
};

export default UserDashboard;
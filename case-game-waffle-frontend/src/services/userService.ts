const apiUrl = process.env.REACT_APP_API_URL; 

export const loginUser = async (email: string): Promise<string> => {
    const response = await fetch(`${apiUrl}/login`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });

    if (!response.ok) {
        throw new Error("Erro ao tentar fazer login");
    }

    const data = await response.json();
    return data.token;
};

export const fetchStats = async (token: string) => {
    const response = await fetch(`${apiUrl}/api/stats`, {
        headers: { Authorization: `Bearer ${token}` },
    });
  
    if (!response.ok) {
        throw new Error("Erro ao buscar estatísticas");
    }
  
    return response.json();
};

export const fetchRanking = async (token: string) => {
    const response = await fetch(`${apiUrl}/api/ranking`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        throw new Error("Erro ao buscar ranking");
    }

    return response.json();
};


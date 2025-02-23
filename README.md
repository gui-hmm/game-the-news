# 📢 Game The News

📊 **Game The News** é uma plataforma gamificada para engajamento de leitores em newsletters. O projeto inclui uma **área logada** para leitores acompanharem seu streak diário e um **dashboard administrativo** para monitoramento e análise de métricas.

🚀 **Frontend:** [Game The News](https://game-the-news.pages.dev/)  
🛠 **Backend:** [API Game The News](https://case-game-waffle-backend.henriquemelomoura.workers.dev/)

---

## 🛠 Tecnologias Usadas

### **Frontend (React + Tailwind + JWT)**
- **React.js** para a interface
- **Tailwind CSS** para estilização
- **JWT** para autenticação segura
- **Fetch API** para requisições HTTP
- **Recharts** para visualização de dados

### **Backend (Hono + PostgreSQL no Neon)**
- **Hono** rodando em Cloudflare Workers
- **PostgreSQL no Neon** como banco de dados
- **Drizzle ORM** para otimizar queries
- **Webhooks do Beehiiv** para atualizar streaks dos usuários
- **Criptografia JWT** para autenticação segura

### **Infraestrutura**
- **Cloudflare Workers & Pages** para hospedar APIs e frontend
- **GitHub** para versionamento e deploy

---

## 📌 Funcionalidades

### 🔹 **Área Logada (Leitor)**
✅ Login com e-mail e JWT  
✅ Exibição do streak diário  
✅ Histórico de aberturas  
✅ Mensagens motivacionais (ex: “Quanto mais alto, melhor!”)  
✅ Ranking dos leitores mais engajados  

### 🔹 **Dashboard Administrativo**
✅ Visualização de métricas gerais de engajamento  
✅ Ranking dos leitores mais ativos  
✅ Filtros por newsletter, tempo e status do streak  
✅ Gráficos para mostrar padrões de engajamento  
✅ Criação de usuários como admin  
✅ Criação de badges  
✅ Criação de mensagens  

### 🔹 **Regras do Streak**
✅ Streak **+1** a cada dia consecutivo  
✅ **Domingos não contam**  
✅ Caso pule um dia, o streak **zera**  

---

## 🚀 Como Rodar o Projeto Localmente

### **Pré-requisitos**
- [Node.js](https://nodejs.org/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### **Passo a Passo**

1. **Clone o repositório**  
   ```bash
   git clone <seu-repositorio>
   cd <seu-repositorio>

2. **Rodando o Frontend**  
   ```bash
    cd case-game-waffle-frontend
    npm install
    npm start

3. **Rodando o Backend**  
   ```bash
    cd case-game-waffle-backend
    npm install
    wrangler dev

3. **Rodando o Backend**
Crie um arquivo .dev.vars e adicione:
   ```bash
    DATABASE_URL=<sua-url-do-banco>
    JWT_SECRET=<sua-chave-secreta>  
    BEEHIIV_API_KEY=<sua-api-key>

---

📝 **Considerações Finais**
O projeto Game The News busca transformar a experiência de leitura de newsletters em algo divertido e engajador. Se tiver sugestões ou melhorias, sinta-se à vontade para contribuir! 🚀

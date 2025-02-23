import { ReactNode } from "react";
import AdminHeader from "../components/adminHeader";
import Footer from "../components/footer";
import Sidebar from "../components/sidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader />
      <div className="flex flex-1 overflow-hidden"> {/* Bloqueia o scroll aqui */}
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto max-h-screen custom-scroll"> {/* Ativa o scroll apenas no main */}
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminLayout;


import { ReactNode, useState } from "react";
import AdminHeader from "../components/adminHeader";
import Footer from "../components/footer";
import Sidebar from "../components/sidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader onMenuClick={toggleSidebar} />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar isOpen={isSidebarOpen} />
        <main className={`flex-1 p-6 overflow-y-auto max-h-screen custom-scroll ${isSidebarOpen ? "ml-64" : ""}`}>
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminLayout;

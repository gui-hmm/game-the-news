import { ReactNode } from "react";
import Footer from "../components/footer";
import UserHeader from "../components/userHeader";

interface UserLayoutProps {
  children: ReactNode;
}

const UserLayout = ({ children }: UserLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <UserHeader />
      <div className="flex flex-1">
        <main className="flex-1 p-6 overflow-y-auto max-h-screen custom-scroll">{children}</main>
      </div>
      <Footer />
    </div>
  );
};

export default UserLayout;

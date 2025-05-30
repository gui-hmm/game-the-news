import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";

interface SidebarProps {
  isOpen: boolean; // Nova prop que controla a visibilidade do Sidebar
}

const Sidebar = ({ isOpen }: SidebarProps) => {
  const { logout } = useAuth();

  return (
    <aside
      className={`bg-gray text-white w-64 p-4 min-h-screen transition-all duration-300 lg:relative absolute top-0 left-0 z-50 ${
        isOpen ? "block" : "hidden"
      } lg:block`}
      style={{
        position: isOpen ? "absolute" : "relative",
      }}
    >
      <nav>
        <ul className="space-y-2">
          <li>
            <Link to="/admin-dashboard" className="block p-2 hover:bg-yellow">
              Dashbord
            </Link>
          </li>
          <li>
            <Link to="/create-user" className="block p-2 hover:bg-yellow">
              Create user admin
            </Link>
          </li>
          <li>
            <Link to="/badges" className="block p-2 hover:bg-yellow">
              Badges
            </Link>
          </li>
          <li>
            <Link to="/messages" className="block p-2 hover:bg-yellow">
              Messages
            </Link>
          </li>
          <li>
            <Link
              to="/"
              className="block p-2 hover:bg-yellow"
              onClick={() => {
                logout();
              }}
            >
              Sair
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;

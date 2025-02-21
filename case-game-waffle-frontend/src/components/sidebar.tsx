import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="bg-gray text-white w-64 p-4 min-h-screen">
      <nav>
        <ul className="space-y-2">
          <li>
            <Link to="/" className="block p-2 hover:bg-yellow">Home</Link>
          </li>
          <li>
            <Link to="/dashboard" className="block p-2 hover:bg-yellow">Dashboard</Link>
          </li>
          <li>
            <Link to="/about" className="block p-2 hover:bg-yellow">Sobre</Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;

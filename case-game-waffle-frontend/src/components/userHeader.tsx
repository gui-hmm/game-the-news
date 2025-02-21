import { Link } from "react-router-dom";

const UserHeader = () => {
    return (
      <header className="bg-yellow text-black p-4 shadow-md flex flex-row">
        <h1 className="text-xl font-bold">The News</h1>
        <div className="text-brown px-4 min-w-screen">
          <nav>
            <ul className="space-y-2 flex flex-row">
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
        </div>
      </header>
    );
  };
  
  export default UserHeader;
  
  
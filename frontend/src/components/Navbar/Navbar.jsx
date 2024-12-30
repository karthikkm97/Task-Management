import { NavLink, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();



  const handleSignOut = () => {
    // Clear user data and navigate to login
    localStorage.clear();
    alert("Signed out successfully");
    navigate("/login");
  };

  return (
    <div className="flex justify-between items-center bg-white px-4 py-3 2xl:py-4 sticky z-10 top-0 shadow-sm">
      {/* Navigation Links */}
      <nav className="flex gap-4 items-center">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `text-lg font-medium px-4 py-2 rounded-full ${
              isActive ? "bg-gray-300 text-gray-900" : "text-gray-700 hover:bg-gray-200"
            }`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/TaskList"
          className={({ isActive }) =>
            `text-lg font-medium px-4 py-2 rounded-full ${
              isActive ? "bg-gray-300 text-gray-900" : "text-gray-700 hover:bg-gray-200"
            }`
          }
        >
          TaskList
        </NavLink>
      </nav>

      {/* Sign Out Button */}
      
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition"
          onClick={handleSignOut}
        >
          Sign Out
        </button>
    </div>
  );
}

export default Navbar;

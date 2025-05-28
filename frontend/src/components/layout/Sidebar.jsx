import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";

// Import modular components
import SidebarHeader from "./sidebar/SidebarHeader";
import UserProfile from "./sidebar/UserProfile";
import Navigation from "./sidebar/Navigation";
import { getNavItems } from "./sidebar/navItems";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-opacity-50 backdrop-blur-[5px] z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-30 h-full w-64 bg-white border-r shadow-lg flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } transition-transform duration-300 ease-in-out`}
      >
        <SidebarHeader toggleSidebar={toggleSidebar} />
        <UserProfile user={user} />

        {/* Menu Navigation */}
        <div className="flex-grow">
          <Navigation
            items={navItems}
            user={user}
            activePath={location.pathname}
          />
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Yellow accent at bottom */}
        <div className="p-4">
          <div className="h-1 w-full bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full"></div>
        </div>
      </div>
    </>
  );
}

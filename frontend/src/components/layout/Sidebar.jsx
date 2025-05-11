import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

// Import modular components
import SidebarHeader from "./sidebar/SidebarHeader";
import UserProfile from "./sidebar/UserProfile";
import Navigation from "./sidebar/Navigation";
import { getNavItems } from "./sidebar/navItems";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { user } = useAuth();
  const location = useLocation();
  const navItems = getNavItems();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-30 h-full w-64 bg-white border-r shadow-lg ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } transition-transform duration-300 ease-in-out`}
      >
        <SidebarHeader toggleSidebar={toggleSidebar} />
        <UserProfile user={user} />
        <Navigation
          items={navItems}
          user={user}
          activePath={location.pathname}
        />

        {/* Yellow accent at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="h-1 w-full bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full"></div>
        </div>
      </div>
    </>
  );
}

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";

interface UserDropdownProps {
  userEmail: string;
  userRole: string;
  onLogout: () => void;
  onSettings?: () => void;
}

export function UserDropdown({
  userEmail,
  userRole,
  onLogout,
  onSettings,
}: UserDropdownProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  const getRoleDisplay = (role: string) => {
    return role === "Admin" ? "Administrator" : "Staff Member";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 transition"
      >
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-white text-orange-600 flex items-center justify-center font-bold text-sm">
          {getInitials(userEmail)}
        </div>

        {/* User Info */}
        <div className="text-left hidden md:block">
          <div className="text-white text-sm font-semibold max-w-[150px] truncate">
            {userEmail}
          </div>
        </div>

        {/* Dropdown Icon */}
        <ChevronDown
          className={`h-4 w-4 text-white transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-lg">
                {getInitials(userEmail)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {userEmail}
                </div>
                <div className="text-xs text-gray-500">
                  {getRoleDisplay(userRole)}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => {
                navigate("/settings");
                setIsOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition"
            >
              <Settings className="h-4 w-4" />
              <span>Account Settings</span>
            </button>

            <button
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

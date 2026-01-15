import React, { useEffect, useState } from "react";
import { LogIn, LogOut, User, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { unregisterPushToken } from "../../utils/pushNotification";

export default function Header() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
    role: "",
  });

  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem("username");
    const role = localStorage.getItem("role");

    if (name && role) {
      setUser({ name, role });
    }
  }, []);

  const handleLogout = () => {
    setLogoutLoading(true);
    // attempt to unregister push token, then clear
    unregisterPushToken().finally(() => {
      // simulate async logout (optional)
      toast.success("Logout successfully!")
      setTimeout(() => {
        localStorage.clear();
        setUser({ name: "", role: "" });
        setLogoutLoading(false);
        navigate("/");
      }, 300);
    });
  };

  return (
    <header className="bg-[#6b3f1d] text-white px-4 sm:px-6 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#8b5a2b] flex items-center justify-center">
          🍃
        </div>
        <div>
          <p className="font-serif text-lg leading-none">Bamboo Cottage</p>
          <p className="text-xs opacity-80">Restaurant Management</p>
        </div>
      </div>

      {/* User */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {user.role && (
          <span className="px-3 py-1 rounded-full border border-white/40 text-sm flex items-center gap-1">
            <User size={14} />
            <span className="truncate max-w-[150px] sm:max-w-none">
              {user.name} ({user.role})
            </span>
          </span>
        )}

        {user.role ? (
          <button
            onClick={handleLogout}
            disabled={logoutLoading}
            className="px-4 py-1.5 rounded-md border border-white/40 hover:bg-white/10 flex items-center gap-2 disabled:opacity-60"
          >
            {logoutLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Logging out...
              </>
            ) : (
              <>
                <LogOut size={14} />
                Logout
              </>
            )}
          </button>
        ) : (
          <button
            onClick={() => navigate("/")}
            className="px-4 py-1.5 rounded-md border border-white/40 hover:bg-white/10 flex items-center gap-1"
          >
            <LogIn size={14} />
            Login
          </button>
        )}
      </div>
    </header>
  );
}

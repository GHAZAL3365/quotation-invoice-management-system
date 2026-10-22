
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";
import { Bell, Search, UserRound } from "lucide-react";

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <header className="sticky top-0 z-20 flex min-h-20 items-center justify-between gap-4 border-b border-border bg-surface px-5 py-4 sm:px-8">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">
          Invoice Management
        </h2>
        <p className="mt-1 hidden text-sm text-text-secondary sm:block">
          Manage your clients, invoices, and payments
        </p>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        {/* <button
          type="button"
          aria-label="Search"
          className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-muted hover:text-primary"
        >
          <Search size={20} />
        </button> */}

        {/* <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-muted hover:text-primary"
        >
          <Bell size={20} />
        </button> */}

        <div className="flex items-center gap-3 border-l border-border pl-3 sm:pl-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-primary">
            <UserRound size={21} />
          </div>


          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-text-primary">
              {user?.name || "User"}
            </p>
            <p className="text-xs capitalize text-text-secondary">
              {user?.role || "Account"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            aria-label="Sign out"
            title="Sign out"
            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-muted hover:text-danger"
          >
            <LogOut size={19} />
          </button>
        </div>
      </div>
    </header>
  );
}

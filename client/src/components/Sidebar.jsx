
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  Wallet,
  Settings,
  ChevronLeft,
} from "lucide-react";

const navigation = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Clients", path: "/clients", icon: Users },
  { label: "Invoices", path: "/invoices", icon: FileText },
  { label: "Payments", path: "/payments", icon: Wallet },
  { label: "Settings", path: "/settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-[#203B5B] text-white">
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-lg font-bold text-[#203B5B]">
          U
        </div>
        <div>
          <h1 className="text-lg font-semibold">Ultrakey</h1>
          <p className="text-xs text-blue-100">Invoice Management</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-3 py-6">
        {navigation.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${
                isActive
                  ? "bg-[#597B9B] font-semibold text-white"
                  : "text-blue-100 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <Icon size={19} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-lg bg-white/5 p-3">
          <p className="text-sm font-medium">Ultrakey Workspace</p>
          <p className="mt-1 text-xs text-blue-100">
            Invoice Administration
          </p>
        </div>
      </div>
    </aside>
  );
}

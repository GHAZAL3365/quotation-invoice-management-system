
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  Settings,
  FilePlus2,
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Clients", path: "/clients", icon: Users },
  { label: "Quotations", path: "/quotations", icon: FileText },
  { label: "Invoices", path: "/invoices", icon: Receipt },
  { label: "Settings", path: "/settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col bg-slate-950 text-white">
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
          <FilePlus2 size={23} />
        </div>

        <div>
          <h1 className="text-lg font-bold">Ultrakey</h1>
          <p className="text-xs text-slate-400">Invoice Manager</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {menuItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4 text-xs text-slate-400">
        Invoice Application
      </div>
    </aside>
  );
}

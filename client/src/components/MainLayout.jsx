
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="ml-64 min-h-screen">
        <Header />

        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

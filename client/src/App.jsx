
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./components/MainLayout";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Invoices from "./pages/Invoices";
import InvoiceForm from "./pages/InvoiceForm";
import Quotations from "./pages/Quotations";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="invoices/new" element={<InvoiceForm />} />
          <Route path="quotations" element={<Quotations />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

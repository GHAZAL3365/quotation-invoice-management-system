
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Clients from "./pages/Clients";
import Invoices from "./pages/Invoices";
import InvoiceDetails from "./pages/InvoiceDetails";
import InvoiceForm from "./pages/InvoiceForm";
import Quotations from "./pages/Quotations";
import CreateQuotation from "./pages/CreateQuotation";
import QuotationDetails from "./pages/QuotationDetails";

function PlaceholderPage({ title }) {
  return (
    <section className="rounded-card border border-border bg-surface p-6 shadow-sm">
      <h1 className="text-xl font-bold text-text-primary">{title}</h1>
      <p className="mt-2 text-sm text-text-secondary">
        This section will be implemented in the next development step.
      </p>
    </section>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />

              <Route path="/clients" element={<Clients />} />

              <Route
                path="/invoices"
                element={<Invoices />}
              />

              <Route path="/quotations" element={<Quotations />} />

              <Route
                path="/payments"
                element={<PlaceholderPage title="Payments" />}
              />

              <Route
                path="/settings"
                element={<PlaceholderPage title="Settings" />}
              />

              <Route path="/invoices" element={<Invoices />} />
              <Route path="/invoices/new" element={<InvoiceForm />} />
              <Route path="/invoices/:id" element={<InvoiceDetails />} />
              <Route path="/invoices/:id/edit" element={<InvoiceForm />} />

              <Route path="/quotations/new" element={<CreateQuotation />} />
              <Route path="/quotations/:id/edit" element={<CreateQuotation />} />
              <Route path="/quotations/:id" element={<QuotationDetails />} />

            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

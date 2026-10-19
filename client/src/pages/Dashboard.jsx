
import { Link } from "react-router-dom";
import {
  Users,
  FileText,
  CreditCard,
  CircleDollarSign,
  ArrowRight,
  Plus,
} from "lucide-react";

const summaryCards = [
  {
    title: "Total Clients",
    value: "—",
    description: "Registered clients",
    icon: Users,
    iconColor: "text-primary",
    iconBackground: "bg-surface-muted",
  },
  {
    title: "Total Invoices",
    value: "—",
    description: "All invoices",
    icon: FileText,
    iconColor: "text-info",
    iconBackground: "bg-info/10",
  },
  {
    title: "Payments Received",
    value: "—",
    description: "Total amount collected",
    icon: CreditCard,
    iconColor: "text-success",
    iconBackground: "bg-success/10",
  },
  {
    title: "Outstanding Amount",
    value: "—",
    description: "Pending collection",
    icon: CircleDollarSign,
    iconColor: "text-warning",
    iconBackground: "bg-warning/10",
  },
];

export default function Dashboard() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Here's an overview of your invoice management.
          </p>
        </div>

        <Link
          to="/invoices"
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-text-inverse transition-colors hover:bg-primary-hover"
        >
          <Plus size={18} />
          Create Invoice
        </Link>
      </section>

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(
          ({
            title,
            value,
            description,
            icon: Icon,
            iconColor,
            iconBackground,
          }) => (
            <article
              key={title}
              className="rounded-card border border-border bg-surface p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-text-secondary">
                    {title}
                  </p>
                  <p className="mt-3 text-2xl font-bold text-text-primary">
                    {value}
                  </p>
                </div>

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBackground} ${iconColor}`}
                >
                  <Icon size={22} />
                </div>
              </div>

              <p className="mt-4 text-xs text-text-secondary">
                {description}
              </p>
            </article>
          ),
        )}
      </section>

      <section className="rounded-card border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <span className="inline-flex rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-primary">
              Welcome
            </span>

            <h2 className="mt-4 text-xl font-bold text-text-primary">
              Welcome to Ultrakey Invoice Management
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              Manage clients, create invoices, track payments, and monitor
              outstanding balances from one place.
            </p>
          </div>

          <Link
            to="/clients"
            className="inline-flex shrink-0 items-center gap-2 self-start text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
          >
            Manage Clients
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </div>
  );
}

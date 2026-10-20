
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Pencil,
  CalendarDays,
  UserRound,
  FileText,
} from "lucide-react";
import quotationService from "../api/quotationApi";

function unwrap(response) {
  return response?.data?.data ?? response?.data ?? response ?? {};
}

function getQuotation(result) {
  return result?.quotation ?? result?.data?.quotation ?? result;
}

function getMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function getStatusClass(status) {
  const classes = {
    Draft: "bg-gray-100 text-gray-700",
    Sent: "bg-blue-100 text-blue-700",
    Accepted: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
    Expired: "bg-orange-100 text-orange-700",
  };

  return classes[status] || "bg-gray-100 text-gray-700";
}

const sectionClass =
  "rounded-xl border border-border bg-surface p-5";

function DetailField({ label, value }) {
  return (
    <div>
      <p className="mb-1 text-sm text-text-secondary">{label}</p>
      <p className="break-words text-sm font-medium text-text-primary">
        {value || "—"}
      </p>
    </div>
  );
}

export default function QuotationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadQuotation() {
      setLoading(true);
      setError("");

      try {
        const response = await quotationService.getQuotationById(id);
        const result = unwrap(response);
        const data = getQuotation(result);

        if (!data || !data._id) {
          throw new Error("Quotation details could not be found.");
        }

        if (active) {
          setQuotation(data);
        }
      } catch (err) {
        if (active) {
          setError(
            getMessage(err, "Failed to load quotation details.")
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadQuotation();

    return () => {
      active = false;
    };
  }, [id]);

  async function handleDownloadPdf() {
    setError("");
    setDownloading(true);

    try {
      const response = await quotationService.downloadQuotationPdf(id);

      // Supports an API function that returns an Axios blob response.
      const blob =
        response instanceof Blob
          ? response
          : response?.data instanceof Blob
            ? response.data
            : new Blob([response?.data ?? response], {
                type: "application/pdf",
              });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `${quotation?.quotationNumber || "quotation"}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        getMessage(err, "Failed to download quotation PDF.")
      );
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-sm text-text-secondary">
          Loading quotation details...
        </p>
      </div>
    );
  }

  if (error && !quotation) {
    return (
      <div className="space-y-4">
        <Link
          to="/quotations"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary"
        >
          <ArrowLeft size={16} />
          Back to Quotations
        </Link>

        <div
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger/5 p-4 text-sm text-danger"
        >
          {error}
        </div>
      </div>
    );
  }

  if (!quotation) return null;

  const client =
    quotation.clientId && typeof quotation.clientId === "object"
      ? quotation.clientId
      : quotation.client && typeof quotation.client === "object"
        ? quotation.client
        : null;

  const clientName =
    client?.name ||
    client?.clientName ||
    client?.companyName ||
    quotation.clientName ||
    "Client details unavailable";

  const items = Array.isArray(quotation.items)
    ? quotation.items
    : [];

  const subtotal =
    Number(quotation.subtotal) ||
    items.reduce(
      (sum, item) =>
        sum +
        (Number(item.quantity) || 0) *
          (Number(item.rate) || 0),
      0
    );

  const discount = Number(quotation.discount) || 0;
  const taxAmount = Number(quotation.taxAmount) || 0;

  const total =
    quotation.total != null
      ? Number(quotation.total)
      : subtotal - discount + taxAmount;

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            to="/quotations"
            className="mb-3 inline-flex items-center gap-2 text-sm text-text-secondary transition hover:text-primary"
          >
            <ArrowLeft size={16} />
            Back to Quotations
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-text-primary">
              Quotation Details
            </h1>

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                quotation.status
              )}`}
            >
              {quotation.status || "Draft"}
            </span>
          </div>

          <p className="mt-1 text-sm text-text-secondary">
            Quotation #{quotation.quotationNumber || "—"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-primary transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download size={16} />
            {downloading ? "Downloading..." : "Download PDF"}
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(`/quotations/${quotation._id}/edit`)
            }
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover"
          >
            <Pencil size={16} />
            Edit Quotation
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger/5 p-4 text-sm text-danger"
        >
          {error}
        </div>
      )}

      {/* Quotation and client information */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className={sectionClass}>
          <div className="mb-5 flex items-center gap-2">
            <FileText size={19} className="text-primary" />
            <h2 className="text-lg font-semibold text-text-primary">
              Quotation Information
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <DetailField
              label="Quotation Number"
              value={quotation.quotationNumber}
            />

            <DetailField
              label="Status"
              value={quotation.status || "Draft"}
            />

            <div className="flex items-start gap-3">
              <CalendarDays
                size={18}
                className="mt-0.5 text-text-secondary"
              />
              <div>
                <p className="mb-1 text-sm text-text-secondary">
                  Quotation Date
                </p>
                <p className="text-sm font-medium text-text-primary">
                  {formatDate(quotation.quotationDate)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CalendarDays
                size={18}
                className="mt-0.5 text-text-secondary"
              />
              <div>
                <p className="mb-1 text-sm text-text-secondary">
                  Valid Until
                </p>
                <p className="text-sm font-medium text-text-primary">
                  {formatDate(quotation.validUntil)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <div className="mb-5 flex items-center gap-2">
            <UserRound size={19} className="text-primary" />
            <h2 className="text-lg font-semibold text-text-primary">
              Client Information
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <DetailField label="Client Name" value={clientName} />

            <DetailField
              label="Email"
              value={client?.email || quotation.clientEmail}
            />

            <DetailField
              label="Phone"
              value={client?.phone || client?.phoneNumber}
            />

            <DetailField
              label="Company"
              value={client?.companyName}
            />
          </div>
        </section>
      </div>

      {/* Items table */}
      <section className={sectionClass}>
        <h2 className="mb-5 text-lg font-semibold text-text-primary">
          Quotation Items
        </h2>

        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-text-secondary">
            No items found for this quotation.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-text-secondary">
                  <th className="px-3 py-3 font-medium">#</th>
                  <th className="px-3 py-3 font-medium">Description</th>
                  <th className="px-3 py-3 text-right font-medium">
                    Quantity
                  </th>
                  <th className="px-3 py-3 text-right font-medium">
                    Rate
                  </th>
                  <th className="px-3 py-3 text-right font-medium">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                {items.map((item, index) => {
                  const amount =
                    item.amount != null
                      ? Number(item.amount)
                      : (Number(item.quantity) || 0) *
                        (Number(item.rate) || 0);

                  return (
                    <tr
                      key={item._id || index}
                      className="border-b border-border last:border-b-0"
                    >
                      <td className="px-3 py-4 text-text-secondary">
                        {index + 1}
                      </td>

                      <td className="px-3 py-4 font-medium text-text-primary">
                        {item.description}
                      </td>

                      <td className="px-3 py-4 text-right text-text-primary">
                        {item.quantity}
                      </td>

                      <td className="px-3 py-4 text-right text-text-primary">
                        {money(item.rate)}
                      </td>

                      <td className="px-3 py-4 text-right font-medium text-text-primary">
                        {money(amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Totals and notes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className={sectionClass}>
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            Notes
          </h2>

          <p className="whitespace-pre-wrap text-sm leading-6 text-text-secondary">
            {quotation.notes || "No additional notes."}
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className="mb-5 text-lg font-semibold text-text-primary">
            Summary
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-text-secondary">Subtotal</span>
              <span className="font-medium text-text-primary">
                {money(subtotal)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-text-secondary">Discount</span>
              <span className="font-medium text-text-primary">
                - {money(discount)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-text-secondary">
                Tax ({Number(quotation.taxRate) || 0}%)
              </span>
              <span className="font-medium text-text-primary">
                {money(taxAmount)}
              </span>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-base font-semibold text-text-primary">
                  Total
                </span>
                <span className="text-xl font-bold text-primary">
                  {money(total)}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="flex justify-end">
        <Link
          to="/quotations"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-primary transition hover:bg-background"
        >
          <ArrowLeft size={16} />
          Back to Quotations
        </Link>
      </div>
    </div>
  );
}

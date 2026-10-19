
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Download, Pencil } from "lucide-react";

import {
  downloadInvoicePdf,
  getInvoiceById,
  getInvoicePayments,
} from "../api/invoiceApi";

function unwrap(response) {
  return response?.data?.data ?? response?.data ?? {};
}

function getInvoice(result) {
  return result?.invoice ?? result?.data?.invoice ?? result;
}

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

function date(value) {
  if (!value) return "—";

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime())
    ? "—"
    : parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ??
    error?.message ??
    "Unable to load invoice details."
  );
}

export default function InvoiceDetails() {
  const { id } = useParams();

  const [invoice, setInvoice] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDetails() {
      setLoading(true);
      setError("");

      try {
        const response = await getInvoiceById(id);
        const result = unwrap(response);
        const invoiceData = getInvoice(result);

        if (!invoiceData?._id) {
          throw new Error("Invoice details were not returned by the server.");
        }

        if (!cancelled) setInvoice(invoiceData);

        try {
          const paymentResponse = await getInvoicePayments(id, {
            page: 1,
            limit: 100,
          });

          const paymentResult = unwrap(paymentResponse);
          const rows = Array.isArray(paymentResult)
            ? paymentResult
            : paymentResult?.payments ??
              paymentResult?.items ??
              paymentResult?.results ??
              [];

          if (!cancelled) setPayments(rows);
        } catch {
          // Payment history is optional for displaying the invoice.
          if (!cancelled) setPayments([]);
        }
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDetails();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleDownload = async () => {
    setDownloading(true);
    setError("");

    try {
      const response = await downloadInvoicePdf(id);
      const url = URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${invoice.invoiceNumber || "invoice"}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-surface p-10 text-center text-sm text-text-secondary">
        Loading invoice details...
      </div>
    );
  }

  if (error && !invoice) {
    return (
      <div className="space-y-4">
        <Link
          to="/invoices"
          className="inline-flex items-center gap-2 text-sm text-primary"
        >
          <ArrowLeft size={16} />
          Back to invoices
        </Link>
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      </div>
    );
  }

  if (!invoice) return null;

  const client =
    invoice.client && typeof invoice.client === "object"
      ? invoice.client
      : null;

  const clientName =
    client?.clientName ?? invoice.clientName ?? "Unknown client";

  const paid = Number(invoice.paidAmount ?? 0);
  const total = Number(invoice.total ?? 0);
  const balance = Math.max(0, total - paid);

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <Link
            to="/invoices"
            className="mt-1 rounded-lg border border-border p-2 text-text-secondary hover:bg-surface-muted"
            aria-label="Back to invoices"
          >
            <ArrowLeft size={18} />
          </Link>

          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              {invoice.invoiceNumber}
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Invoice details and payment history
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {invoice.status !== "Paid" && (
            <Link
              to={`/invoices/${id}/edit`}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-text-primary hover:bg-surface-muted"
            >
              <Pencil size={16} />
              Edit
            </Link>
          )}

          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
          >
            <Download size={16} />
            {downloading ? "Preparing PDF..." : "Download PDF"}
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Invoice total", money(total)],
          ["Amount paid", money(paid)],
          ["Outstanding balance", money(balance)],
          ["Status", invoice.status ?? "Unknown"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-surface p-4 shadow-sm"
          >
            <p className="text-sm text-text-secondary">{label}</p>
            <p className="mt-2 break-words text-xl font-bold text-text-primary">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-text-primary">
          Invoice information
        </h2>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm text-text-secondary">Client</p>
            <p className="mt-1 font-medium text-text-primary">{clientName}</p>
            {client?.email && (
              <p className="mt-1 text-sm text-text-secondary">
                {client.email}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm text-text-secondary">Invoice date</p>
            <p className="mt-1 font-medium text-text-primary">
              {date(invoice.invoiceDate)}
            </p>
          </div>

          <div>
            <p className="text-sm text-text-secondary">Due date</p>
            <p className="mt-1 font-medium text-text-primary">
              {date(invoice.dueDate)}
            </p>
          </div>

          {client?.billingAddress && (
            <div className="sm:col-span-2 lg:col-span-3">
              <p className="text-sm text-text-secondary">Billing address</p>
              <p className="mt-1 whitespace-pre-line text-sm text-text-primary">
                {client.billingAddress}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="border-b border-border p-5">
          <h2 className="text-base font-semibold text-text-primary">
            Line items
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[550px] text-left">
            <thead className="bg-surface-muted text-xs uppercase text-text-secondary">
              <tr>
                <th className="px-5 py-3 font-semibold">Description</th>
                <th className="px-5 py-3 text-right font-semibold">Qty</th>
                <th className="px-5 py-3 text-right font-semibold">Rate</th>
                <th className="px-5 py-3 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(invoice.items ?? []).map((item, index) => (
                <tr key={item._id ?? index}>
                  <td className="px-5 py-4 text-sm text-text-primary">
                    {item.description}
                  </td>
                  <td className="px-5 py-4 text-right text-sm text-text-secondary">
                    {item.quantity}
                  </td>
                  <td className="px-5 py-4 text-right text-sm text-text-secondary">
                    {money(item.rate)}
                  </td>
                  <td className="px-5 py-4 text-right text-sm font-medium text-text-primary">
                    {money(
                      item.amount ??
                        Number(item.quantity) * Number(item.rate)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ml-auto max-w-sm space-y-3 border-t border-border p-5">
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-text-secondary">Subtotal</span>
            <span className="font-medium text-text-primary">
              {money(invoice.subtotal)}
            </span>
          </div>
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-text-secondary">Discount</span>
            <span className="font-medium text-text-primary">
              {money(invoice.discount)}
            </span>
          </div>
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-text-secondary">
              Tax ({Number(invoice.taxRate ?? 0)}%)
            </span>
            <span className="font-medium text-text-primary">
              {money(invoice.taxAmount)}
            </span>
          </div>
          <div className="flex justify-between gap-4 border-t border-border pt-3">
            <span className="font-semibold text-text-primary">Total</span>
            <span className="text-lg font-bold text-primary">
              {money(invoice.total)}
            </span>
          </div>
        </div>

        {invoice.notes && (
          <div className="border-t border-border p-5">
            <h3 className="text-sm font-semibold text-text-primary">Notes</h3>
            <p className="mt-2 whitespace-pre-line text-sm text-text-secondary">
              {invoice.notes}
            </p>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="border-b border-border p-5">
          <h2 className="text-base font-semibold text-text-primary">
            Payment history
          </h2>
        </div>

        {payments.length === 0 ? (
          <p className="p-5 text-sm text-text-secondary">
            No payment records are available for this invoice.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[550px] text-left">
              <thead className="bg-surface-muted text-xs uppercase text-text-secondary">
                <tr>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Method</th>
                  <th className="px-5 py-3 font-semibold">Reference</th>
                  <th className="px-5 py-3 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td className="px-5 py-4 text-sm text-text-secondary">
                      {date(payment.paymentDate)}
                    </td>
                    <td className="px-5 py-4 text-sm text-text-primary">
                      {payment.paymentMethod ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-sm text-text-secondary">
                      {payment.reference ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-semibold text-text-primary">
                      {money(payment.amount?.$numberDecimal ?? payment.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

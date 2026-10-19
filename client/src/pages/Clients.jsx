
import { useCallback, useEffect, useState } from "react";
import { Search, Users, RefreshCw, Plus, Pencil, Trash2 } from "lucide-react";
import { getClients, deleteClient } from "../api/clientApi";
import ClientFormModal from "../components/ClientFormModal";

function extractClients(response) {
  const data = response?.data ?? response;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.clients)) return data.clients;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;

  return [];
}

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadClients = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getClients({
        page,
        limit,
        search: search.trim() || undefined,
      });

      setClients(extractClients(response));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load clients. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadClients();
    }, 250);

    return () => clearTimeout(timer);
  }, [loadClients]);

  const handleSaveSuccess = (message) => {
    setShowCreateModal(false);
    setSelectedClient(null);
    setSuccessMessage(message);

    // Return to page one after creating a client.
    if (!selectedClient) {
      setPage(1);
    }

    loadClients();
  };

  const handleDelete = async (client) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${client.clientName}"?`,
    );

    if (!confirmed) return;

    setDeletingId(client._id);
    setError("");
    setSuccessMessage("");

    try {
      await deleteClient(client._id);

      setSuccessMessage("Client deleted successfully.");

      // If the last record on a page was deleted, go back one page.
      if (clients.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadClients();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete client. Please try again.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setSelectedClient(null);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Clients
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Manage your client information and billing details.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSuccessMessage("");
            setError("");
            setSelectedClient(null);
            setShowCreateModal(true);
          }}
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-text-inverse transition-colors hover:bg-primary-hover"
        >
          <Plus size={18} />
          Add Client
        </button>
      </section>

      {successMessage && (
        <div
          role="status"
          className="rounded-lg border border-success/20 bg-success/10 px-4 py-3 text-sm text-success"
        >
          {successMessage}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {error}
          <button
            type="button"
            onClick={loadClients}
            className="ml-2 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      <section className="rounded-card border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
                setSuccessMessage("");
              }}
              placeholder="Search by client name or email"
              className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-3 text-sm text-text-primary outline-none placeholder:text-text-secondary focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <button
            type="button"
            onClick={loadClients}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-muted disabled:opacity-60"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-card border border-border bg-surface shadow-sm">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-muted text-primary">
            <Users size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-text-primary">All Clients</h2>
            <p className="text-xs text-text-secondary">
              Client directory
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-surface-muted text-text-secondary">
              <tr>
                <th className="px-5 py-3 font-semibold">Client</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Phone</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-text-secondary"
                  >
                    Loading clients...
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-text-secondary"
                  >
                    No clients found.
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr
                    key={client._id}
                    className="transition-colors hover:bg-surface-muted/50"
                  >
                    <td className="px-5 py-4 font-medium text-text-primary">
                      {client.clientName}
                    </td>

                    <td className="px-5 py-4 text-text-secondary">
                      {client.email || "—"}
                    </td>

                    <td className="px-5 py-4 text-text-secondary">
                      {client.phone || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          client.isActive
                            ? "rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success"
                            : "rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-text-secondary"
                        }
                      >
                        {client.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          title="Edit client"
                          aria-label={`Edit ${client.clientName}`}
                          onClick={() => {
                            setError("");
                            setSuccessMessage("");
                            setSelectedClient(client);
                            setShowCreateModal(false);
                          }}
                          className="rounded-lg border border-border p-2 text-primary transition-colors hover:bg-surface-muted"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          title="Delete client"
                          aria-label={`Delete ${client.clientName}`}
                          disabled={deletingId === client._id}
                          onClick={() => handleDelete(client)}
                          className="rounded-lg border border-border p-2 text-danger transition-colors hover:bg-danger/10 disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-4">
          <p className="text-xs text-text-secondary">
            Page {page}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 1 || loading}
              onClick={() => setPage((current) => current - 1)}
              className="rounded-lg border border-border px-3 py-2 text-sm text-text-primary hover:bg-surface-muted disabled:opacity-40"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={clients.length < limit || loading}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-lg border border-border px-3 py-2 text-sm text-text-primary hover:bg-surface-muted disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {(showCreateModal || selectedClient) && (
        <ClientFormModal
          key={selectedClient?._id || "new-client"}
          client={selectedClient}
          onClose={closeModal}
          onSuccess={handleSaveSuccess}
        />
      )}
    </div>
  );
}

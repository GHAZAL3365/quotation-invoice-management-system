
import { useEffect, useState } from "react";
import { Plus, Search, Users, X } from "lucide-react";
import api from "../services/api";

const initialForm = {
  clientName: "",
  companyName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  country: "India",
  postalCode: "",
};

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function fetchClients() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/clients");

      setClients(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to fetch clients. Check whether the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClients();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        clientName: form.clientName.trim(),
        companyName: form.companyName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        country: form.country.trim(),
        postalCode: form.postalCode.trim(),
      };

      await api.post("/clients", payload);

      setForm(initialForm);
      setShowForm(false);
      setSuccess("Client created successfully.");

      await fetchClients();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create client."
      );
    } finally {
      setSaving(false);
    }
  }

  const filteredClients = clients.filter((client) =>
    [
      client.clientName,
      client.companyName,
      client.email,
      client.phone,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Clients
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your customer information.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError("");
            setSuccess("");
            setShowForm(true);
          }}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Client
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
        >
          {success}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-800">
              All Clients
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {clients.length} total clients
            </p>
          </div>

          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search clients..."
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 sm:w-72"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50 text-slate-500">
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Location</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center text-slate-500">
                    Loading clients...
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center">
                    <Users className="mx-auto mb-3 text-slate-300" size={32} />
                    <p className="font-medium text-slate-700">
                      No clients found
                    </p>
                    <p className="mt-1 text-slate-500">
                      Add a client or try another search.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr
                    key={client._id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-4 py-4 font-medium text-slate-800">
                      {client.clientName}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {client.companyName || "—"}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {client.email || "—"}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {client.phone || "—"}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {[client.city, client.state]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white p-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Add New Client
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter your client's details.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close form"
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  { name: "clientName", label: "Client Name", required: true },
                  { name: "companyName", label: "Company Name" },
                  { name: "email", label: "Email", type: "email" },
                  { name: "phone", label: "Phone" },
                  { name: "address", label: "Address" },
                  { name: "city", label: "City" },
                  { name: "state", label: "State" },
                  { name: "country", label: "Country" },
                  { name: "postalCode", label: "Postal Code" },
                ].map((field) => (
                  <div key={field.name}>
                    <label
                      htmlFor={field.name}
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      {field.label}
                      {field.required && (
                        <span className="text-red-500"> *</span>
                      )}
                    </label>

                    <input
                      id={field.name}
                      name={field.name}
                      type={field.type || "text"}
                      value={form[field.name]}
                      onChange={handleChange}
                      required={field.required || false}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { authService } from "../services/authService";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState("");

  const loadUsers = () => {
    setLoading(true);
    authService.getAllUsers()
      .then(({ data }) => setUsers(data.data || []))
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await authService.deleteUser(id);
      toast.success(`User "${name}" deleted`);
      setUsers((u) => u.filter((x) => x._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-xl text-sv-fg flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">admin_panel_settings</span>Admin Panel
        </h1>
        <p className="text-sm text-sv-muted-fg mt-1">Manage registered users and system settings.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Users",    value: users.length,                                 icon: "group",         color: "text-sv-green",   border: "border-l-primary" },
          { label: "Verified Users", value: users.filter((u) => u.verified).length,       icon: "verified_user", color: "text-sv-green",  border: "border-l-tertiary" },
          { label: "Admin Users",    value: users.filter((u) => u.role === "admin").length,icon: "shield_person", color: "text-sv-cyan", border: "border-l-secondary" },
        ].map((s) => (
          <div key={s.label} className={`glass-panel p-5 flex items-center gap-4 border-l-4 ${s.border}`}>
            <span className={`material-symbols-outlined text-3xl ${s.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
            <div>
              <p className="font-display font-bold text-2xl text-sv-fg">{loading ? "..." : s.value}</p>
              <p className="text-xs font-bold uppercase text-sv-muted-fg tracking-wider">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* User table */}
      <section className="glass-panel overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-sv-card-highest/30">
          <h2 className="font-display font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">manage_accounts</span>User Management
          </h2>
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="input-sv pl-9 py-2 text-sm w-full"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="border-b border-white/5 bg-sv-card/50 text-xs font-bold uppercase text-sv-muted-fg tracking-wider">
                {["Name","Email","Role","Verified","Joined","Actions"].map((h) => (
                  <th key={h} className={`px-4 py-3 whitespace-nowrap ${h === "Actions" ? "text-right" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {loading && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sv-muted-fg">
                  <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin inline-block mr-2" />
                  Loading users...
                </td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sv-muted-fg">No users found.</td></tr>
              )}
              {filtered.map((u) => (
                <tr key={u._id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-4 py-3 font-semibold text-on-surface">{u.name}</td>
                  <td className="px-4 py-3 text-sv-muted-fg font-mono text-xs">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold uppercase ${u.role === "admin" ? "bg-primary/15 text-primary border border-primary/30" : "bg-sv-card-highest text-sv-muted-fg"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold ${u.verified ? "text-sv-green" : "text-sv-red"}`}>
                      <span className="material-symbols-outlined text-[14px]">{u.verified ? "check_circle" : "cancel"}</span>
                      {u.verified ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-sv-muted-fg whitespace-nowrap">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(u._id, u.name)}
                      disabled={deleting === u._id || u.role === "admin"}
                      className="text-sv-muted-fg hover:text-sv-red disabled:opacity-30 transition-colors flex items-center gap-1 ml-auto text-xs"
                      title={u.role === "admin" ? "Cannot delete admin" : "Delete user"}
                    >
                      {deleting === u._id ? (
                        <span className="w-4 h-4 border-2 border-error/30 border-t-error rounded-full animate-spin" />
                      ) : (
                        <span className="material-symbols-outlined text-xl">delete</span>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}


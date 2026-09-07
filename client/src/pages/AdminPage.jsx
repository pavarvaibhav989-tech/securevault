import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { authService } from "../services/authService";

const BADGE = {
  admin: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
  user:  "bg-slate-700/50 text-slate-400 border border-slate-600/30",
};
const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });

export default function AdminPage() {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [actionId, setActionId]   = useState(null);
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState("all"); // all | admin | banned

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
    setActionId(id + "_del");
    try {
      await authService.deleteUser(id);
      toast.success(`"${name}" deleted`);
      setUsers((u) => u.filter((x) => x._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally { setActionId(null); }
  };

  const handleBan = async (id, name, isBanned) => {
    setActionId(id + "_ban");
    try {
      const { data } = await authService.toggleBan(id);
      toast.success(data.message);
      setUsers((u) => u.map((x) => x._id === id ? { ...x, isBanned: data.isBanned } : x));
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally { setActionId(null); }
  };

  const handleRole = async (id, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (!window.confirm(`Change role to "${newRole}"?`)) return;
    setActionId(id + "_role");
    try {
      const { data } = await authService.changeRole(id, newRole);
      toast.success(data.message);
      setUsers((u) => u.map((x) => x._id === id ? { ...x, role: newRole } : x));
    } catch (err) {
      toast.error(err.response?.data?.message || "Role change failed");
    } finally { setActionId(null); }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    const matchFilter = filter === "all" ? true : filter === "admin" ? u.role === "admin" : u.isBanned;
    return matchSearch && matchFilter;
  });

  const stats = [
    { label: "Total Users",    value: users.length,                                   icon: "group",         color: "text-sv-green",  accent: "#22C55E" },
    { label: "Verified",       value: users.filter((u) => u.verified).length,          icon: "verified_user", color: "text-blue-400",  accent: "#60A5FA" },
    { label: "Admins",         value: users.filter((u) => u.role === "admin").length,  icon: "shield_person", color: "text-yellow-400",accent: "#FACC15" },
    { label: "Banned",         value: users.filter((u) => u.isBanned).length,          icon: "block",         color: "text-sv-red",    accent: "#EF4444" },
  ];

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-xl text-sv-fg flex items-center gap-2">
          <span className="material-symbols-outlined text-yellow-400" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
          Admin Panel
        </h1>
        <p className="text-sm text-sv-muted-fg mt-1">Manage users, roles, and account access.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="glass-panel p-4 flex items-center gap-3"
            style={{ borderLeft: `3px solid ${s.accent}22` }}
          >
            <span
              className={`material-symbols-outlined text-2xl ${s.color}`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >{s.icon}</span>
            <div>
              <p className="font-display font-bold text-xl text-sv-fg">{loading ? "…" : s.value}</p>
              <p className="text-[11px] font-bold uppercase text-sv-muted-fg tracking-wider">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <section className="glass-panel overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 py-3 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="font-display font-semibold text-on-surface flex items-center gap-2 text-sm">
            <span className="material-symbols-outlined text-sv-green text-[18px]">manage_accounts</span>
            User Management
          </h2>
          <div className="flex gap-2 flex-wrap items-center">
            {/* Filter tabs */}
            {["all", "admin", "banned"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-1 rounded-md text-xs font-mono font-semibold capitalize transition-all"
                style={{
                  background: filter === f ? 'rgba(34,197,94,0.15)' : 'transparent',
                  border: `1px solid ${filter === f ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  color: filter === f ? '#22C55E' : '#94A3B8',
                }}
              >{f}</button>
            ))}
            {/* Search */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-[16px]">search</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="input-sv pl-8 py-1.5 text-xs w-48"
              />
            </div>
            <button
              onClick={loadUsers}
              className="p-1.5 rounded-md text-slate-400 hover:text-sv-green transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              title="Refresh"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[720px]">
            <thead>
              <tr className="border-b border-white/5 text-[11px] font-bold uppercase text-sv-muted-fg tracking-wider">
                {["User", "Email", "Role", "Status", "Joined", "Actions"].map((h) => (
                  <th key={h} className={`px-4 py-3 whitespace-nowrap ${h === "Actions" ? "text-right" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {loading && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sv-muted-fg">
                  <span className="w-4 h-4 border-2 border-sv-green/30 border-t-sv-green rounded-full animate-spin inline-block mr-2" />
                  Loading…
                </td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sv-muted-fg">No users match your search.</td></tr>
              )}
              {filtered.map((u) => {
                const isSelf = false; // would need auth context here
                const busy = actionId?.startsWith(u._id);
                return (
                  <tr key={u._id} className={`hover:bg-white/5 transition-colors ${u.isBanned ? 'opacity-60' : ''}`}>
                    {/* Name + avatar */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono flex-shrink-0"
                          style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}
                        >
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-semibold text-on-surface">{u.name}</span>
                      </div>
                    </td>
                    {/* Email */}
                    <td className="px-4 py-3 text-sv-muted-fg font-mono text-xs">{u.email}</td>
                    {/* Role badge */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${BADGE[u.role] || BADGE.user}`}>
                        {u.role}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3">
                      {u.isBanned ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-400">
                          <span className="material-symbols-outlined text-[14px]">block</span>Banned
                        </span>
                      ) : u.verified ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-sv-green">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-yellow-400">
                          <span className="material-symbols-outlined text-[14px]">pending</span>Unverified
                        </span>
                      )}
                    </td>
                    {/* Joined */}
                    <td className="px-4 py-3 text-xs text-sv-muted-fg whitespace-nowrap font-mono">{fmt(u.createdAt)}</td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        {busy ? (
                          <span className="w-4 h-4 border-2 border-sv-green/30 border-t-sv-green rounded-full animate-spin" />
                        ) : (
                          <>
                            {/* Ban/Unban */}
                            <button
                              onClick={() => handleBan(u._id, u.name, u.isBanned)}
                              disabled={u.role === "admin"}
                              title={u.isBanned ? "Unban user" : "Ban user"}
                              className="p-1.5 rounded-md transition-colors disabled:opacity-30"
                              style={{
                                background: u.isBanned ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                color: u.isBanned ? '#22C55E' : '#F87171',
                              }}
                            >
                              <span className="material-symbols-outlined text-[16px]">{u.isBanned ? "lock_open" : "block"}</span>
                            </button>
                            {/* Promote/Demote */}
                            <button
                              onClick={() => handleRole(u._id, u.role)}
                              title={u.role === "admin" ? "Demote to user" : "Promote to admin"}
                              className="p-1.5 rounded-md transition-colors"
                              style={{ background: 'rgba(250,204,21,0.1)', color: '#FACC15' }}
                            >
                              <span className="material-symbols-outlined text-[16px]">{u.role === "admin" ? "person_remove" : "manage_accounts"}</span>
                            </button>
                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(u._id, u.name)}
                              title="Delete user"
                              className="p-1.5 rounded-md transition-colors"
                              style={{ background: 'rgba(239,68,68,0.08)', color: '#F87171' }}
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && (
          <div className="px-5 py-3 border-t border-white/5 text-xs text-sv-muted-fg font-mono">
            Showing {filtered.length} of {users.length} users
          </div>
        )}
      </section>
    </div>
  );
}

import { Link, useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: '#0F172A' }}
    >
      {/* Grid background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='%2322C55E09' stroke-width='1'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 max-w-md w-full">
        {/* Glowing 404 */}
        <div className="mb-6">
          <p
            className="text-[120px] font-black leading-none font-mono"
            style={{
              color: '#22C55E',
              textShadow: '0 0 40px rgba(34,197,94,0.4), 0 0 80px rgba(34,197,94,0.2)',
            }}
          >
            404
          </p>
        </div>

        {/* Terminal card */}
        <div
          className="rounded-xl p-6 mb-8 text-left"
          style={{
            background: 'rgba(27,35,54,0.8)',
            border: '1px solid rgba(34,197,94,0.2)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-2 text-xs font-mono text-slate-500">terminal</span>
          </div>
          <div className="font-mono text-sm space-y-1">
            <p><span className="text-slate-500">$</span> <span className="text-green-400">navigate</span> <span className="text-slate-300">--path /this-route</span></p>
            <p className="text-red-400">Error: Route not found (404)</p>
            <p className="text-slate-500">$ <span className="animate-pulse">█</span></p>
          </div>
        </div>

        <h1 className="text-xl font-bold text-white mb-2">Page Not Found</h1>
        <p className="text-slate-400 text-sm mb-8">
          The route you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-mono font-semibold transition-all"
            style={{
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.3)',
              color: '#22C55E',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
            Go Back
          </button>
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-mono font-semibold transition-all"
            style={{
              background: '#22C55E',
              color: '#0F172A',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>dashboard</span>
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

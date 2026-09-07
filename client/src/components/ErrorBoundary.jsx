import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: '#0F172A' }}
      >
        <div
          className="max-w-lg w-full rounded-xl p-8 text-center"
          style={{
            background: 'rgba(27,35,54,0.9)',
            border: '1px solid rgba(239,68,68,0.3)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <span
            className="material-symbols-outlined text-6xl mb-4 block"
            style={{ color: '#EF4444', fontVariationSettings: "'FILL' 1" }}
          >
            error
          </span>
          <h1 className="text-xl font-bold text-white mb-2">Something went wrong</h1>
          <p className="text-slate-400 text-sm mb-6">
            An unexpected error occurred. Please try refreshing the page.
          </p>

          {/* Error details (collapsible) */}
          {this.state.error && (
            <details className="mb-6 text-left">
              <summary className="text-xs font-mono text-slate-500 cursor-pointer hover:text-slate-300 transition-colors">
                Error details
              </summary>
              <pre
                className="mt-2 p-3 rounded-lg text-xs text-red-400 font-mono overflow-x-auto whitespace-pre-wrap break-all"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}
              >
                {this.state.error.message}
              </pre>
            </details>
          )}

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-5 py-2.5 rounded-lg text-sm font-mono font-semibold transition-all"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#F87171',
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-5 py-2.5 rounded-lg text-sm font-mono font-semibold transition-all"
              style={{ background: '#22C55E', color: '#0F172A' }}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
}

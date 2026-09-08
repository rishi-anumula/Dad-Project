import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
  }

  handleResetStorage = () => {
    localStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 p-6">
          <div className="max-w-md w-full p-8 rounded-3xl bg-slate-800 border border-slate-700 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center font-bold text-2xl">
              ⚠️
            </div>
            <h2 className="text-xl font-bold text-white">Application Error Caught</h2>
            <p className="text-xs text-slate-400">
              An unexpected error occurred while rendering the application. This might be due to corrupted local storage cache.
            </p>
            <div className="p-3 rounded-xl bg-slate-950 text-left font-mono text-[11px] text-rose-300 overflow-x-auto max-h-32">
              {this.state.error?.toString()}
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleResetStorage}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors"
              >
                Clear Local Storage & Reset App Data
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

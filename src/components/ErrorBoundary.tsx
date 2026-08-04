import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error in component boundary:", error, errorInfo);
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="bg-[#120a0a] border border-red-500/40 p-6 rounded-2xl text-left space-y-4 my-4 max-w-2xl mx-auto shadow-xl">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-red-500/20 text-red-400 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-red-300 uppercase font-mono">
                {this.props.fallbackTitle || 'Aviso de Processamento do Módulo'}
              </h3>
              <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                Ocorreu uma inconsistência temporária ao carregar ou processar os dados deste painel. 
              </p>
              {this.state.error?.message && (
                <div className="mt-2 p-2 bg-black/60 border border-red-900/40 rounded text-[11px] font-mono text-red-400 overflow-x-auto">
                  {this.state.error.message}
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer font-mono uppercase tracking-wider"
          >
            <RefreshCw className="w-4 h-4" />
            Recarregar Módulo
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

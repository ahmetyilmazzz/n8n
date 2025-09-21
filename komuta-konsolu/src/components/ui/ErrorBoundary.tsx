// src/components/ui/ErrorBoundary.tsx
'use client';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <h3 className="error-title">Bir Hata Oluştu</h3>
            <p className="error-description">
              Uygulama beklenmeyen bir hatayla karşılaştı.
            </p>
            <button 
              className="error-retry-btn"
              onClick={() => this.setState({ hasError: false, error: undefined })}
            >
              🔄 Yeniden Dene
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
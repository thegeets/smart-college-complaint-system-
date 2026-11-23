import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

/**
 * Robust Error Boundary to catch render crashes and prevent blank or empty pages.
 * Supports custom fallback UI or renders a styled academic fallback card with retry.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log diagnostics safely without breaking execution
    if (typeof console !== 'undefined' && console.error) {
      console.error('[ErrorBoundary caught error]:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function'
          ? this.props.fallback({ error: this.state.error, reset: this.handleReset })
          : this.props.fallback;
      }

      return (
        <div
          role="alert"
          style={{
            maxWidth: '520px',
            margin: '32px auto',
            padding: '24px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '12px',
            color: '#101D35',
            boxShadow: '0 8px 24px -4px rgba(16, 29, 53, 0.08)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#FEE2E2',
              color: '#B91C1C',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <AlertCircle size={24} />
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 8px', color: '#B91C1C' }}>
            {this.props.title || 'Something went wrong'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748B', margin: '0 0 20px', lineHeight: 1.5 }}>
            {this.props.message ||
              'An unexpected error occurred while displaying this section. Please refresh the page or try again.'}
          </p>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={this.handleReset}
              className="btn btn-secondary btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              <RotateCcw size={14} />
              <span>Try Again</span>
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn btn-primary btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              <span>Reload Page</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error);
    console.error('Component stack:', errorInfo.componentStack);
    
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full p-6 bg-card shadow-lg rounded-lg text-center">
            <h2 className="text-2xl font-bold text-destructive mb-4">Something went wrong</h2>
            <div className="text-card-foreground mb-6 overflow-auto max-h-64 text-left p-4 bg-muted rounded-md">
              <p className="font-semibold">Error:</p>
              <p className="text-sm mb-2">{this.state.error?.message || 'An unexpected error occurred'}</p>
              
              {this.state.error?.stack && (
                <>
                  <p className="font-semibold mt-4">Stack trace:</p>
                  <pre className="text-xs whitespace-pre-wrap break-words">
                    {this.state.error.stack}
                  </pre>
                </>
              )}
            </div>
            <div className="flex space-x-4 justify-center">
              <button
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </button>
              <button
                className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90"
                onClick={() => window.history.back()}
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 
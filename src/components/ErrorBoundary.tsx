import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import useThemeStore from '../store/themeStore';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="max-w-md w-full mx-4 p-8 bg-gray-800 rounded-lg shadow-lg">
            <div className="flex items-center justify-center mb-6">
              <AlertTriangle className="w-12 h-12 text-yellow-500" />
            </div>
            <h1 className="text-xl font-bold text-white text-center mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-400 text-center mb-6">
              We're sorry, but there was an error loading this content.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
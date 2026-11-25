import React, { Component } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button.jsx';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback({
            error: this.state.error,
            resetError: this.handleReset,
          });
        }
        return this.props.fallback;
      }

      return (
        <div className="min-h-[360px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-50 text-rose-600 mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Something went wrong
            </h3>

            <p className="text-sm text-gray-500 mb-4">
              An unexpected error occurred while rendering this component.
            </p>

            {this.state.error?.message && (
              <div className="p-3 mb-6 bg-gray-50 rounded-lg text-left overflow-x-auto border border-gray-200">
                <p className="text-xs font-mono text-gray-700">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={this.handleReset}
                leftIcon={RotateCcw}
              >
                Try Again
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

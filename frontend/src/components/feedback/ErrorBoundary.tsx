import React from 'react';
import { ErrorState } from './ErrorState';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  homeHref?: string;
  fallbackTitle?: string;
  fallbackMessage?: string;
}
interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Surface for the developer; the visitor never sees a raw stack.
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  handleRetry = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <ErrorState
          title={this.props.fallbackTitle}
          message={this.props.fallbackMessage}
          detail={import.meta.env.DEV ? this.state.error.message : undefined}
          onRetry={this.handleRetry}
          homeHref={this.props.homeHref}
        />
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

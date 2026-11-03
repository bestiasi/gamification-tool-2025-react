import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

export default class PageErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Page could not be loaded:', error, info.componentStack);
  }

  render() {
    if (this.state.failed) {
      return (
        <main role="alert" style={{ padding: 40, textAlign: 'center' }}>
          <p>Pagina nu a putut fi încărcată. Reîncarcă pentru a încerca din nou.</p>
          <button type="button" onClick={() => window.location.reload()}>Reîncarcă pagina</button>
        </main>
      );
    }
    return this.props.children;
  }
}

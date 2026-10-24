import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('UI crash:', error, info); }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
        <div className="glass" style={{ padding: 32, maxWidth: 460, textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <p style={{ margin: '12px 0 20px', opacity: 0.7 }}>{String(this.state.error.message || this.state.error)}</p>
          <button className="btn" onClick={() => { window.location.href = '/'; }}>Back to start</button>
        </div>
      </div>
    );
  }
}

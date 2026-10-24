import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('UI crash:', error, info); }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
        <div className="card" style={{ padding: 32, maxWidth: 480, textAlign: 'center' }}>
          <h2 className="display">Oops 💥</h2>
          <p style={{ margin: '12px 0 20px' }}>{String(this.state.error.message || this.state.error)}</p>
          <button className="btn" onClick={() => { this.setState({ error: null }); window.location.href = '/'; }}>Back to safety</button>
        </div>
      </div>
    );
  }
}

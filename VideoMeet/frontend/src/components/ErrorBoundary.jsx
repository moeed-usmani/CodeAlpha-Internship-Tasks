import { Component } from 'react';

// Catches render errors so the user sees a recovery screen instead of a blank page.
export default class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('UI crashed:', error, info); }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="center-screen">
        <div className="panel neon-box" style={{ maxWidth: 460, textAlign: 'center' }}>
          <h2 className="glitch" data-text="SYSTEM ERROR">SYSTEM ERROR</h2>
          <p className="muted">Something went wrong while rendering this screen.</p>
          <p className="mono small err">{String(this.state.error.message || this.state.error)}</p>
          <button className="btn" onClick={() => { window.location.href = '/'; }}>Back to lobby</button>
        </div>
      </div>
    );
  }
}

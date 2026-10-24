import { Component } from 'react';

// Agar koi component crash kare to poori screen black hone ki jagah error dikhao.
export default class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('UI crash:', error, info); }
  componentDidUpdate(prev) { if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null }); }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <section className="auth page-top">
        <div className="auth-card center">
          <h2>Something went wrong</h2>
          <p className="muted small">{String(this.state.error.message || this.state.error)}</p>
          <button className="btn-gold" onClick={() => this.setState({ error: null })}>Try again</button>
        </div>
      </section>
    );
  }
}

/**
 * Error Boundary — Modul 11
 * Menangkap error di React component tree dan menampilkan fallback UI
 * yang user-friendly alih-alih blank screen.
 */
import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <h2 style={styles.title}>⚠️ Terjadi Kesalahan</h2>
            <p style={styles.message}>
              Aplikasi mengalami error yang tidak terduga. 
              Silakan coba muat ulang halaman.
            </p>
            {this.props.showDetails && this.state.error && (
              <pre style={styles.details}>
                {this.state.error.message}
              </pre>
            )}
            <div style={styles.actions}>
              <button onClick={this.handleReset} style={styles.btnRetry}>
                🔄 Coba Lagi
              </button>
              <button onClick={() => window.location.reload()} style={styles.btnReload}>
                ↻ Muat Ulang Halaman
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '2rem',
    backgroundColor: 'var(--bg-primary, #f0f2f5)',
  },
  card: {
    backgroundColor: 'var(--bg-card, white)',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    maxWidth: '500px',
    textAlign: 'center',
  },
  title: {
    color: 'var(--text-primary, #333)',
    marginBottom: '0.5rem',
  },
  message: {
    color: 'var(--text-secondary, #666)',
    lineHeight: 1.6,
  },
  details: {
    backgroundColor: 'var(--bg-secondary, #f8f9fa)',
    padding: '1rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
    textAlign: 'left',
    overflow: 'auto',
    maxHeight: '100px',
    color: '#c00',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'center',
    marginTop: '1.5rem',
  },
  btnRetry: {
    padding: '0.6rem 1.2rem',
    backgroundColor: '#2E75B6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  btnReload: {
    padding: '0.6rem 1.2rem',
    backgroundColor: '#e0e0e0',
    color: '#333',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
}

export default ErrorBoundary

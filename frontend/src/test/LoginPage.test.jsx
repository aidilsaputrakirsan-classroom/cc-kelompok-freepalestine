/**
 * LoginPage Component Tests — Modul 10
 * Test rendering dan interaksi form login
 */
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import LoginPage from '../pages/Auth/LoginPage'

// Mock api
vi.mock('../services/api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
  },
}))

// Wrapper with Router
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('LoginPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders login form with email and password fields', () => {
    renderWithRouter(<LoginPage />)
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders login button', () => {
    renderWithRouter(<LoginPage />)
    
    const loginButton = screen.getByRole('button', { name: /login/i })
    expect(loginButton).toBeInTheDocument()
  })

  it('renders captcha verification section', () => {
    renderWithRouter(<LoginPage />)
    
    expect(screen.getByText(/verifikasi keamanan/i)).toBeInTheDocument()
  })

  it('shows error when submitting empty form', async () => {
    renderWithRouter(<LoginPage />)
    
    const loginButton = screen.getByRole('button', { name: /login/i })
    fireEvent.click(loginButton)
    
    expect(screen.getByText(/email dan password harus diisi/i)).toBeInTheDocument()
  })

  it('renders Telkom branding', () => {
    renderWithRouter(<LoginPage />)
    
    expect(screen.getByText(/dashboard telkom/i)).toBeInTheDocument()
    expect(screen.getAllByText(/regional 4 kalimantan/i).length).toBeGreaterThan(0)
  })

  it('has captcha refresh button', () => {
    renderWithRouter(<LoginPage />)
    
    const refreshBtn = screen.getByText('↻')
    expect(refreshBtn).toBeInTheDocument()
  })
})

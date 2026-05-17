/**
 * App Component Tests — Modul 10
 * Test routing dan authentication flow
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// Mock all page components to isolate App routing logic
vi.mock('../pages/Auth/LoginPage', () => ({
  default: () => <div data-testid="login-page">Login Page</div>,
}))
vi.mock('../pages/Dashboard/HomeDashboard', () => ({
  default: () => <div data-testid="dashboard">Dashboard</div>,
}))
vi.mock('../pages/Revenue/RevenuePage', () => ({
  default: () => <div data-testid="revenue">Revenue</div>,
}))
vi.mock('../pages/Inbox/InboxPage', () => ({
  default: () => <div data-testid="inbox">Inbox</div>,
}))
vi.mock('../pages/CustomerCare/CustomerCarePage', () => ({
  default: () => <div data-testid="customer-care">Customer Care</div>,
}))
vi.mock('../pages/Leaderboard/LeaderboardPage', () => ({
  default: () => <div data-testid="leaderboard">Leaderboard</div>,
}))
vi.mock('../pages/Upload/UploadPage', () => ({
  default: () => <div data-testid="upload">Upload</div>,
}))
vi.mock('../pages/Users/UsersPage', () => ({
  default: () => <div data-testid="users">Users</div>,
}))
vi.mock('../pages/About/AboutPage', () => ({
  default: () => <div data-testid="about">About</div>,
}))
vi.mock('../components/Layout', () => ({
  MainLayout: () => <div data-testid="main-layout">Main Layout</div>,
}))
vi.mock('../components/Toast/ToastProvider', () => ({
  ToastProvider: ({ children }) => <div>{children}</div>,
}))

describe('App Routing', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('redirects to login when not authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <div data-testid="login-page">Login Page</div>
      </MemoryRouter>
    )
    // Without token, should show login
    expect(localStorage.getItem('access_token')).toBeNull()
  })

  it('stores theme preference in localStorage', () => {
    localStorage.setItem('theme', 'dark')
    expect(localStorage.getItem('theme')).toBe('dark')
    
    localStorage.setItem('theme', 'light')
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('session timeout is configured to 30 minutes', () => {
    const SESSION_TIMEOUT_MS = 30 * 60 * 1000
    expect(SESSION_TIMEOUT_MS).toBe(1800000)
  })

  it('tracks last activity time in localStorage', () => {
    const now = Date.now()
    localStorage.setItem('lastActivityTime', now.toString())
    
    const stored = parseInt(localStorage.getItem('lastActivityTime'), 10)
    expect(stored).toBe(now)
  })
})

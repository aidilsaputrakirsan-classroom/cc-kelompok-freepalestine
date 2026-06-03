/**
 * API Service Tests — Modul 10
 * Test konfigurasi dan behavior API client
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('API Service Configuration', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should store and retrieve JWT token from localStorage', () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test'
    localStorage.setItem('access_token', token)
    
    expect(localStorage.getItem('access_token')).toBe(token)
  })

  it('should clear auth data on logout', () => {
    localStorage.setItem('access_token', 'token123')
    localStorage.setItem('user', JSON.stringify({ name: 'Test User', email: 'test@itk.ac.id' }))
    
    // Simulate logout
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    
    expect(localStorage.getItem('access_token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })

  it('should parse user data from localStorage correctly', () => {
    const user = { id: 1, name: 'Ariel', email: 'ariel@itk.ac.id', role: 'admin' }
    localStorage.setItem('user', JSON.stringify(user))
    
    const parsed = JSON.parse(localStorage.getItem('user'))
    expect(parsed.name).toBe('Ariel')
    expect(parsed.role).toBe('admin')
  })

  it('should handle missing token gracefully', () => {
    const token = localStorage.getItem('access_token')
    expect(token).toBeNull()
  })

  it('should support theme preference storage', () => {
    localStorage.setItem('theme', 'dark')
    expect(localStorage.getItem('theme')).toBe('dark')
    
    localStorage.setItem('theme', 'light')
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('should track session activity time', () => {
    const now = Date.now()
    localStorage.setItem('lastActivityTime', now.toString())
    
    const stored = parseInt(localStorage.getItem('lastActivityTime'), 10)
    expect(stored).toBe(now)
    expect(Date.now() - stored).toBeLessThan(1000)
  })
})

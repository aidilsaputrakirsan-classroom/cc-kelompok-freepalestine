import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Header from '../Header'

describe('Header', () => {
  it('menampilkan judul aplikasi', () => {
    render(<Header totalItems={0} isConnected={true} />)
    expect(screen.getByText(/Cloud App/i)).toBeInTheDocument()
  })

  it('menampilkan jumlah total items', () => {
    render(<Header totalItems={5} isConnected={true} />)
    expect(screen.getByText(/5 items/i)).toBeInTheDocument()
  })
})

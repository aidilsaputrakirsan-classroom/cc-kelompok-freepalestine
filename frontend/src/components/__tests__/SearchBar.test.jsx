import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import SearchBar from '../SearchBar'

describe('SearchBar', () => {
  it('memanggil onSearch saat form disubmit', () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} />)

    fireEvent.change(screen.getByPlaceholderText(/Cari item/i), {
      target: { value: 'laptop' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Cari/i }))

    expect(onSearch).toHaveBeenCalledWith('laptop')
  })

  it('memanggil onSearch dengan string kosong saat clear', () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} />)

    fireEvent.change(screen.getByPlaceholderText(/Cari item/i), {
      target: { value: 'test' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Clear/i }))

    expect(onSearch).toHaveBeenCalledWith('')
  })
})

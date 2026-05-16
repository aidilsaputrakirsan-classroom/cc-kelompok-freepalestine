import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('API fetch mock', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('fetchItems memanggil endpoint yang benar', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ total: 0, items: [] }),
    })

    const response = await fetch('http://localhost:8000/sales')
    const data = await response.json()

    expect(fetch).toHaveBeenCalledWith('http://localhost:8000/sales')
    expect(data.items).toEqual([])
  })

  it('handle error saat API gagal', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'))

    await expect(fetch('http://localhost:8000/sales')).rejects.toThrow('Network error')
  })
})

import { login } from './firebase'

describe('login', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('should resolve when the session cookie is minted', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    global.fetch = mockFetch as unknown as typeof fetch

    await expect(login('id-token')).resolves.toBeUndefined()
    expect(mockFetch).toHaveBeenCalledWith('/api/login', {
      method: 'GET',
      headers: { Authorization: 'Bearer id-token' },
      cache: 'no-store'
    })
  })

  it('should throw when /api/login fails so the caller does not reload signed out', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue({ ok: false, status: 503 }) as unknown as typeof fetch

    await expect(login('id-token')).rejects.toThrow(
      '/api/login responded with status 503'
    )
  })
})

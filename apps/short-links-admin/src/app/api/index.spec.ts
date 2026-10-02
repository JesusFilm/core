import { checkEmailVerification, login, logout, refreshToken } from '.'

vi.mock('../../libs/auth/firebase', () => ({
  getFirebaseAuth: () => ({ currentUser: null })
}))

describe('api helpers', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ idToken: 'refreshed' })
    })
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('logs in against the api route', async () => {
    await login('token')

    expect(fetchMock).toHaveBeenCalledWith('/api/login', {
      method: 'GET',
      headers: { Authorization: 'Bearer token' }
    })
  })

  it('logs out against the api route', async () => {
    await logout()

    expect(fetchMock.mock.calls[0][0]).toBe('/api/logout')
  })

  it('checks email verification against the api route', async () => {
    await checkEmailVerification()

    expect(fetchMock.mock.calls[0][0]).toBe('/api/check-email-verification')
  })

  it('refreshes the token against the api route', async () => {
    await expect(refreshToken()).resolves.toBe('refreshed')

    expect(fetchMock.mock.calls[0][0]).toBe('/api/refresh-token')
  })
})

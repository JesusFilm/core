import { getFirebaseAuth } from '../../libs/auth/firebase'

import { login, refreshToken } from '.'

vi.mock('../../libs/auth/firebase', () => ({
  getFirebaseAuth: vi.fn()
}))

describe('login', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    fetchMock.mockReset()
  })

  it('sends the ID token to /api/login', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }))

    await login('id-token')

    expect(fetchMock).toHaveBeenCalledWith('/api/login', {
      method: 'GET',
      headers: { Authorization: 'Bearer id-token' }
    })
  })

  it('rejects with Login Failed when /api/login does not set the session', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 500 }))

    await expect(login('id-token')).rejects.toThrow('Login Failed')
  })
})

describe('refreshToken', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    fetchMock.mockReset()
    vi.mocked(console.warn).mockRestore()
  })

  it('still returns the fresh ID token when the session cookie sync fails', async () => {
    vi.mocked(getFirebaseAuth).mockReturnValue({
      currentUser: { getIdToken: vi.fn().mockResolvedValue('fresh-token') }
    } as unknown as ReturnType<typeof getFirebaseAuth>)
    fetchMock.mockResolvedValue(new Response(null, { status: 500 }))

    await expect(refreshToken()).resolves.toBe('fresh-token')
    expect(console.warn).toHaveBeenCalledWith(
      'Failed to refresh session cookie',
      { error: expect.any(Error) }
    )
  })
})

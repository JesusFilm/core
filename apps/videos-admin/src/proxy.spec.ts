import { NextRequest } from 'next/server'
import { authMiddleware } from 'next-firebase-auth-edge'

import { makeClient } from './libs/apollo/makeClient'
import proxy, { getAuthorizedRedirectPath, getPublisherAccess } from './proxy'

vi.mock('./libs/apollo/makeClient', () => ({
  makeClient: vi.fn()
}))

// Mirrors next-firebase-auth-edge 1.9: a valid cookie runs handleValidToken,
// and anything it throws is handed to handleError.
vi.mock('next-firebase-auth-edge', () => ({
  authMiddleware: vi.fn(
    async (
      _req: unknown,
      options: {
        handleValidToken: (
          tokens: { token: string },
          headers: Headers
        ) => Promise<Response>
        handleError: (error: unknown) => Promise<Response>
      }
    ) => {
      try {
        return await options.handleValidToken(
          { token: 'id-token' },
          new Headers()
        )
      } catch (error) {
        return await options.handleError(error)
      }
    }
  )
}))

describe('proxy route access helpers', () => {
  it('redirects root to videos for media publishers', () => {
    expect(
      getAuthorizedRedirectPath('/', getPublisherAccess(['publisher'], []))
    ).toBe('/videos')
  })

  it('redirects root to languages for language-only publishers', () => {
    expect(
      getAuthorizedRedirectPath('/', getPublisherAccess([], ['publisher']))
    ).toBe('/languages')
  })

  it('redirects users without publisher access to unauthorized', () => {
    expect(getAuthorizedRedirectPath('/', getPublisherAccess([], []))).toBe(
      '/users/unauthorized'
    )
  })

  it('redirects language-only publishers away from media sections', () => {
    const access = getPublisherAccess([], ['publisher'])

    expect(getAuthorizedRedirectPath('/videos', access)).toBe('/languages')
    expect(getAuthorizedRedirectPath('/videos/video-id', access)).toBe(
      '/languages'
    )
    expect(getAuthorizedRedirectPath('/settings', access)).toBe('/languages')
  })

  it('redirects media-only publishers away from language sections', () => {
    expect(
      getAuthorizedRedirectPath(
        '/languages',
        getPublisherAccess(['publisher'], [])
      )
    ).toBe('/videos')
  })

  it('allows users with both publisher roles into media and language sections', () => {
    const access = getPublisherAccess(['publisher'], ['publisher'])

    expect(getAuthorizedRedirectPath('/videos', access)).toBeUndefined()
    expect(getAuthorizedRedirectPath('/settings', access)).toBeUndefined()
    expect(getAuthorizedRedirectPath('/languages', access)).toBeUndefined()
  })

  it('does not treat non-publisher roles as access', () => {
    expect(getPublisherAccess(['viewer'], ['editor'])).toEqual({
      hasMediaPublisher: false,
      hasLanguagePublisher: false
    })
  })
})

describe('proxy', () => {
  function mockMeQuery(query: () => Promise<unknown>): void {
    vi.mocked(makeClient).mockReturnValue({
      query
    } as unknown as ReturnType<typeof makeClient>)
  }

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.mocked(makeClient).mockReset()
    vi.mocked(console.error).mockRestore()
  })

  it('sends a signed-in publisher from / to their default section', async () => {
    mockMeQuery(async () => ({
      data: {
        me: {
          id: 'user-id',
          __typename: 'AuthenticatedUser',
          mediaUserRoles: ['publisher'],
          languageUserRoles: []
        }
      }
    }))

    const response = await proxy(new NextRequest('http://localhost/'))

    expect(response.headers.get('location')).toBe('http://localhost/videos')
  })

  it('routes to the sign-in page with an explicit error when the me query fails', async () => {
    mockMeQuery(async () => {
      throw new Error('gateway unavailable')
    })

    const response = await proxy(new NextRequest('http://localhost/'))

    expect(response.headers.get('location')).toBe(
      'http://localhost/users/sign-in?error=account-check-failed'
    )
    expect(console.error).toHaveBeenCalledWith(
      'proxy: me query failed for a signed-in user',
      expect.any(Error)
    )
  })

  it('renders the sign-in page instead of redirecting to itself when the me query fails there', async () => {
    mockMeQuery(async () => {
      throw new Error('gateway unavailable')
    })

    const response = await proxy(
      new NextRequest(
        'http://localhost/users/sign-in?error=account-check-failed'
      )
    )

    expect(response.headers.get('location')).toBeNull()
    expect(response.headers.get('x-middleware-next')).toBe('1')
  })

  it('adds an explicit error when visiting sign-in directly with a failed me query', async () => {
    mockMeQuery(async () => {
      throw new Error('gateway unavailable')
    })

    const response = await proxy(
      new NextRequest('http://localhost/users/sign-in')
    )

    expect(response.headers.get('location')).toBe(
      'http://localhost/users/sign-in?error=account-check-failed'
    )
  })

  it('preserves the query string when redirecting to sign-in after a failed me query', async () => {
    mockMeQuery(async () => {
      throw new Error('gateway unavailable')
    })

    const response = await proxy(
      new NextRequest('http://localhost/languages?redirect=%2Flanguages')
    )

    expect(response.headers.get('location')).toBe(
      'http://localhost/users/sign-in?redirect=%2Flanguages&error=account-check-failed'
    )
  })

  it('keeps using the library error handler for non-me failures', async () => {
    vi.mocked(authMiddleware).mockImplementationOnce(
      async (_req, options) =>
        await options.handleError!(new Error('cookie signature invalid'))
    )

    const response = await proxy(new NextRequest('http://localhost/videos'))

    expect(response.headers.get('location')).toBe(
      'http://localhost/users/sign-in'
    )
  })
})

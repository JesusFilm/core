import { getAuthorizedRedirectPath, getPublisherAccess } from './proxy'

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

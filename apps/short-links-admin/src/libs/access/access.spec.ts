import {
  DEFAULT_PAGE,
  UNAUTHORIZED_PAGE,
  getAuthorizedRedirectPath,
  getShortLinkAccess
} from './access'

describe('getShortLinkAccess', () => {
  it('grants nothing without roles', () => {
    expect(getShortLinkAccess()).toEqual({ isEditor: false, isAdmin: false })
    expect(getShortLinkAccess(['youtubeAdmin'])).toEqual({
      isEditor: false,
      isAdmin: false
    })
  })

  it('treats shortLinkEditor as editor only', () => {
    expect(getShortLinkAccess(['shortLinkEditor'])).toEqual({
      isEditor: true,
      isAdmin: false
    })
  })

  it('treats shortLinkAdmin and publisher as admin and editor', () => {
    expect(getShortLinkAccess(['shortLinkAdmin'])).toEqual({
      isEditor: true,
      isAdmin: true
    })
    expect(getShortLinkAccess(['publisher'])).toEqual({
      isEditor: true,
      isAdmin: true
    })
  })
})

describe('getAuthorizedRedirectPath', () => {
  const editor = getShortLinkAccess(['shortLinkEditor'])
  const admin = getShortLinkAccess(['shortLinkAdmin'])
  const none = getShortLinkAccess([])

  it('sends users without a role to the unauthorized page', () => {
    expect(getAuthorizedRedirectPath('/links', none)).toBe(UNAUTHORIZED_PAGE)
    expect(getAuthorizedRedirectPath('/', none)).toBe(UNAUTHORIZED_PAGE)
  })

  it('sends the root to the links list', () => {
    expect(getAuthorizedRedirectPath('/', editor)).toBe(DEFAULT_PAGE)
  })

  it('keeps editors out of the domains section', () => {
    expect(getAuthorizedRedirectPath('/domains', editor)).toBe(DEFAULT_PAGE)
    expect(getAuthorizedRedirectPath('/domains/abc', editor)).toBe(DEFAULT_PAGE)
    expect(getAuthorizedRedirectPath('/domains', admin)).toBeUndefined()
  })

  it('lets editors through everywhere else', () => {
    expect(getAuthorizedRedirectPath('/links/new', editor)).toBeUndefined()
    expect(getAuthorizedRedirectPath('/campaigns', editor)).toBeUndefined()
    expect(getAuthorizedRedirectPath('/test', editor)).toBeUndefined()
  })
})

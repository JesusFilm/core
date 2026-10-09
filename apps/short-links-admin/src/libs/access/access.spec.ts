import {
  DEFAULT_PAGE,
  DOMAINS_PAGE,
  UNAUTHORIZED_PAGE,
  getAuthorizedRedirectPath,
  getShortLinkAccess
} from './access'

describe('getShortLinkAccess', () => {
  it('grants nothing without roles', () => {
    expect(getShortLinkAccess()).toEqual({
      isEditor: false,
      isAdmin: false,
      isSuperAdmin: false
    })
    expect(getShortLinkAccess(['youtubeAdmin'])).toEqual({
      isEditor: false,
      isAdmin: false,
      isSuperAdmin: false
    })
  })

  it('treats shortLinkEditor as editor only', () => {
    expect(getShortLinkAccess(['shortLinkEditor'])).toEqual({
      isEditor: true,
      isAdmin: false,
      isSuperAdmin: false
    })
  })

  it('treats shortLinkAdmin and publisher as admin and editor', () => {
    expect(getShortLinkAccess(['shortLinkAdmin'])).toEqual({
      isEditor: true,
      isAdmin: true,
      isSuperAdmin: false
    })
    expect(getShortLinkAccess(['publisher'])).toEqual({
      isEditor: true,
      isAdmin: true,
      isSuperAdmin: false
    })
  })

  it('keeps superAdmin separate from the media roles', () => {
    expect(getShortLinkAccess([], true)).toEqual({
      isEditor: false,
      isAdmin: false,
      isSuperAdmin: true
    })
    expect(getShortLinkAccess(['shortLinkEditor'], true)).toEqual({
      isEditor: true,
      isAdmin: false,
      isSuperAdmin: true
    })
    expect(getShortLinkAccess(['publisher'], null).isSuperAdmin).toBe(false)
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

  it('gives a superAdmin without a media role the domains section only', () => {
    const superAdmin = getShortLinkAccess([], true)

    expect(getAuthorizedRedirectPath('/domains', superAdmin)).toBeUndefined()
    expect(
      getAuthorizedRedirectPath('/domains/abc', superAdmin)
    ).toBeUndefined()
    expect(getAuthorizedRedirectPath('/', superAdmin)).toBe(DOMAINS_PAGE)
    expect(getAuthorizedRedirectPath('/links', superAdmin)).toBe(DOMAINS_PAGE)
    expect(getAuthorizedRedirectPath('/test', superAdmin)).toBe(DOMAINS_PAGE)
  })

  it('lets a superAdmin who is only an editor into the domains section', () => {
    const superAdminEditor = getShortLinkAccess(['shortLinkEditor'], true)

    expect(
      getAuthorizedRedirectPath('/domains', superAdminEditor)
    ).toBeUndefined()
    expect(getAuthorizedRedirectPath('/', superAdminEditor)).toBe(DEFAULT_PAGE)
  })
})

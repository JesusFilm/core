import {
  attachmentTarget,
  isOwnedBindingName,
  kvBindingName,
  namespaceTitle
} from './names'

describe('infrastructure names', () => {
  it('derives the Worker binding from the hostname', () => {
    expect(kvBindingName('jesus.film')).toBe('KV_JESUS_FILM')
    expect(kvBindingName('stage.jesus.movie')).toBe('KV_STAGE_JESUS_MOVIE')
    expect(kvBindingName('Go-To.Example.com')).toBe('KV_GO_TO_EXAMPLE_COM')
  })

  it('owns only KV_ bindings', () => {
    expect(isOwnedBindingName('KV_JESUS_FILM')).toBe(true)
    expect(isOwnedBindingName('SHORT_LINKS_KV')).toBe(false)
    expect(isOwnedBindingName('SHORT_LINKS_DB')).toBe(false)
    expect(isOwnedBindingName('kv_lower')).toBe(false)
  })

  it('titles a namespace with the Worker and the hostname verbatim', () => {
    expect(
      namespaceTitle('short-links-redirect-stage', 'Stage.Jesus.Film')
    ).toBe('short-links-redirect-stage:stage.jesus.film')
  })

  it('attaches a prefixed domain as a zone route', () => {
    expect(
      attachmentTarget({ hostname: 'jesus.film', pathPrefix: 's' })
    ).toEqual({
      kind: 'route',
      hostname: 'jesus.film',
      pattern: 'jesus.film/s/*'
    })
    expect(
      attachmentTarget({ hostname: 'Stage.Jesus.Movie', pathPrefix: '/s/' })
    ).toEqual({
      kind: 'route',
      hostname: 'stage.jesus.movie',
      pattern: 'stage.jesus.movie/s/*'
    })
  })

  it('attaches a root domain as a custom domain', () => {
    expect(attachmentTarget({ hostname: 'nxstp.is', pathPrefix: '' })).toEqual({
      kind: 'customDomain',
      hostname: 'nxstp.is',
      pattern: 'nxstp.is'
    })
  })
})

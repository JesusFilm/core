import { parseAcceptLanguage, resolvePageLanguage } from './resolvePageLanguage'

const languages = [
  { languageId: '529', bcp47: 'en' },
  { languageId: '496', bcp47: 'fr' },
  { languageId: '22658', bcp47: 'ar' }
]

function resolve(
  overrides: Partial<Parameters<typeof resolvePageLanguage>[0]> = {}
) {
  return resolvePageLanguage({
    languages,
    defaultLanguageId: '529',
    ...overrides
  })
}

describe('resolvePageLanguage', () => {
  it('takes ?lang naming a campaign language first, case-insensitively, over cookie and header', () => {
    expect(
      resolve({ param: 'FR', cookie: 'ar', acceptLanguage: 'ar,en;q=0.8' })
    ).toEqual({ languageId: '496', bcp47: 'fr', source: 'param' })
    expect(resolve({ param: ['fr', 'ar'] }).languageId).toBe('496')
  })

  it('falls through a ?lang the campaign does not have to the saved cookie', () => {
    expect(resolve({ param: 'de', cookie: 'ar' })).toEqual({
      languageId: '22658',
      bcp47: 'ar',
      source: 'cookie'
    })
  })

  it('falls through a stale cookie to an Accept-Language prefix match against the campaign languages', () => {
    expect(
      resolve({ cookie: 'de', acceptLanguage: 'de-DE,de;q=0.9,fr-CA;q=0.8' })
    ).toEqual({ languageId: '496', bcp47: 'fr', source: 'acceptLanguage' })
  })

  it('matches Accept-Language by descending quality, exact before prefix', () => {
    expect(resolve({ acceptLanguage: 'fr;q=0.5, ar;q=0.9' }).languageId).toBe(
      '22658'
    )
    expect(
      resolvePageLanguage({
        languages: [
          { languageId: '1', bcp47: 'pt-BR' },
          { languageId: '2', bcp47: 'pt' }
        ],
        defaultLanguageId: '1',
        acceptLanguage: 'pt'
      }).languageId
    ).toBe('2')
    expect(
      resolvePageLanguage({
        languages: [{ languageId: '1', bcp47: 'pt-BR' }],
        defaultLanguageId: '1',
        acceptLanguage: 'pt-PT'
      }).languageId
    ).toBe('1')
  })

  it('ignores wildcards, zero-quality tags and malformed entries', () => {
    expect(parseAcceptLanguage('*, de;q=0, ;q=1, fr;q=abc, ar')).toEqual(['ar'])
    expect(parseAcceptLanguage(null)).toEqual([])
    expect(resolve({ acceptLanguage: '*' }).source).toBe('default')
  })

  it('ends on the campaign default with its bcp47 when nothing matches', () => {
    expect(
      resolve({ param: 'de', cookie: 'es', acceptLanguage: 'de' })
    ).toEqual({ languageId: '529', bcp47: 'en', source: 'default' })
    expect(resolve()).toEqual({
      languageId: '529',
      bcp47: 'en',
      source: 'default'
    })
  })

  it('never matches a language without a bcp47 tag and still falls back to the default', () => {
    expect(
      resolvePageLanguage({
        languages: [{ languageId: '529', bcp47: null }],
        defaultLanguageId: '529',
        param: 'null',
        cookie: '',
        acceptLanguage: 'en'
      })
    ).toEqual({ languageId: '529', bcp47: null, source: 'default' })
  })
})

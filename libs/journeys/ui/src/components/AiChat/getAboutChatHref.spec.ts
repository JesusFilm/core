import { getAboutChatHref } from './getAboutChatHref'

describe('getAboutChatHref', () => {
  it('carries a non-English journey language as ?lang', () => {
    expect(getAboutChatHref('es')).toBe('/legal/about-chat?lang=es')
    expect(getAboutChatHref('zh-Hans-CN')).toBe(
      '/legal/about-chat?lang=zh-Hans-CN'
    )
  })

  it('returns the bare href for English', () => {
    expect(getAboutChatHref('en')).toBe('/legal/about-chat')
  })

  it('returns the bare href when the journey has no bcp47 language', () => {
    expect(getAboutChatHref(undefined)).toBe('/legal/about-chat')
    expect(getAboutChatHref(null)).toBe('/legal/about-chat')
    expect(getAboutChatHref('')).toBe('/legal/about-chat')
  })

  it('URL-encodes the language so the href stays well-formed', () => {
    expect(getAboutChatHref('a&b=c')).toBe('/legal/about-chat?lang=a%26b%3Dc')
  })
})

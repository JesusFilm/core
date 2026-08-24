import { normalizeChatButtonLink } from './normalizeChatButtonLink'

describe('normalizeChatButtonLink', () => {
  it('should return an empty string for empty or missing input', () => {
    expect(normalizeChatButtonLink('')).toBe('')
    expect(normalizeChatButtonLink('   ')).toBe('')
    expect(normalizeChatButtonLink(undefined)).toBe('')
  })

  it('should preserve a link that already has a scheme and authority', () => {
    expect(normalizeChatButtonLink('https://church.org/chat')).toBe(
      'https://church.org/chat'
    )
    expect(normalizeChatButtonLink('http://church.org')).toBe(
      'http://church.org'
    )
  })

  it('should preserve authority-less schemes rather than prefixing them', () => {
    expect(normalizeChatButtonLink('mailto:eli.perez@jesusfilm.org')).toBe(
      'mailto:eli.perez@jesusfilm.org'
    )
    expect(normalizeChatButtonLink('MAILTO:eli.perez@jesusfilm.org')).toBe(
      'MAILTO:eli.perez@jesusfilm.org'
    )
    expect(normalizeChatButtonLink('tel:+1234567890')).toBe('tel:+1234567890')
    expect(normalizeChatButtonLink('sms:+1234567890')).toBe('sms:+1234567890')
  })

  it('should turn a bare email address into a mailto link', () => {
    expect(normalizeChatButtonLink('eli.perez@jesusfilm.org')).toBe(
      'mailto:eli.perez@jesusfilm.org'
    )
  })

  it('should prefix a bare host with https', () => {
    expect(normalizeChatButtonLink('church.org')).toBe('https://church.org')
    expect(normalizeChatButtonLink('church.org/chat')).toBe(
      'https://church.org/chat'
    )
  })

  it('should not mistake a url containing an @ for an email address', () => {
    expect(normalizeChatButtonLink('church.org/@pastor')).toBe(
      'https://church.org/@pastor'
    )
  })

  it('should trim surrounding whitespace', () => {
    expect(normalizeChatButtonLink('  eli.perez@jesusfilm.org  ')).toBe(
      'mailto:eli.perez@jesusfilm.org'
    )
  })
})

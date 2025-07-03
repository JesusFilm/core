import { hardenPrompt } from './hardenPrompt'

describe('hardenPrompt', () => {
  it('should return empty string for null or undefined', () => {
    // @ts-expect-error Testing null input
    expect(hardenPrompt(null)).toBe('')
    // @ts-expect-error Testing undefined input
    expect(hardenPrompt(undefined)).toBe('')
  })

  it('should wrap text with guillemets', () => {
    expect(hardenPrompt('test')).toBe('«test»')
    expect(hardenPrompt('hello world')).toBe('«hello world»')
  })

  it('should escape backslashes', () => {
    expect(hardenPrompt('test\\example')).toBe('«test\\\\example»')
    expect(hardenPrompt('\\')).toBe('«\\\\»')
    expect(hardenPrompt('\\n')).toBe('«\\\\n»')
  })

  it('should escape backticks', () => {
    expect(hardenPrompt('`code`')).toBe('«\\`code\\`»')
    expect(hardenPrompt('function() { return `template`; }')).toBe(
      '«function() { return \\`template\\`; }»'
    )
  })

  it('should escape guillemets', () => {
    expect(hardenPrompt('«text»')).toBe('«\\u00ABtext\\u00BB»')
    expect(hardenPrompt('before «middle» after')).toBe(
      '«before \\u00ABmiddle\\u00BB after»'
    )
  })

  it('should handle multiple escapes correctly', () => {
    const complexInput =
      'Function `example()` with «special» chars and \\backslash'
    const expected =
      '«Function \\`example()\\` with \\u00ABspecial\\u00BB chars and \\\\backslash»'
    expect(hardenPrompt(complexInput)).toBe(expected)
  })

  it('should handle empty string', () => {
    expect(hardenPrompt('')).toBe('«»')
  })

  it('should maintain the correct escape sequence even with nested escapes', () => {
    // This tests the order of escape operations
    const complexNested = '\\`«text»\\`'
    const expected = '«\\\\\\`\\u00ABtext\\u00BB\\\\\\`»'
    expect(hardenPrompt(complexNested)).toBe(expected)
  })

  it('should not double-escape already escaped characters', () => {
    // The hardenPrompt function only escapes actual characters, not already escaped sequences
    const alreadyEscaped = '\\\\`'
    const expected = '«\\\\\\\\\\`»' // Each backslash gets escaped, then the backtick
    expect(hardenPrompt(alreadyEscaped)).toBe(expected)
  })

  it('should be reversible with a proper unescape function', () => {
    // This test verifies that the escaping mechanism can theoretically be reversed
    // Not testing actual implementation of an unescape function
    const original = 'Test with `backticks`, \\backslashes\\ and «guillemets»'
    const hardened = hardenPrompt(original)

    // Manually reverse the escaping for this test
    const unescaped = hardened
      .slice(1, -1) // Remove the outer guillemets
      .replace(/\\u00AB/g, '«')
      .replace(/\\u00BB/g, '»')
      .replace(/\\`/g, '`')
      .replace(/\\\\/g, '\\')

    expect(unescaped).toBe(original)
  })
})

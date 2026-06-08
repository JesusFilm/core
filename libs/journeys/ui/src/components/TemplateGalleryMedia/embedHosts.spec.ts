import { KNOWN_EMBED_HOSTS } from './embedAttrs'
import {
  isEmbedUrlAllowed,
  parseEmbedHostsEnv,
  resolveEmbedHosts
} from './embedHosts'

describe('parseEmbedHostsEnv', () => {
  it('parses the JSON label→hostname object into a host set', () => {
    const hosts = parseEmbedHostsEnv(
      '{"canva":"canva.com","youtube":"youtube-nocookie.com"}'
    )
    expect(hosts?.has('canva.com')).toBe(true)
    expect(hosts?.has('youtube-nocookie.com')).toBe(true)
    expect(hosts?.size).toBe(2)
  })

  it('lowercases and trims hostnames', () => {
    const hosts = parseEmbedHostsEnv('{"a":"  CANVA.com  "}')
    expect(hosts?.has('canva.com')).toBe(true)
  })

  it('returns null (fail-closed) for missing, empty, or malformed values', () => {
    expect(parseEmbedHostsEnv(undefined)).toBeNull()
    expect(parseEmbedHostsEnv('')).toBeNull()
    expect(parseEmbedHostsEnv('   ')).toBeNull()
    expect(parseEmbedHostsEnv('not json')).toBeNull()
    expect(parseEmbedHostsEnv('["canva.com"]')).toBeNull() // array, not object
    expect(parseEmbedHostsEnv('"canva.com"')).toBeNull() // scalar
    expect(parseEmbedHostsEnv('{"a":123}')).toBeNull() // non-string value
  })

  it('returns null when a value carries a scheme, path, port, or query', () => {
    expect(parseEmbedHostsEnv('{"a":"https://canva.com"}')).toBeNull()
    expect(parseEmbedHostsEnv('{"a":"canva.com/design"}')).toBeNull()
    expect(parseEmbedHostsEnv('{"a":"canva.com:443"}')).toBeNull()
  })
})

describe('resolveEmbedHosts', () => {
  it('uses the env list when present', () => {
    const hosts = resolveEmbedHosts('{"loom":"loom.com"}')
    expect(hosts.has('loom.com')).toBe(true)
    expect(hosts.has('canva.com')).toBe(false)
  })

  it('falls back to KNOWN_EMBED_HOSTS when the env value is absent or bad', () => {
    expect(resolveEmbedHosts(undefined)).toBe(KNOWN_EMBED_HOSTS)
    expect(resolveEmbedHosts('garbage')).toBe(KNOWN_EMBED_HOSTS)
  })
})

describe('isEmbedUrlAllowed', () => {
  const hosts = new Set(['canva.com', 'www.youtube-nocookie.com'])

  it('allows an https URL whose host is on the allowlist', () => {
    expect(isEmbedUrlAllowed('https://canva.com/design/x/view', hosts)).toBe(
      true
    )
    expect(
      isEmbedUrlAllowed('https://WWW.YOUTUBE-NOCOOKIE.com/embed/x', hosts)
    ).toBe(true)
  })

  it('rejects a host not on the allowlist', () => {
    expect(isEmbedUrlAllowed('https://evil.example/x', hosts)).toBe(false)
  })

  it('rejects non-https schemes and unparseable URLs', () => {
    expect(isEmbedUrlAllowed('http://canva.com/x', hosts)).toBe(false)
    expect(isEmbedUrlAllowed('javascript:alert(1)', hosts)).toBe(false)
    expect(isEmbedUrlAllowed('data:text/html,x', hosts)).toBe(false)
    expect(isEmbedUrlAllowed('not-a-url', hosts)).toBe(false)
  })

  it('is not fooled by userinfo-style host spoofing', () => {
    // The WHATWG parser treats this host as evil.example, not canva.com.
    expect(
      isEmbedUrlAllowed('https://canva.com@evil.example/x', hosts)
    ).toBe(false)
  })
})

import { parseEmbedHostsEnv } from './parseEmbedHostsEnv'

describe('parseEmbedHostsEnv', () => {
  it('parses a name->hostname object into a Set of hostnames', () => {
    const result = parseEmbedHostsEnv(
      '{"canva":"canva.com","canvaWww":"www.canva.com","loom":"loom.com"}'
    )
    expect(result).toEqual(new Set(['canva.com', 'www.canva.com', 'loom.com']))
  })

  it('treats an empty object as an empty allowlist', () => {
    expect(parseEmbedHostsEnv('{}')).toEqual(new Set())
  })

  it('trims and lowercases the hostname values', () => {
    const result = parseEmbedHostsEnv(
      '{"canva":"  Canva.COM  ","loom":"LOOM.com"}'
    )
    expect(result).toEqual(new Set(['canva.com', 'loom.com']))
  })

  it('throws on malformed JSON', () => {
    expect(() => parseEmbedHostsEnv('not json')).toThrow(/valid JSON object/)
  })

  it('throws when the value is an array (must be an object)', () => {
    expect(() => parseEmbedHostsEnv('["canva.com"]')).toThrow(
      /must be a JSON object/
    )
  })

  it('throws when a value is not a string', () => {
    expect(() => parseEmbedHostsEnv('{"canva":true}')).toThrow()
    expect(() => parseEmbedHostsEnv('{"canva":["canva.com"]}')).toThrow()
  })

  it('throws on a value with a scheme baked in', () => {
    expect(() => parseEmbedHostsEnv('{"canva":"https://canva.com"}')).toThrow(
      /bare hostname/
    )
  })

  it('throws on a value with a path baked in', () => {
    expect(() => parseEmbedHostsEnv('{"canva":"canva.com/design"}')).toThrow(
      /bare hostname/
    )
  })

  it('throws on a value with a port baked in', () => {
    expect(() => parseEmbedHostsEnv('{"canva":"canva.com:8080"}')).toThrow(
      /bare hostname/
    )
  })

  it('names the offending key in the error', () => {
    expect(() => parseEmbedHostsEnv('{"badEntry":"canva.com/x"}')).toThrow(
      /badEntry/
    )
  })
})

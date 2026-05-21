import { parseArgs, parseDiscriminator, resolveWindow } from './cli'

describe('parseArgs', () => {
  it('parses flags and valued options', () => {
    const opts = parseArgs([
      '--days', '7', '--discriminator', 'none', '--llm-scrub', '--pdf',
      '--model', 'google/gemini-2.5-flash', '--debug'
    ])
    expect(opts).toMatchObject({
      days: 7,
      discriminator: 'none',
      llmScrub: true,
      pdf: true,
      model: 'google/gemini-2.5-flash',
      debug: true
    })
  })

  it('defaults discriminator to "default" and booleans to false', () => {
    const opts = parseArgs([])
    expect(opts).toMatchObject({ discriminator: 'default', llmScrub: false, pdf: false, debug: false })
  })

  it('throws on an unknown argument', () => {
    expect(() => parseArgs(['--nope'])).toThrow(/unknown argument: --nope/)
  })

  it('throws when a valued flag is missing its value', () => {
    expect(() => parseArgs(['--days'])).toThrow(/--days requires a value/)
  })
})

describe('resolveWindow', () => {
  it('resolves --days N to a now-Nd .. now window', () => {
    const before = Date.now()
    const { from, to } = resolveWindow(parseArgs(['--days', '7']))
    const after = Date.now()
    const spanDays = (to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)
    expect(spanDays).toBeCloseTo(7, 5)
    expect(to.getTime()).toBeGreaterThanOrEqual(before)
    expect(to.getTime()).toBeLessThanOrEqual(after)
  })

  it('defaults to a 14-day window with no flags', () => {
    const { from, to } = resolveWindow(parseArgs([]))
    const spanDays = (to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)
    expect(spanDays).toBeCloseTo(14, 5)
  })

  it('errors when --days is combined with --from', () => {
    expect(() =>
      resolveWindow(parseArgs(['--days', '7', '--from', '2026-05-01', '--to', '2026-05-10']))
    ).toThrow(/--days cannot be combined/)
  })

  it('errors when only --from is given', () => {
    expect(() => resolveWindow(parseArgs(['--from', '2026-05-01']))).toThrow(
      /must be provided together/
    )
  })

  it('errors on an invalid --from date', () => {
    expect(() =>
      resolveWindow(parseArgs(['--from', 'not-a-date', '--to', '2026-05-10']))
    ).toThrow(/invalid --from date/)
  })

  it('errors when from is not before to', () => {
    expect(() =>
      resolveWindow(parseArgs(['--from', '2026-05-10', '--to', '2026-05-01']))
    ).toThrow(/--from must be before --to/)
  })
})

describe('parseDiscriminator', () => {
  it('maps "default" to the load-test message regex', () => {
    const result = parseDiscriminator('default')
    expect(result.excludeMessageRegex).toBeInstanceOf(RegExp)
    expect(result.excludeMessageRegex?.test('load test concurrent client')).toBe(true)
  })

  it('maps "none" to no exclusion', () => {
    expect(parseDiscriminator('none')).toEqual({})
  })

  it('maps message:<regex> to a custom regex', () => {
    const result = parseDiscriminator('message:^ping')
    expect(result.excludeMessageRegex?.test('PING me')).toBe(true)
  })

  it('maps journey:<csv> to a journeyId set', () => {
    const result = parseDiscriminator('journey:a,b')
    expect(result.excludeJourneyIds).toEqual(new Set(['a', 'b']))
  })

  it('maps tag:<csv> to a tag set', () => {
    const result = parseDiscriminator('tag:load,test')
    expect(result.excludeTags).toEqual(new Set(['load', 'test']))
  })

  it('throws on an unrecognised discriminator', () => {
    expect(() => parseDiscriminator('bogus')).toThrow(/invalid --discriminator/)
  })
})

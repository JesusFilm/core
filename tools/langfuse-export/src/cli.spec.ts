import { parseArgs, parseDiscriminator, resolveWindow } from './cli'

describe('parseArgs', () => {
  it('parses flags and valued options', () => {
    const opts = parseArgs([
      '--days',
      '7',
      '--discriminator',
      'none',
      '--environment',
      'preview',
      '--llm-scrub',
      '--pdf',
      '--model',
      'google/gemini-2.5-flash',
      '--debug'
    ])
    expect(opts).toMatchObject({
      days: 7,
      discriminator: 'none',
      environment: 'preview',
      llmScrub: true,
      pdf: true,
      model: 'google/gemini-2.5-flash',
      debug: true
    })
  })

  it('defaults discriminator to "default", environment to "production", booleans to false', () => {
    const opts = parseArgs([])
    expect(opts).toMatchObject({
      discriminator: 'default',
      environment: 'production',
      llmScrub: false,
      pdf: false,
      debug: false
    })
  })

  it('defaults to the explorer bundle on, legacy report off, no fixture', () => {
    const opts = parseArgs([])
    expect(opts.explorer).toBe(true)
    expect(opts.legacyReport).toBe(false)
    expect(opts.fixture).toBeUndefined()
  })

  it('parses --no-explorer, --legacy-report and --fixture', () => {
    const opts = parseArgs([
      '--no-explorer',
      '--legacy-report',
      '--fixture',
      'fixtures/sample.json'
    ])
    expect(opts.explorer).toBe(false)
    expect(opts.legacyReport).toBe(true)
    expect(opts.fixture).toBe('fixtures/sample.json')
  })

  it('throws when --fixture is missing its value', () => {
    expect(() => parseArgs(['--fixture'])).toThrow(/--fixture requires a value/)
  })

  it('accepts "all" as the env-filter bypass', () => {
    expect(parseArgs(['--environment', 'all']).environment).toBe('all')
  })

  it('throws on an unrecognised --environment value', () => {
    expect(() => parseArgs(['--environment', 'prod'])).toThrow(
      /invalid --environment: prod \(expected production \| stage \| preview \| development \| all\)/
    )
  })

  it('throws on an unknown argument', () => {
    expect(() => parseArgs(['--nope'])).toThrow(/unknown argument: --nope/)
  })

  it('throws when a valued flag is missing its value', () => {
    expect(() => parseArgs(['--days'])).toThrow(/--days requires a value/)
  })

  it('rejects the next flag being swallowed as a value', () => {
    // Without the guard, model would become '--debug' and --debug would drop.
    expect(() => parseArgs(['--model', '--debug'])).toThrow(
      /--model requires a value/
    )
  })

  it('throws on a non-numeric --throttle (which would NaN-bypass the rate limit)', () => {
    expect(() => parseArgs(['--throttle', 'abc'])).toThrow(/invalid --throttle/)
  })

  it('throws on a negative --throttle', () => {
    expect(() => parseArgs(['--throttle', '-100'])).toThrow(
      /invalid --throttle/
    )
  })

  it('throws when --throttle swallows the next flag as its value', () => {
    // requireValue rejects '--pdf' before it can be NaN-parsed as a number.
    expect(() => parseArgs(['--throttle', '--pdf'])).toThrow(
      /--throttle requires a value/
    )
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
      resolveWindow(
        parseArgs(['--days', '7', '--from', '2026-05-01', '--to', '2026-05-10'])
      )
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

  it('errors on an invalid --to date', () => {
    expect(() =>
      resolveWindow(parseArgs(['--from', '2026-05-01', '--to', 'not-a-date']))
    ).toThrow(/invalid --to date/)
  })

  it('errors when --days is so large it overflows to an Invalid Date', () => {
    expect(() => resolveWindow(parseArgs(['--days', '1e15']))).toThrow(
      /too large/
    )
  })
})

describe('parseDiscriminator', () => {
  it('maps "default" to the load-test message regex', () => {
    const result = parseDiscriminator('default')
    expect(result.excludeMessageRegex).toBeInstanceOf(RegExp)
    expect(
      result.excludeMessageRegex?.test('load test concurrent client')
    ).toBe(true)
  })

  it('maps "none" to no exclusion', () => {
    expect(parseDiscriminator('none')).toEqual({})
  })

  it('maps message:<regex> to a custom regex', () => {
    const result = parseDiscriminator('message:^ping')
    expect(result.excludeMessageRegex?.test('PING me')).toBe(true)
  })

  it('throws a friendly error on an invalid message regex', () => {
    expect(() => parseDiscriminator('message:[')).toThrow(
      /invalid --discriminator message regex/
    )
  })

  it('rejects an empty or whitespace-only message pattern (matches everything)', () => {
    expect(() => parseDiscriminator('message:')).toThrow(
      /pattern cannot be empty/
    )
    expect(() => parseDiscriminator('message:   ')).toThrow(
      /pattern cannot be empty/
    )
  })

  it('maps journey:<csv> to a journeyId set', () => {
    const result = parseDiscriminator('journey:a,b')
    expect(result.excludeJourneyIds).toEqual(new Set(['a', 'b']))
  })

  it('maps tag:<csv> to a tag set', () => {
    const result = parseDiscriminator('tag:load,test')
    expect(result.excludeTags).toEqual(new Set(['load', 'test']))
  })

  it('throws on an unrecognised discriminator with no colon', () => {
    expect(() => parseDiscriminator('bogus')).toThrow(/invalid --discriminator/)
  })

  it('throws on an unrecognised discriminator kind with a colon', () => {
    expect(() => parseDiscriminator('environment:foo')).toThrow(
      /invalid --discriminator kind/
    )
  })
})

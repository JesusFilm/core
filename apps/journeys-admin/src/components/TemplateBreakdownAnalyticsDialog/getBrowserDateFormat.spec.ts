import { format, parse } from 'date-fns'

import { getBrowserDateFormat } from './getBrowserDateFormat'

describe('getBrowserDateFormat', () => {
  const DateTimeFormat = Intl.DateTimeFormat
  const sampleDate = new Date(2026, 4, 4)
  const options: Intl.DateTimeFormatOptions = {
    calendar: 'gregory',
    numberingSystem: 'latn',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it.each([
    ['en-US', 'MM/dd/yyyy', '05/04/2026'],
    ['en-NZ', 'dd/MM/yyyy', '04/05/2026'],
    ['ja-JP', 'yyyy/MM/dd', '2026/05/04'],
    ['en', 'MM/dd/yyyy', '05/04/2026'],
    ['de-DE', 'dd.MM.yyyy', '04.05.2026']
  ])('uses the browser Intl pattern for %s', (locale, pattern, displayed) => {
    const formatter = vi
      .spyOn(Intl, 'DateTimeFormat')
      .mockImplementation(function (locales, dateOptions) {
        return new DateTimeFormat(locales ?? locale, dateOptions)
      })

    expect(getBrowserDateFormat()).toBe(pattern)
    expect(formatter).toHaveBeenCalledWith(undefined, options)
    expect(format(sampleDate, pattern)).toBe(displayed)
    expect(parse(displayed, pattern, sampleDate)).toEqual(sampleDate)
  })

  it('preserves and escapes literal separators for date-fns', () => {
    vi.spyOn(Intl.DateTimeFormat.prototype, 'formatToParts').mockReturnValue([
      { type: 'day', value: '04' },
      { type: 'literal', value: " de ' " },
      { type: 'month', value: '05' },
      { type: 'literal', value: ' / ' },
      { type: 'year', value: '2026' }
    ])
    const pattern = getBrowserDateFormat()
    const displayed = "04 de ' 05 / 2026"
    expect(format(sampleDate, pattern)).toBe(displayed)
    expect(parse(displayed, pattern, sampleDate)).toEqual(sampleDate)
  })

  it.each([
    [],
    [{ type: 'month', value: '05' }],
    [
      { type: 'year', value: '2026' },
      { type: 'month', value: '05' },
      { type: 'month', value: '05' }
    ],
    [{ type: 'unknown', value: '?' }]
  ] satisfies Intl.DateTimeFormatPart[][])(
    'falls back for unusable parts %j',
    (...parts) => {
      vi.spyOn(Intl.DateTimeFormat.prototype, 'formatToParts').mockReturnValue(
        parts
      )
      expect(getBrowserDateFormat()).toBe('dd-MM-yyyy')
    }
  )

  it('falls back when Intl fails', () => {
    vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(function () {
      throw new Error('Intl unavailable')
    })
    expect(getBrowserDateFormat()).toBe('dd-MM-yyyy')
  })

  it('uses the fallback without calling Intl during server rendering', () => {
    vi.stubGlobal('window', undefined)
    const formatter = vi.spyOn(Intl, 'DateTimeFormat')
    expect(getBrowserDateFormat()).toBe('dd-MM-yyyy')
    expect(formatter).not.toHaveBeenCalled()
  })
})

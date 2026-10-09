import { escapeCsvValue, toCsv } from './csv'

describe('escapeCsvValue', () => {
  it('leaves plain values alone', () => {
    expect(escapeCsvValue('abc')).toBe('abc')
    expect(escapeCsvValue(12)).toBe('12')
    expect(escapeCsvValue(true)).toBe('true')
  })

  it('renders null and undefined as empty', () => {
    expect(escapeCsvValue(null)).toBe('')
    expect(escapeCsvValue(undefined)).toBe('')
  })

  it('quotes values containing commas, quotes or newlines', () => {
    expect(escapeCsvValue('a,b')).toBe('"a,b"')
    expect(escapeCsvValue('say "hi"')).toBe('"say ""hi"""')
    expect(escapeCsvValue('line\nbreak')).toBe('"line\nbreak"')
  })
})

describe('toCsv', () => {
  it('writes a header row and one line per row', () => {
    const csv = toCsv(
      [
        { day: '2026-09-01', count: 3, qrCount: 1 },
        { day: '2026-09-02', count: 0, qrCount: 0 }
      ],
      [
        { header: 'Day', value: (row) => row.day },
        { header: 'Scans', value: (row) => row.count },
        { header: 'QR scans', value: (row) => row.qrCount }
      ]
    )

    expect(csv).toBe(
      ['Day,Scans,QR scans', '2026-09-01,3,1', '2026-09-02,0,0'].join('\r\n')
    )
  })

  it('writes only the header when there are no rows', () => {
    expect(toCsv([], [{ header: 'Day', value: () => '' }])).toBe('Day')
  })
})

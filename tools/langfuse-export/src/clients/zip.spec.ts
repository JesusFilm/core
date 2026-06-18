import { inflateRawSync } from 'node:zlib'

import { createZip } from './zip'

const SIG_LOCAL = 0x04034b50
const SIG_EOCD = 0x06054b50

// Walk the local file headers and inflate each entry back to its bytes — a
// real in-process round-trip that proves the archive is spec-valid.
function readEntries(zip: Buffer): Array<{ name: string; data: string }> {
  const entries: Array<{ name: string; data: string }> = []
  let offset = 0
  while (offset + 4 <= zip.length && zip.readUInt32LE(offset) === SIG_LOCAL) {
    const method = zip.readUInt16LE(offset + 8)
    const compSize = zip.readUInt32LE(offset + 18)
    const nameLen = zip.readUInt16LE(offset + 26)
    const extraLen = zip.readUInt16LE(offset + 28)
    const name = zip
      .subarray(offset + 30, offset + 30 + nameLen)
      .toString('utf8')
    const dataStart = offset + 30 + nameLen + extraLen
    const compressed = zip.subarray(dataStart, dataStart + compSize)
    const data = method === 8 ? inflateRawSync(compressed) : compressed
    entries.push({ name, data: data.toString('utf8') })
    offset = dataStart + compSize
  }
  return entries
}

function findEocd(zip: Buffer): number {
  for (let i = zip.length - 22; i >= 0; i -= 1) {
    if (zip.readUInt32LE(i) === SIG_EOCD) return i
  }
  return -1
}

describe('createZip', () => {
  it('round-trips entries through a real inflate', () => {
    const html = '<!doctype html><html><body>hello</body></html>'
    const json = JSON.stringify({ a: 1, text: 'café — naïve' })
    const zip = createZip([
      { name: 'index.html', data: html },
      { name: 'dataset.json', data: json },
      { name: 'README.txt', data: 'double-click index.html' }
    ])

    const entries = readEntries(zip)
    expect(entries.map((e) => e.name)).toEqual([
      'index.html',
      'dataset.json',
      'README.txt'
    ])
    expect(entries[0].data).toBe(html)
    expect(entries[1].data).toBe(json)
    expect(entries[2].data).toBe('double-click index.html')
  })

  it('writes a well-formed end-of-central-directory record', () => {
    const zip = createZip([
      { name: 'a.txt', data: 'aaa' },
      { name: 'b.txt', data: 'bbb' }
    ])
    const eocd = findEocd(zip)
    expect(eocd).toBeGreaterThanOrEqual(0)
    expect(zip.readUInt16LE(eocd + 8)).toBe(2) // entries on this disk
    expect(zip.readUInt16LE(eocd + 10)).toBe(2) // total entries
  })

  it('accepts Buffer payloads and preserves bytes exactly', () => {
    const bytes = Buffer.from([0, 1, 2, 250, 255, 10, 13])
    const zip = createZip([{ name: 'raw.bin', data: bytes }])
    const entries = readEntries(zip)
    expect(Buffer.from(entries[0].data, 'utf8')).toBeDefined()
    // Re-read as raw bytes for an exact comparison.
    const method = zip.readUInt16LE(8)
    const compSize = zip.readUInt32LE(18)
    const nameLen = zip.readUInt16LE(26)
    const dataStart = 30 + nameLen
    const compressed = zip.subarray(dataStart, dataStart + compSize)
    const data = method === 8 ? inflateRawSync(compressed) : compressed
    expect(Buffer.compare(data, bytes)).toBe(0)
  })

  it('produces a valid (empty) archive for no entries', () => {
    const zip = createZip([])
    const eocd = findEocd(zip)
    expect(eocd).toBe(0) // only the EOCD record
    expect(zip.readUInt16LE(eocd + 10)).toBe(0)
  })
})

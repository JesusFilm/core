// Minimal, dependency-free ZIP writer (NES-1719).
//
// The deliverable is a single zipped folder a stakeholder unzips and opens by
// double-clicking the HTML — so the producer just needs to emit a spec-valid
// archive. Rather than add a dependency or shell out to the system `zip`
// (absent on stock Windows), this builds the archive in memory using Node's
// built-in zlib raw-deflate. Pure (Buffer in -> Buffer out), so it is unit-
// testable and round-trips through any standard unzip tool.
//
// Implements the classic ZIP layout: a local file header + deflated data per
// entry, a central directory, and an end-of-central-directory record. No
// Zip64 — fine for the report-scale corpora this tool produces.

import { deflateRawSync } from 'node:zlib'

export interface ZipEntry {
  name: string
  data: Buffer | string
}

const SIG_LOCAL = 0x04034b50
const SIG_CENTRAL = 0x02014b50
const SIG_EOCD = 0x06054b50
const VERSION = 20 // 2.0 — deflate
const FLAG_UTF8 = 0x0800 // general-purpose bit 11: filename is UTF-8
const METHOD_DEFLATE = 8
// Fixed DOS timestamp (1980-01-01 00:00) so archives are reproducible.
const DOS_TIME = 0
const DOS_DATE = 0x0021

const CRC_TABLE = ((): Uint32Array => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) {
      c = (c & 1) === 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[n] = c >>> 0
  }
  return table
})()

function crc32(buffer: Buffer): number {
  let crc = 0xffffffff
  for (let i = 0; i < buffer.length; i += 1) {
    crc = CRC_TABLE[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

export function createZip(entries: ZipEntry[]): Buffer {
  const localChunks: Buffer[] = []
  const centralChunks: Buffer[] = []
  let offset = 0

  for (const entry of entries) {
    const nameBuf = Buffer.from(entry.name, 'utf8')
    const dataBuf = Buffer.isBuffer(entry.data)
      ? entry.data
      : Buffer.from(entry.data, 'utf8')
    const crc = crc32(dataBuf)
    const compressed = deflateRawSync(dataBuf)

    const local = Buffer.alloc(30)
    local.writeUInt32LE(SIG_LOCAL, 0)
    local.writeUInt16LE(VERSION, 4)
    local.writeUInt16LE(FLAG_UTF8, 6)
    local.writeUInt16LE(METHOD_DEFLATE, 8)
    local.writeUInt16LE(DOS_TIME, 10)
    local.writeUInt16LE(DOS_DATE, 12)
    local.writeUInt32LE(crc, 14)
    local.writeUInt32LE(compressed.length, 18)
    local.writeUInt32LE(dataBuf.length, 22)
    local.writeUInt16LE(nameBuf.length, 26)
    local.writeUInt16LE(0, 28) // extra field length
    localChunks.push(local, nameBuf, compressed)

    const central = Buffer.alloc(46)
    central.writeUInt32LE(SIG_CENTRAL, 0)
    central.writeUInt16LE(VERSION, 4) // version made by
    central.writeUInt16LE(VERSION, 6) // version needed
    central.writeUInt16LE(FLAG_UTF8, 8)
    central.writeUInt16LE(METHOD_DEFLATE, 10)
    central.writeUInt16LE(DOS_TIME, 12)
    central.writeUInt16LE(DOS_DATE, 14)
    central.writeUInt32LE(crc, 16)
    central.writeUInt32LE(compressed.length, 20)
    central.writeUInt32LE(dataBuf.length, 24)
    central.writeUInt16LE(nameBuf.length, 28)
    central.writeUInt16LE(0, 30) // extra field length
    central.writeUInt16LE(0, 32) // comment length
    central.writeUInt16LE(0, 34) // disk number start
    central.writeUInt16LE(0, 36) // internal attributes
    central.writeUInt32LE(0, 38) // external attributes
    central.writeUInt32LE(offset, 42) // local header offset
    centralChunks.push(central, nameBuf)

    offset += local.length + nameBuf.length + compressed.length
  }

  const localSection = Buffer.concat(localChunks)
  const centralSection = Buffer.concat(centralChunks)

  const eocd = Buffer.alloc(22)
  eocd.writeUInt32LE(SIG_EOCD, 0)
  eocd.writeUInt16LE(0, 4) // this disk number
  eocd.writeUInt16LE(0, 6) // disk with central directory
  eocd.writeUInt16LE(entries.length, 8) // entries on this disk
  eocd.writeUInt16LE(entries.length, 10) // total entries
  eocd.writeUInt32LE(centralSection.length, 12) // central directory size
  eocd.writeUInt32LE(localSection.length, 16) // central directory offset
  eocd.writeUInt16LE(0, 20) // comment length

  return Buffer.concat([localSection, centralSection, eocd])
}

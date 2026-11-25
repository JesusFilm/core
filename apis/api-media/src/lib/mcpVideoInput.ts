import { createHash } from 'node:crypto'

import type { MediaFile } from '@core/yoga/mcp/mediaJobContract'

/** Bounded memory validation. Mux subsequently validates the full container and
 * must report a playable video track before the asset can enter the library.
 */
export class InvalidVideoInput extends Error {}
export async function validateVideoInput(
  input: AsyncIterable<Buffer>,
  file: MediaFile
) {
  const hash = createHash('sha256')
  let bytes = 0
  let header = Buffer.alloc(0)
  for await (const part of input) {
    bytes += part.length
    if (bytes > file.size) throw new InvalidVideoInput('LIMIT_EXCEEDED')
    if (header.length < 32)
      header = Buffer.concat([header, part.subarray(0, 32 - header.length)])
    hash.update(part)
  }
  const brand = header.toString('ascii', 8, 12)
  if (
    bytes !== file.size ||
    hash.digest('hex') !== file.sha256 ||
    header.length < 16 ||
    header.toString('ascii', 4, 8) !== 'ftyp' ||
    header.readUInt32BE(0) < 16 ||
    !(file.mime === 'video/quicktime'
      ? brand === 'qt  '
      : [
          'isom',
          'iso2',
          'iso4',
          'iso5',
          'iso6',
          'mp41',
          'mp42',
          'avc1',
          'M4V '
        ].includes(brand))
  )
    throw new InvalidVideoInput('VALIDATION_FAILED')
}

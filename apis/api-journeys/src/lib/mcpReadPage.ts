import {
  type ReadResult,
  resultContractVersion
} from '@core/yoga/mcp/readContract'

/** A page boundary counts serialized bytes, including metadata and its cursor.
 * Never drop an oversized object or advance past content that was not returned.
 */
export function boundedReadPage(
  base: Record<string, unknown>,
  objects: unknown[],
  hasMore: boolean,
  nextCursor: (count: number) => string
): ReadResult {
  let count = Math.min(objects.length, 100)
  while (true) {
    const complete = !hasMore && count === objects.length
    const result = {
      contractVersion: resultContractVersion,
      ...base,
      blocks: objects.slice(0, count),
      complete,
      nextCursor: complete ? null : nextCursor(count)
    }
    if (Buffer.byteLength(JSON.stringify(result)) <= 524288) return result
    if (count <= 1) throw new Error('LIMIT_EXCEEDED')
    count--
  }
}

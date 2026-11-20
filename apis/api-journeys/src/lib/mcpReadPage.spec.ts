import { boundedReadPage } from './mcpReadPage'

describe('boundedReadPage', () => {
  it('pages at the byte limit without skipping the first unreturned object', () => {
    const objects = Array.from({ length: 100 }, (_, index) => ({
      id: String(index),
      content: 'é'.repeat(4000)
    }))
    const page = boundedReadPage({ revision: '42' }, objects, false, String)
    const blocks = page.blocks as typeof objects
    expect(Buffer.byteLength(JSON.stringify(page))).toBeLessThanOrEqual(524288)
    expect(blocks.length).toBeGreaterThan(0)
    expect(blocks.length).toBeLessThan(100)
    expect(page).toMatchObject({
      contractVersion: '1',
      revision: '42',
      complete: false,
      nextCursor: String(blocks.length)
    })
    const rest = boundedReadPage(
      { revision: '42' },
      objects.slice(blocks.length),
      false,
      String
    )
    expect([
      ...(page.blocks as unknown[]),
      ...(rest.blocks as unknown[])
    ]).toEqual(objects)
    expect(rest.complete).toBe(true)
    expect(rest.nextCursor).toBeNull()
  })

  it('respects the object cap and accounts for metadata and cursor bytes', () => {
    const page = boundedReadPage(
      { warnings: ['bounded'] },
      Array.from({ length: 101 }, (_, id) => ({ id })),
      true,
      (count) => `next-${count}`
    )
    expect(page.blocks).toHaveLength(100)
    expect(page.nextCursor).toBe('next-100')
    expect(page.complete).toBe(false)
  })

  it('returns an empty final page and refuses a single oversized object', () => {
    expect(boundedReadPage({}, [], false, String)).toMatchObject({
      blocks: [],
      complete: true,
      nextCursor: null
    })
    expect(() =>
      boundedReadPage({}, ['x'.repeat(524288)], true, String)
    ).toThrow('LIMIT_EXCEEDED')
  })
})

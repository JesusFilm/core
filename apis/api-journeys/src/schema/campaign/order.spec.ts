import { renumber } from './order'

describe('renumber', () => {
  it('writes each row its position from zero and returns the writes in order', async () => {
    const write = vi.fn(async (row: { id: string }, order: number) => ({
      ...row,
      order
    }))

    const result = await renumber(
      [{ id: 'c' }, { id: 'a' }, { id: 'b' }],
      write
    )

    expect(write.mock.calls).toEqual([
      [{ id: 'c' }, 0],
      [{ id: 'a' }, 1],
      [{ id: 'b' }, 2]
    ])
    expect(result).toEqual([
      { id: 'c', order: 0 },
      { id: 'a', order: 1 },
      { id: 'b', order: 2 }
    ])
  })

  it('writes nothing for an empty list', async () => {
    const write = vi.fn()

    await expect(renumber([], write)).resolves.toEqual([])
    expect(write).not.toHaveBeenCalled()
  })
})

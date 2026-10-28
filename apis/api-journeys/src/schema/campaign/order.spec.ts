import { renumber } from './order'

describe('renumber', () => {
  it('writes each row its position from zero and returns the writes in the list order', async () => {
    const write = vi.fn(async (row: { id: string }, order: number) => ({
      ...row,
      order
    }))

    const result = await renumber(
      [{ id: 'c' }, { id: 'a' }, { id: 'b' }],
      write
    )

    expect(result).toEqual([
      { id: 'c', order: 0 },
      { id: 'a', order: 1 },
      { id: 'b', order: 2 }
    ])
  })

  it('writes one row at a time in id order, as lockCampaignTextRows locks them', async () => {
    const calls: string[] = []
    let inFlight = 0
    const write = vi.fn(async (row: { id: string }, order: number) => {
      inFlight++
      expect(inFlight).toBe(1)
      await Promise.resolve()
      calls.push(`${row.id}:${order}`)
      inFlight--
    })

    await renumber([{ id: 'c' }, { id: 'a' }, { id: 'b' }], write)

    expect(calls).toEqual(['a:1', 'b:2', 'c:0'])
  })

  it('writes nothing for an empty list', async () => {
    const write = vi.fn()

    await expect(renumber([], write)).resolves.toEqual([])
    expect(write).not.toHaveBeenCalled()
  })
})

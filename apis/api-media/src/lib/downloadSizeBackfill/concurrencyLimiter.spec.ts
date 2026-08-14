import { createConcurrencyLimiter } from './concurrencyLimiter'

describe('createConcurrencyLimiter', () => {
  it('never runs more than `limit` tasks concurrently', async () => {
    const limit = createConcurrencyLimiter(2)
    let active = 0
    let maxActive = 0

    const task = async (): Promise<void> => {
      active++
      maxActive = Math.max(maxActive, active)
      await new Promise((resolve) => setTimeout(resolve, 5))
      active--
    }

    await Promise.all(
      Array.from({ length: 6 }, () => limit(task))
    )

    expect(maxActive).toBeLessThanOrEqual(2)
  })

  it('propagates a task result and rejection', async () => {
    const limit = createConcurrencyLimiter(1)

    await expect(limit(async () => 'ok')).resolves.toBe('ok')
    await expect(
      limit(async () => {
        throw new Error('boom')
      })
    ).rejects.toThrow('boom')
  })
})

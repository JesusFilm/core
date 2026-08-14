/**
 * Minimal concurrency limiter: at most `limit` tasks run at once, extra
 * tasks queue in submission order. Used to give each provider its own
 * conservative concurrency (Mux and legacy hosts are rate-sensitive; cheap
 * R2 metadata lookups can run with more headroom).
 */
export function createConcurrencyLimiter(limit: number) {
  const boundedLimit = Math.max(1, limit)
  let active = 0
  const queue: Array<() => void> = []

  function next(): void {
    if (active >= boundedLimit) return
    const run = queue.shift()
    if (run == null) return
    active++
    run()
  }

  return async function withLimit<T>(task: () => Promise<T>): Promise<T> {
    await new Promise<void>((resolve) => {
      queue.push(resolve)
      next()
    })

    try {
      return await task()
    } finally {
      active--
      next()
    }
  }
}

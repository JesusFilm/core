import { vi } from 'vitest'

vi.mock('bullmq', () => {
  // Vitest 4 spies support `new`, so a constructor mock has to be a `function`
  // (or class) — an arrow implementation has no [[Construct]] and throws
  // "is not a constructor" at the `new Queue(...)` call site.
  const Queue = vi.fn(function () {
    return {
      add: vi.fn().mockResolvedValue({ id: 'test-job-id' }),
      getJob: vi
        .fn()
        .mockResolvedValue({ id: 'test-job-id', progress: 0, data: {} })
    }
  })
  const QueueEvents = vi.fn(function () {
    return { on: vi.fn() }
  })
  return { Queue, QueueEvents }
})

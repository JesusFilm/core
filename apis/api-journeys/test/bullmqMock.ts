import { beforeEach, vi } from 'vitest'

// Every queue module opens a Redis connection at import, and the schema
// imports them all, so a real Queue, Worker or QueueEvents retries
// 127.0.0.1:6379 for the life of the fork. One `add` is shared by every
// queue module (`googleSheetsSync` is required lazily); the rest of their
// surface is a no-op.
export const mockQueueAdd = vi.fn()

vi.mock('bullmq', async () => ({
  ...(await vi.importActual('bullmq')),
  Queue: vi.fn(function () {
    return {
      add: mockQueueAdd,
      getJob: vi.fn(async () => undefined),
      getJobs: vi.fn(async () => []),
      remove: vi.fn(async () => 0),
      close: vi.fn(async () => undefined)
    }
  }),
  Worker: vi.fn(function () {
    return { on: vi.fn(), close: vi.fn(async () => undefined) }
  }),
  QueueEvents: vi.fn(function () {
    return { on: vi.fn(), close: vi.fn(async () => undefined) }
  })
}))

beforeEach(() => {
  mockQueueAdd.mockReset()
  mockQueueAdd.mockResolvedValue(undefined)
})

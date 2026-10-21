import { beforeEach, vi } from 'vitest'

// Every queue module opens a Redis connection at import, and the schema
// imports them all, so a real Queue retries 127.0.0.1:6379 for the life of
// the fork. One `add` is shared by all four queues.
export const mockQueueAdd = vi.fn()

vi.mock('bullmq', async () => ({
  ...(await vi.importActual('bullmq')),
  Queue: vi.fn(function () {
    return { add: mockQueueAdd }
  })
}))

beforeEach(() => {
  mockQueueAdd.mockReset()
  mockQueueAdd.mockResolvedValue(undefined)
})

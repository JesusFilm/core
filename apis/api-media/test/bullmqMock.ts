import { vi } from 'vitest'

vi.mock('bullmq', () => {
  const Queue = vi.fn().mockImplementation(() => ({
    add: vi.fn().mockResolvedValue({ id: 'test-job-id' }),
    getJob: vi
      .fn()
      .mockResolvedValue({ id: 'test-job-id', progress: 0, data: {} })
  }))
  const QueueEvents = vi.fn().mockImplementation(() => ({
    on: vi.fn()
  }))
  return { Queue, QueueEvents }
})

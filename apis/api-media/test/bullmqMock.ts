jest.mock('bullmq', () => {
  const Queue = jest.fn().mockImplementation(() => ({
    add: jest.fn().mockResolvedValue({ id: 'test-job-id' }),
    getJob: jest
      .fn()
      .mockResolvedValue({ id: 'test-job-id', progress: 0, data: {} })
  }))
  const QueueEvents = jest.fn().mockImplementation(() => ({
    on: jest.fn()
  }))
  return { Queue, QueueEvents }
})

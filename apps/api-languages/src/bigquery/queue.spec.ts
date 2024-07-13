import { bullConnection, queueName } from './queue'
import { Queue } from 'bullmq'

jest.mock('bullmq')

describe('bigquery/queue', () => {
  it('should export queueName', () => {
    expect(queueName).toBe('api-languages-arclight')
  })

  it('should export bullConnection', () => {
    expect(bullConnection).toEqual({
      host: process.env.REDIS_URL ?? 'redis',
      port: 6379
    })
  })

  describe('init', () => {
    it('should create a queue', () => {
      import('./queue')
      expect(Queue).toHaveBeenCalledWith(queueName, {
        connection: bullConnection
      })
    })
  })
})

import { Queue } from 'bullmq'

import { connection } from '../connection'

import { queueName } from './names'

jest.mock('bullmq')

describe('bigQuery/queue', () => {
  it('should create a queue', async () => {
    await import(
      /* webpackChunkName: "bigQueryQueue" */
      './queue'
    )
    expect(Queue).toHaveBeenCalledWith(queueName, {
      connection
    })
  })
})

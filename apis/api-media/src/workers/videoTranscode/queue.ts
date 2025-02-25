import { Queue } from 'bullmq'

import { connection } from '../lib/connection'

import { jobName, queueName } from './config'
import { TranscodeVideoJobData } from './service/service'

// Create a singleton queue instance
let queueInstance: Queue | null = null

export function getQueue(): Queue {
  if (queueInstance === null) {
    queueInstance = new Queue(queueName, { connection })
  }
  return queueInstance
}

export async function addTranscodeVideoJob(
  data: TranscodeVideoJobData
): Promise<string> {
  const queue = getQueue()

  const job = await queue.add(jobName, data, {
    removeOnComplete: { age: 3600 }, // 1 hour
    removeOnFail: { age: 86400, count: 50 }, // 1 day
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000 // 5 seconds
    }
  })

  if (!job.id) {
    throw new Error('Failed to create job: No job ID returned')
  }

  return job.id
}

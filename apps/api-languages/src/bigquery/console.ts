import { importLanguagesQueue } from './queue'
import { jobName } from './worker'

export async function main(): Promise<void> {
  const repeatableJobs = await importLanguagesQueue.getRepeatableJobs()

  for (const job of repeatableJobs) {
    if (job.name === jobName) {
      await importLanguagesQueue.removeRepeatableByKey(job.key)
    }
  }
  await importLanguagesQueue.add(
    jobName,
    {},
    {
      removeOnComplete: {
        age: 3600 // keep up to 1 hour
      },
      removeOnFail: {
        age: 24 * 3600 // keep up to 24 hours
      }
    }
  )
  // avoid test failing on process.exit
  if (process.env.NODE_ENV === 'test') return
  process.exit(0)
}

void main()

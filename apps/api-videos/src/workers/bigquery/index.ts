import { importLanguagesQueue } from './queue'
import { jobName } from './worker'

if (process.env.NODE_ENV === 'production')
  void importLanguagesQueue.add(
    jobName,
    {},
    {
      removeOnComplete: {
        age: 3600 // keep up to 1 hour
      },
      removeOnFail: {
        age: 24 * 3600 // keep up to 24 hours
      },
      repeat: {
        pattern: '0 0 1 * * *' // Run every day at 1 in the morning
      }
    }
  )

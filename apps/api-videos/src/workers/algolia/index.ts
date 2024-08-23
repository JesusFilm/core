import { jobName } from './names'
import { queue } from './queue'
import './worker'

const ONE_HOUR = 3600
const ONE_DAY = 86_400
const EVERY_DAY_AT_1_AM = '0 0 1 * * *'

export async function main(): Promise<void> {
  void queue.add(
    jobName,
    {},
    {
      removeOnComplete: { age: ONE_HOUR },
      removeOnFail: { age: ONE_DAY },
      repeat: { pattern: EVERY_DAY_AT_1_AM }
    }
  )
}

// avoid running on test environment
if (process.env.NODE_ENV !== 'test') void main()

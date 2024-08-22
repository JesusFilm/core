import chalk from 'chalk'

import { jobName, queueName } from './names'
import { bigQueryQueue } from './queue'

const ONE_HOUR = 3600
const ONE_DAY = 86_400

export async function main(): Promise<void> {
  const jobs = await bigQueryQueue.getJobs()

  for (const job of jobs) {
    if (job.name === jobName && job.id != null) {
      const state = await job.getState()
      await bigQueryQueue.remove(job.id)
      console.log(
        chalk.red(`✗`),
        `DEL:`,
        chalk.bold(`${jobName} (${state})`),
        chalk.grey(`from ${queueName} queue`)
      )
    }
  }
  await bigQueryQueue.add(
    jobName,
    {},
    {
      removeOnComplete: { age: ONE_HOUR },
      removeOnFail: { age: ONE_DAY }
    }
  )
  console.log(
    chalk.greenBright('✔'),
    'ADD:',
    chalk.bold(jobName),
    chalk.grey(`to ${queueName} queue`)
  )
  console.log(
    chalk.cyan(
      'you must start the worker by using',
      chalk.bold('nx run api-videos:serve'),
      'or',
      chalk.bold('nf start')
    )
  )
  if (process.env.NODE_ENV !== 'test') process.exit(0)
}

// avoid running on test environment
if (process.env.NODE_ENV !== 'test') void main()

import { Queue } from 'bullmq'
import chalk from 'chalk'

import { connection } from './lib/connection'

const ONE_HOUR = 3600
const ONE_DAY = 86_400

export async function cli(argv = process.argv): Promise<void> {
  let queue: Queue, jobName: string, queueName: string

  switch (argv[2]) {
    case 'video-children': {
      const config = await import(
        /* webpackChunkName: "video-children" */
        './videoChildren'
      )
      queueName = config.queueName
      jobName = config.jobName
      queue = new Queue(queueName, { connection })
      break
    }
    case 'blocklist': {
      const config = await import(
        /* webpackChunkName: "blocklist" */
        './blocklist'
      )
      queueName = config.queueName
      jobName = config.jobName
      queue = new Queue(queueName, { connection })
      break
    }
    case 'crowdin': {
      const config = await import(
        /* webpackChunkName: "crowdin" */
        './crowdin'
      )
      queueName = config.queueName
      jobName = config.jobName
      queue = new Queue(queueName, { connection })
      break
    }
    case 'seed': {
      const config = await import(
        /* webpackChunkName: "seed" */
        './seed'
      )
      queueName = config.queueName
      jobName = config.jobName
      queue = new Queue(queueName, { connection })
      break
    }
    case 'data-export': {
      const config = await import(
        /* webpackChunkName: "data-export" */
        './dataExport'
      )
      queueName = config.queueName
      jobName = config.jobName
      queue = new Queue(queueName, { connection })
      break
    }
    case 'publish': {
      const config = await import(
        /* webpackChunkName: "published" */
        './published'
      )
      queueName = config.queueName
      jobName = config.jobName
      queue = new Queue(queueName, { connection })
      break
    }
    case 'process-video-downloads': {
      const config = await import(
        /* webpackChunkName: "process-video-downloads" */
        './processVideoDownloads'
      )
      queueName = config.queueName
      jobName = config.jobName
      queue = new Queue(queueName, { connection })
      break
    }
    default:
      throw new Error('unknown queue')
  }

  const jobs = await queue.getJobs()

  for (const job of jobs) {
    if (job.name === jobName && job.id != null && !(await job.isDelayed())) {
      const state = await job.getState()
      await queue.remove(job.id)
      console.log(
        chalk.red(`✗`),
        `DEL:`,
        chalk.bold(jobName),
        chalk.grey(`from ${queueName} queue`)
      )
      console.log(chalk.grey(`{ "id": "${job.id}", "state": "${state}" }`))
    }
  }
  const job = await queue.add(
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
    chalk.bold(`${jobName}`),
    chalk.grey(`to ${queueName} queue`)
  )
  console.log(
    chalk.grey(`{ "id": "${job.id}", "state": "${await job.getState()}" }`)
  )
  console.log(
    chalk.cyan(
      'you must start the worker by using',
      chalk.bold('nx run api-media:serve'),
      'or',
      chalk.bold('nf start')
    )
  )
  if (process.env.NODE_ENV !== 'test') process.exit(0)
}

// avoid running on test environment
if (process.env.NODE_ENV !== 'test') void cli()

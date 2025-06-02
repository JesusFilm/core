import { Queue } from 'bullmq'
import chalk from 'chalk'

import { connection } from './lib/connection'

const ONE_HOUR = 3600
const ONE_DAY = 86_400

export async function cli(argv = process.argv): Promise<void> {
  let queue: Queue, jobName: string, queueName: string

  switch (argv[2]) {
    case 'shortlink-updater': {
      const config = await import(
        /* webpackChunkName: "shortlinkUpdater" */
        './shortlinkUpdater'
      )
      queueName = config.queueName
      jobName = config.jobName
      queue = new Queue(queueName, { connection })
      break
    }
    case 'e2e-cleanup': {
      const config = await import(
        /* webpackChunkName: "e2eCleanup" */
        './e2eCleanup'
      )
      queueName = config.queueName
      jobName = config.jobName
      queue = new Queue(queueName, { connection })
      break
    }
    default:
      throw new Error('unknown queue')
  }

  // Check for specific options
  const options: Record<string, any> = {}

  // For shortlink-updater, check if specific options are provided
  if (argv[2] === 'shortlink-updater') {
    // Default to updating all shortlinks - no options needed
    options.__typename = 'updateAllShortlinks'
  }

  // For e2e-cleanup, parse command line options
  if (argv[2] === 'e2e-cleanup') {
    options.__typename = 'e2eCleanup'

    // Check for --dry-run flag
    if (argv.includes('--dry-run')) {
      options.dryRun = true
      console.log(
        chalk.yellow('Running in DRY RUN mode - no data will be deleted')
      )
    }

    // Check for --hours parameter
    const hoursIndex = argv.indexOf('--hours')
    if (hoursIndex !== -1 && argv[hoursIndex + 1]) {
      const hours = parseInt(argv[hoursIndex + 1], 10)
      if (!isNaN(hours) && hours > 0) {
        options.olderThanHours = hours
        console.log(
          chalk.blue(`Will clean up test data older than ${hours} hours`)
        )
      }
    }
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

  const job = await queue.add(jobName, options, {
    removeOnComplete: { age: ONE_HOUR },
    removeOnFail: { age: ONE_DAY }
  })

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
      chalk.bold('nx run api-journeys-modern:serve'),
      'or',
      chalk.bold('nf start')
    )
  )

  if (process.env.NODE_ENV !== 'test') process.exit(0)
}

// avoid running on test environment
if (process.env.NODE_ENV !== 'test') void cli()

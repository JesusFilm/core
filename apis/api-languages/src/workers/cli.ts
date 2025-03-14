import { Queue } from 'bullmq'
import chalk from 'chalk'

import { connection } from './lib/connection'

const ONE_HOUR = 3600
const ONE_DAY = 86_400

export async function cli(argv = process.argv): Promise<void> {
  let queue: Queue, jobName: string, queueName: string

  switch (argv[2]) {
    case 'big-query': {
      const config = await import(
        /* webpackChunkName: "big-query" */
        './bigQuery'
      )
      queueName = config.queueName
      jobName = config.jobName
      queue = new Queue(queueName, { connection })
      break
    }
    case 'algolia': {
      const config = await import(
        /* webpackChunkName: "algolia" */
        './algolia'
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
    case 'data-import': {
      const config = await import(
        /* webpackChunkName: "data-import" */
        './dataImport'
      )
      queueName = config.queueName
      jobName = config.jobName
      queue = new Queue(queueName, { connection })

      // Check if a file path was provided
      if (argv.length < 4) {
        console.error(chalk.red('Error: Missing file path for data import'))
        console.error(
          chalk.yellow(
            'Usage: nx run api-languages:cli -- data-import <file-path.tar.gz> [--clear]'
          )
        )
        process.exit(1)
      }

      // Add file path to job data
      const filePath = argv[3]

      // Validate file extension
      if (!filePath.endsWith('.tar.gz')) {
        console.error(chalk.red('Error: File must be a .tar.gz archive'))
        console.error(
          chalk.yellow(
            'Usage: nx run api-languages:cli -- data-import <file-path.tar.gz> [--clear]'
          )
        )
        process.exit(1)
      }

      const clearExistingData = argv.includes('--clear')

      const jobs = await queue.getJobs()
      for (const job of jobs) {
        if (
          job.name === jobName &&
          job.id != null &&
          !(await job.isDelayed())
        ) {
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
        { filePath, clearExistingData },
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
          chalk.bold('nx run api-languages:serve'),
          'or',
          chalk.bold('nf start')
        )
      )

      if (process.env.NODE_ENV !== 'test') process.exit(0)
      return
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
      chalk.bold('nx run api-languages:serve'),
      'or',
      chalk.bold('nf start')
    )
  )
  if (process.env.NODE_ENV !== 'test') process.exit(0)
}

// avoid running on test environment
if (process.env.NODE_ENV !== 'test') void cli()

import chalk from 'chalk'

export async function cli(argv = process.argv): Promise<void> {
  let serviceFunction: () => Promise<void>

  switch (argv[2]) {
    case 'crowdin': {
      const config = await import(
        /* webpackChunkName: "crowdin" */
        './crowdin'
      )
      serviceFunction = () => config.service()
      break
    }
    case 'populate-crowdin-ids': {
      const config = await import(
        /* webpackChunkName: "populate-crowdin-ids" */
        './crowdin/importers/populateCrowdinIds'
      )
      serviceFunction = () => config.service()
      break
    }
    default:
      throw new Error('unknown worker')
  }

  console.log(chalk.cyan('Running worker:'), chalk.bold(argv[2]))

  try {
    await serviceFunction()
    console.log(chalk.greenBright('✔'), 'Worker completed successfully')
  } catch (error) {
    console.error(chalk.red('✗'), 'Worker failed:', error)
    if (process.env.NODE_ENV !== 'test') process.exit(1)
  }

  if (process.env.NODE_ENV !== 'test') process.exit(0)
}

// avoid running on test environment
if (process.env.NODE_ENV !== 'test') void cli()

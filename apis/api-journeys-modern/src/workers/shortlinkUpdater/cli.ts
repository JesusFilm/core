#!/usr/bin/env node
import chalk from 'chalk'

import { logger } from '../../logger'

import { updateAllShortlinks } from './service'

async function run(): Promise<void> {
  try {
    console.log(chalk.blue('🔍 Checking and updating all shortlinks...'))
    const count = await updateAllShortlinks(logger)
    console.log(chalk.green(`✅ Successfully updated ${count} shortlinks`))
    process.exit(0)
  } catch (error) {
    console.log(
      chalk.red(
        `❌ Error: ${error instanceof Error ? error.message : String(error)}`
      )
    )
    process.exit(1)
  }
}

// Execute program
if (process.env.NODE_ENV !== 'test') {
  void run()
}

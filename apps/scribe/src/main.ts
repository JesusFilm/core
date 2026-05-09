#!/usr/bin/env node
import { render } from 'ink'
import { createElement } from 'react'

import { Command } from 'commander'

import { clearCredential } from './config/credentials'
import {
  type EnvironmentId,
  isEnvironmentId
} from './config/environments'
import { Root } from './repl/Root'

interface CommandOptions {
  environment?: string
  forceLogin?: boolean
  model?: string
}

async function main(): Promise<void> {
  const program = new Command()

  program
    .name('scribe')
    .description(
      'Interactive Claude-driven CLI for operating on the Core platform.'
    )
    .option(
      '-e, --environment <id>',
      'Skip the environment picker and go straight to dev, stage, or prod.'
    )
    .option(
      '--force-login',
      'Ignore any cached credential and run the browser login flow.',
      false
    )
    .option(
      '--model <id>',
      'Override the Claude model used by the agent. Defaults to the SDK default.'
    )
    .action(async (options: CommandOptions) => {
      const envId = parseEnvOption(options.environment)
      const instance = render(
        createElement(Root, {
          initialEnvId: envId,
          forceLogin: options.forceLogin,
          model: options.model
        })
      )
      await instance.waitUntilExit()
    })

  program
    .command('logout')
    .description('Forget the cached credential for an environment.')
    .requiredOption(
      '-e, --environment <id>',
      'Environment to log out of (dev, stage, prod).'
    )
    .action((options: { environment: string }) => {
      const envId = parseEnvOption(options.environment)
      if (envId == null) {
        throw new Error(
          `Unknown environment "${options.environment}". Expected dev, stage, or prod.`
        )
      }
      clearCredential(envId)
      console.log(`Cleared credential for ${envId}.`)
    })

  await program.parseAsync(process.argv)
}

function parseEnvOption(value: string | undefined): EnvironmentId | undefined {
  if (value == null) return undefined
  if (!isEnvironmentId(value)) {
    throw new Error(
      `Unknown environment "${value}". Expected one of: dev, stage, prod.`
    )
  }
  return value
}

main().catch((error: unknown) => {
  if (error instanceof Error) {
    console.error(`scribe: ${error.message}`)
  } else {
    console.error('scribe: unknown error')
  }
  process.exit(1)
})

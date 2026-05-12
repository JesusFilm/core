#!/usr/bin/env node
import { Command } from 'commander'
import { render } from 'ink'
import { createElement } from 'react'

import {
  PROVIDER_METAS,
  getProviderMeta,
  isProviderId,
  isProviderReady
} from './agents/registry'
import { clearCredential } from './config/credentials'
import {
  type EnvironmentId,
  isEnvironmentId
} from './config/environments'
import {
  type ApiProviderId,
  type ProviderId,
  clearProviderCredential,
  loadActiveProvider
} from './config/providers'
import { Root } from './repl/Root'

interface CommandOptions {
  environment?: string
  forceLogin?: boolean
  model?: string
  provider?: string
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
      'Override the model used by the agent. Defaults to the provider default.'
    )
    .option(
      '--provider <id>',
      `Agent backend to use (${PROVIDER_METAS.map((p) => p.id).join(', ')}). Defaults to the last-used provider, or claude-code.`
    )
    .action(async (options: CommandOptions) => {
      const envId = parseEnvOption(options.environment)
      const provider = resolveInitialProvider(options.provider)
      const instance = render(
        createElement(Root, {
          initialEnvId: envId,
          forceLogin: options.forceLogin,
          model: options.model,
          initialProvider: provider
        })
      )
      await instance.waitUntilExit()
    })

  program
    .command('logout')
    .description(
      'Forget a cached credential — either an environment (Firebase) or a provider (API key).'
    )
    .option(
      '-e, --environment <id>',
      'Environment to log out of (dev, stage, prod).'
    )
    .option(
      '--provider <id>',
      `Provider to forget (${PROVIDER_METAS.filter((p) => p.needsCredential)
        .map((p) => p.id)
        .join(', ')}).`
    )
    .action((options: { environment?: string; provider?: string }) => {
      const hasEnv = options.environment != null
      const hasProvider = options.provider != null
      if (!hasEnv && !hasProvider) {
        throw new Error(
          'Pass --environment <id> or --provider <id> to specify what to forget.'
        )
      }
      if (hasEnv) {
        const envId = parseEnvOption(options.environment)
        if (envId == null) {
          throw new Error(
            `Unknown environment "${options.environment}". Expected dev, stage, or prod.`
          )
        }
        clearCredential(envId)
        console.log(`Cleared credential for ${envId}.`)
      }
      if (hasProvider) {
        const providerId = options.provider as string
        if (!isProviderId(providerId)) {
          const available = PROVIDER_METAS.map((p) => p.id).join(', ')
          throw new Error(
            `Unknown provider "${providerId}". Expected one of: ${available}.`
          )
        }
        if (providerId === 'claude-code') {
          throw new Error(
            'claude-code uses Claude Code\'s own credentials and stores nothing in scribe — there is nothing to forget.'
          )
        }
        clearProviderCredential(providerId as ApiProviderId)
        console.log(`Cleared credential for provider ${providerId}.`)
      }
    })

  await program.parseAsync(process.argv)
}

function resolveInitialProvider(flagValue: string | undefined): ProviderId {
  if (flagValue != null) {
    if (!isProviderId(flagValue)) {
      const available = PROVIDER_METAS.map((p) => p.id).join(', ')
      throw new Error(
        `Unknown provider "${flagValue}". Expected one of: ${available}.`
      )
    }
    if (!isProviderReady(flagValue)) {
      const meta = getProviderMeta(flagValue)
      console.warn(
        `[scribe] ${meta.label} is selected but has no stored credential. Run /provider in the REPL to configure it.`
      )
    }
    return flagValue
  }
  const stored = loadActiveProvider()
  if (stored != null && isProviderId(stored)) return stored
  return 'claude-code'
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

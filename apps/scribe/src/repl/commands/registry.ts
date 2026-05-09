import { clearCredential } from '../../config/credentials'
import {
  isEnvironmentId,
  listEnvironments
} from '../../config/environments'

import type { SlashCommand } from './types'

const envCommand: SlashCommand = {
  name: 'env',
  argHint: '<dev|stage|prod>',
  description: 'Switch to a different Core environment.',
  async run(args, ctx) {
    const target = args[0]
    if (target == null) {
      const list = listEnvironments()
        .map((env) => `  ${env.id} — ${env.label}`)
        .join('\n')
      ctx.appendSystemMessage(
        `Pass an environment id. Available:\n${list}`,
        'info'
      )
      return
    }
    if (!isEnvironmentId(target)) {
      ctx.appendSystemMessage(
        `Unknown environment "${target}". Expected dev, stage, or prod.`,
        'error'
      )
      return
    }
    if (target === ctx.session.environment.id) {
      ctx.appendSystemMessage(
        `Already on ${ctx.session.environment.label}.`,
        'info'
      )
      return
    }
    await ctx.switchEnvironment(target)
  }
}

const loginCommand: SlashCommand = {
  name: 'login',
  description:
    'Force a fresh browser sign-in for the current environment.',
  async run(_args, ctx) {
    await ctx.forceLogin()
  }
}

const logoutCommand: SlashCommand = {
  name: 'logout',
  description: 'Clear the cached credential for the current environment and exit.',
  run(_args, ctx) {
    clearCredential(ctx.session.environment.id)
    ctx.appendSystemMessage(
      `Cleared credential for ${ctx.session.environment.id}. Goodbye.`,
      'info'
    )
    ctx.exit()
  }
}

const clearCommand: SlashCommand = {
  name: 'clear',
  description: 'Clear the transcript and start a fresh agent session.',
  run(_args, ctx) {
    ctx.clearTranscript()
  }
}

const helpCommand: SlashCommand = {
  name: 'help',
  description: 'Show available slash commands.',
  run(_args, ctx) {
    const lines = COMMANDS.map(
      (cmd) =>
        `  /${cmd.name}${cmd.argHint != null ? ` ${cmd.argHint}` : ''} — ${cmd.description}`
    )
    ctx.appendSystemMessage(`Slash commands:\n${lines.join('\n')}`, 'info')
  }
}

const exitCommand: SlashCommand = {
  name: 'exit',
  description: 'Exit scribe.',
  run(_args, ctx) {
    ctx.exit()
  }
}

export const COMMANDS: SlashCommand[] = [
  envCommand,
  loginCommand,
  logoutCommand,
  clearCommand,
  helpCommand,
  exitCommand
]

export function findCommand(name: string): SlashCommand | undefined {
  return COMMANDS.find((cmd) => cmd.name === name)
}

export function filterCommands(prefix: string): SlashCommand[] {
  if (prefix.length === 0) return COMMANDS
  const lower = prefix.toLowerCase()
  return COMMANDS.filter((cmd) => cmd.name.startsWith(lower))
}

import { clearCredential } from '../../config/credentials'
import {
  isEnvironmentId,
  listEnvironments
} from '../../config/environments'
import { findJourneyByQuery } from '../components/JourneyPicker'
import { findSelectionByName } from '../components/TeamPicker'

import type { CommandContext, SlashCommand } from './types'

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
    const lines = COMMANDS.filter((cmd) => isCommandAvailable(cmd, ctx)).map(
      (cmd) =>
        `  /${cmd.name}${cmd.argHint != null ? ` ${cmd.argHint}` : ''} — ${cmd.description}`
    )
    ctx.appendSystemMessage(`Slash commands:\n${lines.join('\n')}`, 'info')
  }
}

const teamCommand: SlashCommand = {
  name: 'team',
  argHint: '[name | shared]',
  description: 'Pick which team scribe is working in (or "shared with me").',
  run(args, ctx) {
    if (args.length === 0) {
      ctx.openTeamPicker()
      return
    }
    if (ctx.teams.status === 'loading') {
      ctx.appendSystemMessage('Teams are still loading. Try again in a sec.', 'info')
      return
    }
    if (ctx.teams.status === 'error') {
      ctx.appendSystemMessage(
        `Cannot select a team — load failed: ${ctx.teams.message}. Run /team to retry.`,
        'error'
      )
      ctx.refreshTeams()
      return
    }
    if (ctx.teams.status === 'idle') {
      ctx.appendSystemMessage(
        'No teams loaded yet. Open the picker with /team.',
        'info'
      )
      ctx.refreshTeams()
      return
    }
    const phrase = args.join(' ')
    const selection = findSelectionByName(ctx.teams.teams, phrase)
    if (selection == null) {
      ctx.appendSystemMessage(
        `No team matched "${phrase}". Run /team to see the list.`,
        'error'
      )
      return
    }
    ctx.setActiveTeam(selection)
  }
}

const impersonateCommand: SlashCommand = {
  name: 'impersonate',
  argHint: '<email>',
  description: 'Run as another user (superadmin only).',
  isAvailable(ctx) {
    return ctx.me?.superAdmin === true
  },
  async run(args, ctx) {
    const email = args.join(' ').trim()
    if (email.length === 0) {
      ctx.appendSystemMessage(
        'Pass an email: /impersonate someone@example.com',
        'info'
      )
      return
    }
    if (!email.includes('@')) {
      ctx.appendSystemMessage(
        `"${email}" doesn\'t look like an email address.`,
        'error'
      )
      return
    }
    await ctx.startImpersonation(email)
  }
}

const stopImpersonateCommand: SlashCommand = {
  name: 'stop-impersonate',
  description: 'Return to your own session and stop impersonating.',
  isAvailable(ctx) {
    return ctx.impersonating != null
  },
  run(_args, ctx) {
    ctx.stopImpersonation()
  }
}

const journeyCommand: SlashCommand = {
  name: 'journey',
  argHint: '[id|slug|title]',
  description: 'Pick which journey scribe is working on within the active team.',
  run(args, ctx) {
    if (args.length === 0) {
      ctx.openJourneyPicker()
      return
    }
    if (ctx.journeys.status === 'loading') {
      ctx.appendSystemMessage(
        'Journeys are still loading. Try again in a sec.',
        'info'
      )
      return
    }
    if (ctx.journeys.status === 'error') {
      ctx.appendSystemMessage(
        `Cannot select a journey — load failed: ${ctx.journeys.message}. Run /journey to retry.`,
        'error'
      )
      ctx.refreshJourneys()
      return
    }
    if (ctx.journeys.status === 'idle') {
      ctx.appendSystemMessage(
        'No journeys loaded yet. Open the picker with /journey.',
        'info'
      )
      ctx.refreshJourneys()
      return
    }
    const phrase = args.join(' ')
    const match = findJourneyByQuery(ctx.journeys.journeys, phrase)
    if (match == null) {
      ctx.appendSystemMessage(
        `No journey matched "${phrase}". Run /journey to see the list.`,
        'error'
      )
      return
    }
    ctx.setActiveJourney(match)
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
  teamCommand,
  journeyCommand,
  impersonateCommand,
  stopImpersonateCommand,
  loginCommand,
  logoutCommand,
  clearCommand,
  helpCommand,
  exitCommand
]

export function findCommand(name: string): SlashCommand | undefined {
  return COMMANDS.find((cmd) => cmd.name === name)
}

export function isCommandAvailable(
  cmd: SlashCommand,
  ctx: CommandContext | null
): boolean {
  if (cmd.isAvailable == null) return true
  if (ctx == null) return true // before context is wired, show everything
  return cmd.isAvailable(ctx)
}

export function filterCommands(
  prefix: string,
  context: CommandContext | null = null
): SlashCommand[] {
  const available = COMMANDS.filter((cmd) => isCommandAvailable(cmd, context))
  if (prefix.length === 0) return available
  const lower = prefix.toLowerCase()
  return available.filter((cmd) => cmd.name.startsWith(lower))
}

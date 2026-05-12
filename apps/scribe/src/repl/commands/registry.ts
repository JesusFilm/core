import { clearCredential } from '../../config/credentials'
import {
  isEnvironmentId,
  listEnvironments
} from '../../config/environments'
import { collectBlocks, findBlockByQuery } from '../components/BlockPicker'
import { findCardByQuery } from '../components/CardPicker'
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
      // Always refetch when the user opens the picker — they may have
      // created, duplicated, or translated a journey since the list was
      // last loaded.
      ctx.refreshJourneys()
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

const cardCommand: SlashCommand = {
  name: 'card',
  argHint: '[id|heading]',
  description: 'Pick which card within the active journey scribe is focused on.',
  isAvailable(ctx) {
    return ctx.activeJourney != null
  },
  run(args, ctx) {
    if (ctx.activeJourney == null) {
      ctx.appendSystemMessage(
        'No active journey. Pick one with /journey before selecting a card.',
        'info'
      )
      return
    }
    if (args.length === 0) {
      ctx.refreshCards()
      ctx.openCardPicker()
      return
    }
    if (ctx.cards.status === 'loading') {
      ctx.appendSystemMessage(
        'Cards are still loading. Try again in a sec.',
        'info'
      )
      return
    }
    if (ctx.cards.status === 'error') {
      ctx.appendSystemMessage(
        `Cannot select a card — load failed: ${ctx.cards.message}. Run /card to retry.`,
        'error'
      )
      ctx.refreshCards()
      return
    }
    if (ctx.cards.status === 'idle') {
      ctx.appendSystemMessage(
        'No cards loaded yet. Open the picker with /card.',
        'info'
      )
      ctx.refreshCards()
      return
    }
    const phrase = args.join(' ')
    const match = findCardByQuery(ctx.cards.cards, phrase)
    if (match == null) {
      ctx.appendSystemMessage(
        `No card matched "${phrase}". Run /card to see the list.`,
        'error'
      )
      return
    }
    ctx.setActiveCard(match)
  }
}

const blockCommand: SlashCommand = {
  name: 'block',
  argHint: '[heading|text|button|poll|image|backgroundImage|video]',
  description:
    'Focus on a specific content block within the active card (heading, text, button, etc.).',
  isAvailable(ctx) {
    return ctx.activeCard != null
  },
  run(args, ctx) {
    if (ctx.activeCard == null) {
      ctx.appendSystemMessage(
        'No active card. Pick one with /card before selecting a block.',
        'info'
      )
      return
    }
    if (args.length === 0) {
      ctx.openBlockPicker()
      return
    }
    const phrase = args.join(' ')
    const match = findBlockByQuery(ctx.activeCard, phrase)
    if (match == null) {
      const available = collectBlocks(ctx.activeCard)
        .map((entry) => entry.kind)
        .join(', ')
      ctx.appendSystemMessage(
        available.length === 0
          ? `Card ${ctx.activeCard.id} has no content blocks to pick.`
          : `No block matched "${phrase}". Available on this card: ${available}.`,
        'error'
      )
      return
    }
    ctx.setActiveBlock(match)
  }
}

const translateCommand: SlashCommand = {
  name: 'translate',
  argHint: '[id|slug|title]',
  description:
    'Translate a journey to another language. Asks duplicate vs in-place, then picks a target language.',
  run(args, ctx) {
    const phrase = args.join(' ').trim()

    if (phrase.length === 0) {
      if (ctx.activeJourney == null) {
        ctx.appendSystemMessage(
          'No active journey. Pass an id/slug/title: /translate <journey>, or pick one with /journey first.',
          'info'
        )
        return
      }
      submitTranslatePrompt(ctx, ctx.activeJourney.id, ctx.activeJourney.title)
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
        `Cannot translate — journey load failed: ${ctx.journeys.message}. Run /journey to retry.`,
        'error'
      )
      ctx.refreshJourneys()
      return
    }
    if (ctx.journeys.status === 'idle') {
      ctx.appendSystemMessage(
        'No journeys loaded yet. Open the picker with /journey first.',
        'info'
      )
      ctx.refreshJourneys()
      return
    }

    const match = findJourneyByQuery(ctx.journeys.journeys, phrase)
    if (match == null) {
      // Not in the team's list — hand the raw phrase to the agent and let
      // it resolve via resolve_journey (covers journeys outside the active
      // team that the user has access to).
      submitTranslatePrompt(ctx, phrase, phrase)
      return
    }
    submitTranslatePrompt(ctx, match.id, match.title)
  }
}

function submitTranslatePrompt(
  ctx: CommandContext,
  idOrSlug: string,
  label: string
): void {
  ctx.submitPrompt(
    `Translate the journey "${label}" (id-or-slug: ${idOrSlug}).\n\n` +
      `Follow the translate workflow in your system prompt:\n` +
      `1. Resolve the journey via resolve_journey if you only have a slug or partial reference, and report the title back.\n` +
      `2. Ask me whether to translate IN PLACE (overwrites the original) or DUPLICATE FIRST (translated copy in the active team). Wait for my answer.\n` +
      `3. Ask me which target language to translate to. Use list_supported_languages to show the available options if I haven't named one.\n` +
      `4. If I picked duplicate, call duplicate_journey to make the copy and use its id; otherwise use the original id.\n` +
      `5. Call translate_journey with the source language name from resolve_journey and the target language from list_supported_languages.\n` +
      `6. Report the resulting journey id, slug, and the new language.`
  )
}

const modelCommand: SlashCommand = {
  name: 'model',
  argHint: '[alias|model-id|default]',
  description:
    'Switch the Claude model. Pick from a list, or pass an alias/ID directly.',
  run(args, ctx) {
    if (args.length === 0) {
      ctx.openModelPicker()
      return
    }
    const target = args.join(' ').trim()
    if (target === 'default' || target === 'inherit') {
      if (ctx.model == null) {
        ctx.appendSystemMessage('Already on the SDK default model.', 'info')
        return
      }
      ctx.setModel(null)
      return
    }
    if (target === ctx.model) {
      ctx.appendSystemMessage(`Already on model "${target}".`, 'info')
      return
    }
    ctx.setModel(target)
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
  cardCommand,
  blockCommand,
  translateCommand,
  modelCommand,
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

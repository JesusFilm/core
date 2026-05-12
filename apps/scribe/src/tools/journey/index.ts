import { tool } from '@anthropic-ai/claude-agent-sdk'
import { z } from 'zod'

import type { ActiveSession } from '../../auth/login'
import { GraphQLRequestError } from '../../graphql/client'
import type { TeamSelection } from '../../repl/state/types'

import {
  aiTranslateJourney,
  applyJourneySimpleUpdate,
  createJourney,
  duplicateJourney,
  fetchJourneySimple,
  fetchLanguagesByIds,
  resolveJourneyByIdOrSlug
} from './api'
import { diffJourney } from './diffJourney'
import { SUPPORTED_LANGUAGE_IDS } from './supportedLanguages'
import type { JourneySimple } from './types'
import { validateJourney } from './validateJourney'

const journeySimpleSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    cards: z.array(z.record(z.string(), z.unknown()))
  })
  .passthrough()

function formatGraphqlError(error: unknown): string {
  if (error instanceof GraphQLRequestError) {
    return `GraphQL error (HTTP ${error.status}): ${error.message}`
  }
  if (error instanceof Error) return error.message
  return 'Unknown error'
}

function jsonResult(payload: unknown): {
  content: Array<{ type: 'text'; text: string }>
} {
  return {
    content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }]
  }
}

function errorResult(message: string): {
  content: Array<{ type: 'text'; text: string }>
  isError: true
} {
  return {
    content: [{ type: 'text', text: message }],
    isError: true
  }
}

export function buildJourneyTools(
  session: ActiveSession,
  activeTeam: TeamSelection | null
) {
  return [
    tool(
      'create_journey',
      'Create a new, empty journey shell in the active team via journeyCreate. Returns the new journey id, title, and slug. Use this BEFORE update_journey when scaffolding a journey from scratch. Requires an active team (the user must have run /team and selected a real team — the "Shared with me" pseudo-team is not a valid target).',
      {
        title: z
          .string()
          .min(1)
          .describe('Title for the new journey. Must not be empty.'),
        description: z
          .string()
          .optional()
          .describe(
            'Optional internal description (audience, topic, traffic source). Only editors see this.'
          ),
        themeMode: z
          .enum(['light', 'dark'])
          .optional()
          .describe('Theme mode. Defaults to `dark`.')
      },
      async ({ title, description, themeMode }) => {
        if (activeTeam == null) {
          return errorResult(
            'No active team is set. Ask the user to run /team and pick a team before creating a journey.'
          )
        }
        if (activeTeam.kind !== 'team') {
          return errorResult(
            'The active selection is "Shared with me", which is not a real team. Ask the user to /team and pick a real team before creating a journey.'
          )
        }
        try {
          const result = await createJourney(session, {
            title,
            description,
            themeMode,
            teamId: activeTeam.team.id
          })
          return jsonResult(result)
        } catch (error) {
          return errorResult(formatGraphqlError(error))
        }
      }
    ),
    tool(
      'resolve_journey',
      'Resolve a journey by id (UUID) or slug. Returns the journey id, title, and slug. Use this first when the user provides a slug rather than an id.',
      {
        idOrSlug: z
          .string()
          .min(1)
          .describe('Journey id (UUID) or slug.')
      },
      async ({ idOrSlug }) => {
        try {
          const journey = await resolveJourneyByIdOrSlug(session, idOrSlug)
          return jsonResult(journey)
        } catch (error) {
          return errorResult(formatGraphqlError(error))
        }
      }
    ),
    tool(
      'fetch_journey',
      'Fetch a journey in JourneySimple form via journeySimpleGet. The id must be a UUID; resolve a slug with resolve_journey first.',
      {
        id: z.string().min(1).describe('Journey UUID.')
      },
      async ({ id }) => {
        try {
          const journey = await fetchJourneySimple(session, id)
          return jsonResult(journey)
        } catch (error) {
          return errorResult(formatGraphqlError(error))
        }
      }
    ),
    tool(
      'validate_journey',
      'Run the offline structural validator over a JourneySimple document. Detects deterministic issues (duplicate ids, broken navigation, dead ends, video-card schema violations, unreachable cards). Pass the journey JSON inline.',
      {
        journey: journeySimpleSchema.describe(
          'JourneySimple document to validate.'
        )
      },
      async ({ journey }) => {
        const result = validateJourney(journey)
        return jsonResult(result)
      }
    ),
    tool(
      'diff_journey',
      'Compare two JourneySimple documents. Returns added/removed cards and per-card field changes. Use to show the user the exact change set before applying an update.',
      {
        before: journeySimpleSchema,
        after: journeySimpleSchema
      },
      async ({ before, after }) => {
        const diff = diffJourney(
          before as unknown as JourneySimple,
          after as unknown as JourneySimple
        )
        return jsonResult(diff)
      }
    ),
    tool(
      'update_journey',
      'Apply a JourneySimple update via journeySimpleUpdate. The mutation enforces server-side validation and ACL. Only call this AFTER the user has explicitly approved the change set surfaced by diff_journey.',
      {
        id: z.string().min(1).describe('Journey UUID.'),
        journey: journeySimpleSchema.describe(
          'Full JourneySimple document to write.'
        )
      },
      async ({ id, journey }) => {
        try {
          const result = await applyJourneySimpleUpdate(
            session,
            id,
            journey as unknown as JourneySimple
          )
          return jsonResult(result)
        } catch (error) {
          return errorResult(formatGraphqlError(error))
        }
      }
    ),
    tool(
      'list_supported_languages',
      'List the languages accepted by translate_journey. Returns each language\'s database id, native name (e.g. "Português"), and English name (e.g. "Portuguese"). Use this to map a user-provided language phrase ("Spanish", "Brazilian Portuguese") onto a textLanguageId.',
      {},
      async () => {
        try {
          const languages = await fetchLanguagesByIds(session, [
            ...SUPPORTED_LANGUAGE_IDS
          ])
          return jsonResult({ languages })
        } catch (error) {
          return errorResult(formatGraphqlError(error))
        }
      }
    ),
    tool(
      'duplicate_journey',
      'Duplicate a journey into the active team via journeyDuplicate. Returns the new journey id, title, and slug. Requires an active real team (not "Shared with me"). Use this before translate_journey when the user wants a translated COPY rather than overwriting the source.',
      {
        id: z.string().min(1).describe('Journey UUID to duplicate.'),
        duplicateAsDraft: z
          .boolean()
          .optional()
          .describe('Optional. When true, the copy starts in draft status.')
      },
      async ({ id, duplicateAsDraft }) => {
        if (activeTeam == null) {
          return errorResult(
            'No active team is set. Ask the user to run /team and pick a team before duplicating a journey.'
          )
        }
        if (activeTeam.kind !== 'team') {
          return errorResult(
            'The active selection is "Shared with me", which is not a real team. Ask the user to /team and pick a real team before duplicating a journey.'
          )
        }
        try {
          const result = await duplicateJourney(session, {
            id,
            teamId: activeTeam.team.id,
            duplicateAsDraft
          })
          return jsonResult(result)
        } catch (error) {
          return errorResult(formatGraphqlError(error))
        }
      }
    ),
    tool(
      'translate_journey',
      'Translate a journey IN PLACE via journeyAiTranslateCreate. The mutation rewrites the target journey\'s title, description, and block text in the target language and updates its languageId. To produce a translated COPY instead, call duplicate_journey first and pass the duplicate\'s id here. Server enforces ACL.',
      {
        journeyId: z
          .string()
          .min(1)
          .describe(
            'Journey UUID to write the translation into. Pass a duplicated journey id for "translate as copy"; pass the original id for "translate in place".'
          ),
        name: z
          .string()
          .min(1)
          .describe(
            'The journey title to translate. Usually the current title of the target journey.'
          ),
        journeyLanguageName: z
          .string()
          .min(1)
          .describe(
            'Source language name (e.g. "English"). Read it from resolve_journey\'s language.englishName, or language.nativeName if englishName is missing.'
          ),
        textLanguageId: z
          .string()
          .min(1)
          .describe(
            'Target language database id (e.g. "21028"). Must come from list_supported_languages.'
          ),
        textLanguageName: z
          .string()
          .min(1)
          .describe(
            'Target language name (native preferred, e.g. "Español"). Use the nativeName from list_supported_languages.'
          )
      },
      async ({
        journeyId,
        name,
        journeyLanguageName,
        textLanguageId,
        textLanguageName
      }) => {
        try {
          const result = await aiTranslateJourney(session, {
            journeyId,
            name,
            journeyLanguageName,
            textLanguageId,
            textLanguageName
          })
          return jsonResult(result)
        } catch (error) {
          return errorResult(formatGraphqlError(error))
        }
      }
    )
  ]
}

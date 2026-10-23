import { Output, streamText } from 'ai'
import { GraphQLError } from 'graphql'
import { z } from 'zod'

import { Campaign, Prisma, prisma } from '@core/prisma/journeys/client'
import {
  AiRequestTimeoutError,
  createOpenrouterFallbackSession
} from '@core/shared/ai/openrouterModel'
import { hardenPrompt, preSystemPrompt } from '@core/shared/ai/prompts'
import { User } from '@core/yoga/firebaseClient'

import { env } from '../../../env'
import { logger } from '../../../logger'
import { builder } from '../../builder'
import { authorizeCampaign } from '../authorizeCampaign'
import { lockCampaign, touchCampaign } from '../block/service'
import { CampaignRef } from '../campaign'
import { type CampaignMachineTranslateModeValue } from '../enums'
import { badUserInput, conflict } from '../errors'
import { fetchLanguageName } from '../gatewayClient'
import { TranslationsJson, parseTranslations } from '../translatedValue'

import { CampaignMachineTranslateInput } from './inputs'
import { CAMPAIGN_TEXT_FIELD_VALUES, translationsColumn } from './textFields'
import {
  CampaignTranslationRowShape,
  INCLUDE_TRANSLATIONS_CAMPAIGN,
  campaignTranslationRows
} from './translationRows'
import {
  TranslationRunLock,
  acquireTranslationRunLock
} from './translationRunLock'
import { TRANSLATION_TARGETS, TranslationTargetKind } from './translationTarget'

interface CampaignMachineTranslateProgress {
  progress: number
  message: string
  translatedCount: number
  campaign: Campaign | null
}

// Machine translation in code; the schema name `CampaignAiTranslateProgress` is frozen for journeys-admin.
const CampaignMachineTranslateProgressRef =
  builder.objectRef<CampaignMachineTranslateProgress>(
    'CampaignAiTranslateProgress'
  )

builder.objectType(CampaignMachineTranslateProgressRef, {
  description:
    'One progress report of a machine-translation run; `campaign` is present only on the final report.',
  fields: (t) => ({
    progress: t.float({
      description: 'Translation progress as a percentage (0-100)',
      resolve: (parent) => parent.progress
    }),
    message: t.string({
      description: 'Current translation step message',
      resolve: (parent) => parent.message
    }),
    translatedCount: t.int({
      description:
        'How many strings the run has written so far; they are kept if the run is cancelled',
      resolve: (parent) => parent.translatedCount
    }),
    campaign: t.prismaField({
      type: CampaignRef,
      nullable: true,
      description:
        'The campaign with its translations written (only present when complete)',
      resolve: async (query, parent) =>
        parent.campaign == null
          ? null
          : await prisma.campaign.findUnique({
              ...query,
              where: { id: parent.campaign.id }
            })
    })
  })
})

const TRANSLATION_SYSTEM_PROMPT = `${preSystemPrompt}

You are a professional translator for campaign landing pages: headings, short paragraphs, button labels, region names and interface strings.
- Translate accurately while being culturally appropriate for the target language
- Keep button labels and interface strings concise and natural
- Never exceed the maximum length shown for a line
- Preserve all {{variable}} template syntax exactly as-is — never translate content inside {{ }}
- For Bible passages, use an established translation in the target language — never translate scripture yourself. If none is identified, use the most popular English Bible translation.
- DO NOT translate proper nouns
- Set uncertain to true only when you had to guess: the source is ambiguous without more context, an idiom or term has several reasonable renderings, or a proper noun might be a word. Otherwise false. Most lines should be false.`

const CampaignTextTranslationSchema = z.object({
  targetId: z
    .string()
    .describe('The id shown in square brackets for the line, unchanged'),
  field: z
    .enum(CAMPAIGN_TEXT_FIELD_VALUES)
    .describe('The field name shown for the line, unchanged'),
  value: z.string().describe('The line translated into the target language'),
  uncertain: z
    .boolean()
    .describe(
      'true only when the translation is a guess a person should check; false when confident'
    )
})

/** What the model gave for one line. */
interface MachineTranslation {
  value: string
  uncertain: boolean
}

interface TranslationBatch {
  label: string
  rows: CampaignTranslationRowShape[]
}

function rowKey(targetId: string, field: string): string {
  return `${targetId}:${field}`
}

/** The page section a block sits in: its topmost ancestor, or itself. */
function sectionIdOf(
  blockId: string,
  parentOf: Map<string, string | null>
): string {
  let current = blockId
  for (
    let parent = parentOf.get(current);
    parent != null && parentOf.has(parent);
    parent = parentOf.get(current)
  )
    current = parent
  return current
}

/**
 * The rows to translate, in the Translations view's order, split into the
 * batches that each get one stream: one per landing or Region Page section
 * (its extras with it), one for the interface (the campaign title, every
 * Campaign String and the header and footer text), one for every Region's
 * name and Region Lines. `missing` asks only for rows with no entry; `all`
 * also asks for the machine's, never for a person's.
 */
export function translationBatches(
  rows: CampaignTranslationRowShape[],
  parentOf: Map<string, string | null>,
  mode: CampaignMachineTranslateModeValue
): TranslationBatch[] {
  const batches = new Map<string, TranslationBatch>()
  for (const row of rows) {
    if (row.source === 'human' || (mode === 'missing' && row.source != null))
      continue
    const key =
      row.group === 'landing' || row.group === 'region'
        ? `section:${sectionIdOf(row.target.id, parentOf)}`
        : row.group
    const batch = batches.get(key) ?? { label: key, rows: [] }
    batch.rows.push(row)
    batches.set(key, batch)
  }
  return [...batches.values()]
}

function describeRow(row: CampaignTranslationRowShape): string {
  return `[${row.target.id}] ${row.field} (max ${row.maxLength} characters): ${row.defaultValue}`
}

/** Output longer than a field's cap is cut to the cap, not failed. */
function withinCap(
  value: string,
  cap: number,
  context: { targetId: string; field: string }
): string {
  const characters = [...value]
  if (characters.length <= cap) return value
  logger.warn(
    { ...context, length: characters.length, cap },
    'Translated text exceeds the field cap and was truncated'
  )
  return characters.slice(0, cap).join('').trim()
}

/**
 * Lock the batch's target rows in the default-language swap's order: blocks,
 * regions, then strings, each by id, then the campaign row. Block edits and
 * `campaignTranslationSet` lock their one row and then the campaign, so no
 * order of these writers can deadlock.
 */
async function lockBatchTargets(
  tx: Prisma.TransactionClient,
  campaignId: string,
  targetIds: Map<string, TranslationTargetKind>
): Promise<void> {
  for (const kind of ['block', 'region', 'string'] as const) {
    const ids = [...targetIds]
      .filter(([, targetKind]) => targetKind === kind)
      .map(([id]) => id)
    if (ids.length > 0) await TRANSLATION_TARGETS[kind].lock(tx, ids)
  }
  await lockCampaign(tx, campaignId)
}

/**
 * Write the batch's machine translations as `{ value, source: machine }`
 * (`uncertain: true` on a line the model flagged as a guess) into
 * `<field>Translations[languageId]`. The targets and the campaign are locked
 * and each target re-read under the lock, so nothing a person wrote, or
 * another language's entry, since the run began is lost: `missing` only
 * fills an absent entry, `all` replaces `machine` entries, and neither
 * touches a `human` one. When the language has since become the default or
 * left the campaign, the batch writes nothing.
 */
async function writeBatch({
  campaignId,
  languageId,
  mode,
  batch,
  translated
}: {
  campaignId: string
  languageId: string
  mode: CampaignMachineTranslateModeValue
  batch: TranslationBatch
  translated: Map<string, MachineTranslation>
}): Promise<number> {
  const rowsByTarget = new Map<string, CampaignTranslationRowShape[]>()
  for (const row of batch.rows) {
    if (!translated.has(rowKey(row.target.id, row.field))) continue
    const rows = rowsByTarget.get(row.target.id) ?? []
    rows.push(row)
    rowsByTarget.set(row.target.id, rows)
  }
  if (rowsByTarget.size === 0) return 0

  const kinds = new Map(
    [...rowsByTarget].map(([targetId, rows]) => [targetId, rows[0].target.kind])
  )
  return await prisma.$transaction(async (tx) => {
    await lockBatchTargets(tx, campaignId, kinds)
    const campaign = await tx.campaign.findUnique({
      where: { id: campaignId },
      select: { defaultLanguageId: true, languages: true }
    })
    if (
      campaign == null ||
      campaign.defaultLanguageId === languageId ||
      !campaign.languages.some((language) => language.languageId === languageId)
    ) {
      logger.warn(
        { campaignId, languageId, batch: batch.label },
        'Language is no longer a non-default campaign language; batch skipped'
      )
      return 0
    }

    let written = 0
    for (const [targetId, rows] of rowsByTarget) {
      const model =
        TRANSLATION_TARGETS[kinds.get(targetId) as TranslationTargetKind]
      const record = await model.find(tx, targetId)
      if (record == null) continue

      const data: Record<string, TranslationsJson> = {}
      for (const row of rows) {
        const column = translationsColumn(row.field)
        const json = data[column] ?? parseTranslations(record[column])
        const existing = json[languageId]
        const hasEntry = existing != null && existing.value !== ''
        if (hasEntry && (mode === 'missing' || existing.source === 'human'))
          continue
        const machine = translated.get(
          rowKey(targetId, row.field)
        ) as MachineTranslation
        json[languageId] = {
          value: withinCap(machine.value, row.maxLength, {
            targetId,
            field: row.field
          }),
          source: 'machine',
          ...(machine.uncertain ? { uncertain: true } : {})
        }
        data[column] = json
        written++
      }
      if (Object.keys(data).length > 0) await model.update(tx, targetId, data)
    }
    if (written > 0) await touchCampaign(tx, campaignId)
    return written
  })
}

async function translateBatch({
  batch,
  sourceLanguageName,
  targetLanguageName,
  campaignTitle,
  session,
  cancelSignal
}: {
  batch: TranslationBatch
  sourceLanguageName: string
  targetLanguageName: string
  campaignTitle: string
  session: ReturnType<typeof createOpenrouterFallbackSession>
  cancelSignal?: AbortSignal
}): Promise<Map<string, MachineTranslation>> {
  const requested = new Set(
    batch.rows.map((row) => rowKey(row.target.id, row.field))
  )
  const translated = new Map<string, MachineTranslation>()
  const prompt = `Campaign: ${hardenPrompt(campaignTitle)}

Translate from ${hardenPrompt(sourceLanguageName)} to ${hardenPrompt(targetLanguageName)}.

Lines to translate (use the EXACT ID shown in square brackets as targetId and the field name shown as field):
${hardenPrompt(batch.rows.map(describeRow).join('\n'))}

Return exactly one entry for every line listed above — do not skip, merge, or invent lines.`

  await session.execute(async (model, abortSignal) => {
    let streamError: unknown
    const { elementStream } = streamText({
      model,
      abortSignal:
        cancelSignal == null
          ? abortSignal
          : AbortSignal.any([abortSignal, cancelSignal]),
      maxRetries: 0,
      instructions: TRANSLATION_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }],
      output: Output.array({ element: CampaignTextTranslationSchema }),
      onError: ({ error }) => {
        streamError = error
        logger.warn(
          { error, batch: batch.label },
          'Error in translation stream'
        )
      }
    })

    for await (const item of elementStream) {
      const targetId = item.targetId.replace(/^\[|\]$/g, '')
      const key = rowKey(targetId, item.field)
      if (!requested.has(key) || item.value.trim() === '') continue
      translated.set(key, {
        value: item.value.trim(),
        uncertain: item.uncertain === true
      })
    }

    // The AI SDK reports stream failures to onError and ends the stream, which
    // silently truncates the array. Re-throw so a fallback-eligible error
    // advances the session to the next model.
    if (streamError != null && translated.size < requested.size)
      throw streamError
  })
  return translated
}

/**
 * `cancelSignal` aborts when the caller disconnects (its Cancel). A generator's
 * `return()` only lands at a `yield`, so without the signal the batch being
 * translated would still finish its model call and write after the caller left.
 * With it, an in-flight model call is aborted and nothing more is written.
 */
export async function* campaignMachineTranslate(
  input: {
    campaignId: string | number
    languageId: string | number
    mode: CampaignMachineTranslateModeValue
  },
  user: User,
  cancelSignal?: AbortSignal
): AsyncGenerator<CampaignMachineTranslateProgress> {
  let runLock: TranslationRunLock | null = null
  try {
    // Load-bearing despite the `User` type: the builder does not set
    // `scopeAuth.authorizeOnSubscribe`, so `withAuth({ isAuthenticated })`
    // guards only each event's `resolve`, not `subscribe`. An anonymous
    // subscription reaches this generator with no user, and without this
    // check it would start a run before any event is refused.
    if (user == null)
      throw new GraphQLError('Not authenticated', {
        extensions: { code: 'UNAUTHENTICATED' }
      })

    let translatedCount = 0
    yield {
      progress: 0,
      message: 'Starting translation...',
      translatedCount,
      campaign: null
    }

    const campaignId = String(input.campaignId)
    const languageId = String(input.languageId)
    const campaign = await authorizeCampaign(
      campaignId,
      'update',
      user,
      INCLUDE_TRANSLATIONS_CAMPAIGN
    )
    if (
      languageId === campaign.defaultLanguageId ||
      !campaign.languages.some((language) => language.languageId === languageId)
    )
      throw badUserInput(
        'languageId must be a campaign language other than the default',
        'languageId'
      )

    const [sourceLanguageName, targetLanguageName] = await Promise.all([
      fetchLanguageName(campaign.defaultLanguageId),
      fetchLanguageName(languageId)
    ])
    if (sourceLanguageName == null || targetLanguageName == null)
      throw badUserInput(
        'languageId must be an existing language',
        'languageId'
      )

    try {
      runLock = await acquireTranslationRunLock(campaignId, languageId)
    } catch (error) {
      logger.error(
        { error, campaignId, languageId },
        'Translation run lock unavailable'
      )
      throw new GraphQLError(
        'Translation is temporarily unavailable. Please try again.'
      )
    }
    if (runLock == null)
      throw conflict(
        'a translation into this language is already running',
        'languageId'
      )

    const parentOf = new Map(
      campaign.blocks.map((block) => [block.id, block.parentBlockId])
    )
    const batches = translationBatches(
      campaignTranslationRows(campaign, languageId),
      parentOf,
      input.mode
    )

    yield {
      progress: 10,
      message: `Translating into ${targetLanguageName}...`,
      translatedCount,
      campaign: null
    }

    const session = createOpenrouterFallbackSession(env.TRANSLATION_AI_MODELS)
    let failedBatches = 0
    const disconnected = (): boolean => cancelSignal?.aborted === true
    for (const [index, batch] of batches.entries()) {
      if (disconnected()) return
      try {
        const translated = await translateBatch({
          batch,
          sourceLanguageName,
          targetLanguageName,
          campaignTitle: campaign.title,
          session,
          cancelSignal
        })
        if (disconnected()) return
        translatedCount += await writeBatch({
          campaignId,
          languageId,
          mode: input.mode,
          batch,
          translated
        })
      } catch (error) {
        if (disconnected()) return
        failedBatches++
        logger.warn(
          { error, campaignId, languageId, batch: batch.label },
          'Campaign translation batch failed'
        )
      }
      await runLock.extend()
      yield {
        progress: 10 + ((index + 1) / batches.length) * 85,
        message: `Translated ${index + 1} of ${batches.length} parts`,
        translatedCount,
        campaign: null
      }
    }
    if (batches.length > 0 && failedBatches === batches.length)
      throw new GraphQLError('Translation failed')

    yield {
      progress: 95,
      message: 'Finalizing translation...',
      translatedCount,
      campaign: null
    }
    yield {
      progress: 100,
      message: 'Translation completed!',
      translatedCount,
      campaign: await prisma.campaign.findUnique({ where: { id: campaignId } })
    }
  } catch (error) {
    logger.error({ error }, 'Campaign translation error')
    if (error instanceof GraphQLError) throw error
    if (error instanceof AiRequestTimeoutError)
      throw new GraphQLError(
        'Translation timed out while contacting the AI service. Please try again.'
      )
    throw new GraphQLError('Translation failed')
  } finally {
    await runLock?.release()
  }
}

// Machine translation in code; the schema name `campaignAiTranslateSubscription` is frozen for journeys-admin.
builder.subscriptionField('campaignAiTranslateSubscription', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    description:
      'Machine-translate a campaign into one of its languages, a batch at a time, reporting progress after each. `missing` writes `{ value, source: machine }` only where the language has no entry; `all` also replaces machine entries. A person’s entries are never touched. Output longer than a field’s cap is cut to the cap.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: campaign does not resolve.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `languageId`): not a campaign language other than the default, or not an api-languages language.\n- CONFLICT (field: `languageId`): another run into the same campaign language is in flight.\n- `Translation is temporarily unavailable. Please try again.` (no code): the one-run check could not reach Redis; nothing is translated.',
    type: CampaignMachineTranslateProgressRef,
    nullable: false,
    args: {
      input: t.arg({ type: CampaignMachineTranslateInput, required: true })
    },
    subscribe: (_root, { input }, context) =>
      campaignMachineTranslate(
        input,
        context.user,
        (context as { request?: { signal?: AbortSignal } }).request?.signal
      ),
    resolve: (progressUpdate) => progressUpdate
  })
)

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
import { touchCampaign } from '../block/service'
import { CampaignRef } from '../campaign'
import { Action, campaignAcl } from '../campaign.acl'
import { fetchLanguageName } from '../gatewayClient'
import { TranslationsJson } from '../translatedValue'
import { badUserInput } from '../validation'

import {
  CAMPAIGN_TEXT_FIELD_VALUES,
  translationsColumn
} from './campaignTextField'
import {
  CampaignTranslationRowShape,
  INCLUDE_TRANSLATIONS_CAMPAIGN,
  campaignTranslationRows
} from './campaignTranslations.query'
import { CampaignAiTranslateInput } from './inputs'

type CampaignAiTranslateMode = 'all' | 'missing'

interface CampaignAiTranslateProgress {
  progress: number
  message: string
  campaign: Campaign | null
}

const CampaignAiTranslateProgressRef =
  builder.objectRef<CampaignAiTranslateProgress>('CampaignAiTranslateProgress')

builder.objectType(CampaignAiTranslateProgressRef, {
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
- DO NOT translate proper nouns`

const CampaignTextTranslationSchema = z.object({
  targetId: z
    .string()
    .describe('The id shown in square brackets for the line, unchanged'),
  field: z
    .enum(CAMPAIGN_TEXT_FIELD_VALUES)
    .describe('The field name shown for the line, unchanged'),
  value: z.string().describe('The line translated into the target language')
})

interface TranslationBatch {
  label: string
  rows: CampaignTranslationRowShape[]
}

function targetIdOf(row: CampaignTranslationRowShape): string {
  const { blockId, regionId, stringId, campaignId } = row.target
  return (blockId ?? regionId ?? stringId ?? campaignId) as string
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
  mode: CampaignAiTranslateMode
): TranslationBatch[] {
  const batches = new Map<string, TranslationBatch>()
  for (const row of rows) {
    if (row.source === 'human' || (mode === 'missing' && row.source != null))
      continue
    const key =
      row.group === 'landing' || row.group === 'region'
        ? `section:${sectionIdOf(row.target.blockId as string, parentOf)}`
        : row.group
    const batch = batches.get(key) ?? { label: key, rows: [] }
    batch.rows.push(row)
    batches.set(key, batch)
  }
  return [...batches.values()]
}

function describeRow(row: CampaignTranslationRowShape): string {
  return `[${targetIdOf(row)}] ${row.field} (max ${row.maxLength} characters): ${row.defaultValue}`
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

type TargetKind = 'block' | 'region' | 'string' | 'campaign'

function kindOf(row: CampaignTranslationRowShape): TargetKind {
  if (row.target.blockId != null) return 'block'
  if (row.target.regionId != null) return 'region'
  if (row.target.stringId != null) return 'string'
  return 'campaign'
}

async function readTarget(
  tx: Prisma.TransactionClient,
  kind: TargetKind,
  id: string
): Promise<Record<string, unknown> | null> {
  switch (kind) {
    case 'block':
      return await tx.campaignBlock.findFirst({
        where: { id, deletedAt: null }
      })
    case 'region':
      return await tx.campaignRegion.findUnique({ where: { id } })
    case 'string':
      return await tx.campaignString.findUnique({ where: { id } })
    case 'campaign':
      return await tx.campaign.findUnique({ where: { id } })
  }
}

async function writeTarget(
  tx: Prisma.TransactionClient,
  kind: TargetKind,
  id: string,
  data: Record<string, TranslationsJson>
): Promise<void> {
  switch (kind) {
    case 'block':
      await tx.campaignBlock.update({ where: { id }, data })
      break
    case 'region':
      await tx.campaignRegion.update({ where: { id }, data })
      break
    case 'string':
      await tx.campaignString.update({ where: { id }, data })
      break
    case 'campaign':
      await tx.campaign.update({ where: { id }, data })
      break
  }
}

function currentTranslations(value: unknown): TranslationsJson {
  return value != null && typeof value === 'object' && !Array.isArray(value)
    ? { ...(value as TranslationsJson) }
    : {}
}

/**
 * Write the batch's machine translations as `{ value, source: machine }` into
 * `<field>Translations[languageId]`. Each target is re-read inside the
 * transaction so nothing a person wrote, or another language's entry, since
 * the run began is lost: `missing` only fills an absent entry, `all` replaces
 * `machine` entries, and neither touches a `human` one.
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
  mode: CampaignAiTranslateMode
  batch: TranslationBatch
  translated: Map<string, string>
}): Promise<number> {
  const rowsByTarget = new Map<string, CampaignTranslationRowShape[]>()
  for (const row of batch.rows) {
    if (!translated.has(rowKey(targetIdOf(row), row.field))) continue
    const rows = rowsByTarget.get(targetIdOf(row)) ?? []
    rows.push(row)
    rowsByTarget.set(targetIdOf(row), rows)
  }
  if (rowsByTarget.size === 0) return 0

  return await prisma.$transaction(async (tx) => {
    let written = 0
    for (const [targetId, rows] of rowsByTarget) {
      const kind = kindOf(rows[0])
      const record = await readTarget(tx, kind, targetId)
      if (record == null) continue

      const data: Record<string, TranslationsJson> = {}
      for (const row of rows) {
        const column = translationsColumn(row.field)
        const json = data[column] ?? currentTranslations(record[column])
        const existing = json[languageId]
        const hasEntry = existing != null && existing.value !== ''
        if (hasEntry && (mode === 'missing' || existing.source === 'human'))
          continue
        json[languageId] = {
          value: withinCap(
            translated.get(rowKey(targetId, row.field)) as string,
            row.maxLength,
            { targetId, field: row.field }
          ),
          source: 'machine'
        }
        data[column] = json
        written++
      }
      if (Object.keys(data).length > 0)
        await writeTarget(tx, kind, targetId, data)
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
  session
}: {
  batch: TranslationBatch
  sourceLanguageName: string
  targetLanguageName: string
  campaignTitle: string
  session: ReturnType<typeof createOpenrouterFallbackSession>
}): Promise<Map<string, string>> {
  const requested = new Set(
    batch.rows.map((row) => rowKey(targetIdOf(row), row.field))
  )
  const translated = new Map<string, string>()
  const prompt = `Campaign: ${hardenPrompt(campaignTitle)}

Translate from ${hardenPrompt(sourceLanguageName)} to ${hardenPrompt(targetLanguageName)}.

Lines to translate (use the EXACT ID shown in square brackets as targetId and the field name shown as field):
${hardenPrompt(batch.rows.map(describeRow).join('\n'))}

Return exactly one entry for every line listed above — do not skip, merge, or invent lines.`

  await session.execute(async (model, abortSignal) => {
    let streamError: unknown
    const { elementStream } = streamText({
      model,
      abortSignal,
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
      translated.set(key, item.value.trim())
    }

    // The AI SDK reports stream failures to onError and ends the stream, which
    // silently truncates the array. Re-throw so a fallback-eligible error
    // advances the session to the next model.
    if (streamError != null && translated.size < requested.size)
      throw streamError
  })
  return translated
}

export async function* campaignAiTranslate(
  input: {
    campaignId: string | number
    languageId: string | number
    mode: CampaignAiTranslateMode
  },
  user: User
): AsyncGenerator<CampaignAiTranslateProgress> {
  try {
    if (user == null)
      throw new GraphQLError('Not authenticated', {
        extensions: { code: 'UNAUTHENTICATED' }
      })

    yield { progress: 0, message: 'Starting translation...', campaign: null }

    const campaignId = String(input.campaignId)
    const languageId = String(input.languageId)
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: INCLUDE_TRANSLATIONS_CAMPAIGN
    })
    if (campaign == null)
      throw new GraphQLError('campaign not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (!campaignAcl(Action.Update, campaign, user))
      throw new GraphQLError('user is not allowed to update campaign', {
        extensions: { code: 'FORBIDDEN' }
      })
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
      campaign: null
    }

    const session = createOpenrouterFallbackSession(env.TRANSLATION_AI_MODELS)
    let failedBatches = 0
    for (const [index, batch] of batches.entries()) {
      try {
        const translated = await translateBatch({
          batch,
          sourceLanguageName,
          targetLanguageName,
          campaignTitle: campaign.title,
          session
        })
        await writeBatch({
          campaignId,
          languageId,
          mode: input.mode,
          batch,
          translated
        })
      } catch (error) {
        failedBatches++
        logger.warn(
          { error, campaignId, languageId, batch: batch.label },
          'Campaign translation batch failed'
        )
      }
      yield {
        progress: 10 + ((index + 1) / batches.length) * 85,
        message: `Translated ${index + 1} of ${batches.length} parts`,
        campaign: null
      }
    }
    if (batches.length > 0 && failedBatches === batches.length)
      throw new GraphQLError('Translation failed')

    yield { progress: 95, message: 'Finalizing translation...', campaign: null }
    yield {
      progress: 100,
      message: 'Translation completed!',
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
  }
}

builder.subscriptionField('campaignAiTranslateSubscription', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    description:
      'Machine-translate a campaign into one of its languages, a batch at a time, reporting progress after each. `missing` writes `{ value, source: machine }` only where the language has no entry; `all` also replaces machine entries. A person’s entries are never touched. Output longer than a field’s cap is cut to the cap.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: campaign does not resolve.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `languageId`): not a campaign language other than the default, or not an api-languages language.',
    type: CampaignAiTranslateProgressRef,
    nullable: false,
    args: {
      input: t.arg({ type: CampaignAiTranslateInput, required: true })
    },
    subscribe: (_root, { input }, context) =>
      campaignAiTranslate(input, context.user),
    resolve: (progressUpdate) => progressUpdate
  })
)

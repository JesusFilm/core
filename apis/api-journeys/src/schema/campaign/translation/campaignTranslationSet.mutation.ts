import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@core/prisma/journeys/client'
import { User } from '@core/yoga/firebaseClient'

import { builder } from '../../builder'
import { touchCampaign } from '../block/service'
import {
  Action,
  CampaignAclSubject,
  INCLUDE_CAMPAIGN_ACL,
  campaignAcl
} from '../campaign.acl'
import {
  TranslatedValueRef,
  TranslatedValueShape,
  TranslationsJson,
  toTranslatedValues
} from '../translatedValue'
import { assertLength, badUserInput } from '../validation'

import {
  CAMPAIGN_BLOCK_TEXT_FIELDS,
  CAMPAIGN_REGION_TEXT_FIELDS,
  CAMPAIGN_STRING_TEXT_FIELDS,
  CAMPAIGN_TITLE_TEXT_FIELDS,
  CampaignTextFieldCaps,
  CampaignTextFieldName,
  translationsColumn
} from './campaignTextField'
import { CampaignTranslationSetInput } from './inputs'

type TranslationTargetKind = 'block' | 'region' | 'string' | 'campaign'

interface TranslationTarget {
  kind: TranslationTargetKind
  id: string
  campaign: CampaignAclSubject & {
    id: string
    defaultLanguageId: string
    languages: Array<{ languageId: string }>
  }
  /** The target's translatable fields and their caps. */
  caps: CampaignTextFieldCaps
}

const INCLUDE_TARGET_CAMPAIGN = {
  ...INCLUDE_CAMPAIGN_ACL,
  languages: true
} satisfies Prisma.CampaignInclude

function notFound(message: string): GraphQLError {
  return new GraphQLError(message, { extensions: { code: 'NOT_FOUND' } })
}

interface TargetIds {
  blockId?: string | number | null
  regionId?: string | number | null
  stringId?: string | number | null
  campaignId?: string | number | null
}

/** Exactly one of the four target ids, else `BAD_USER_INPUT` / `target`. */
export function pickTranslationTarget(target: TargetIds): {
  kind: TranslationTargetKind
  id: string
} {
  const given = (
    [
      ['block', target.blockId],
      ['region', target.regionId],
      ['string', target.stringId],
      ['campaign', target.campaignId]
    ] as const
  ).filter(([, id]) => id != null)
  if (given.length !== 1)
    throw badUserInput(
      'target must name exactly one of blockId, regionId, stringId or campaignId',
      'target'
    )
  const [kind, id] = given[0]
  return { kind, id: String(id) }
}

async function loadTarget(
  kind: TranslationTargetKind,
  id: string
): Promise<TranslationTarget> {
  switch (kind) {
    case 'block': {
      const block = await prisma.campaignBlock.findFirst({
        where: { id, deletedAt: null },
        include: { campaign: { include: INCLUDE_TARGET_CAMPAIGN } }
      })
      if (block == null) throw notFound('block not found')
      return {
        kind,
        id,
        campaign: block.campaign,
        caps: CAMPAIGN_BLOCK_TEXT_FIELDS[block.typename] ?? {}
      }
    }
    case 'region': {
      const region = await prisma.campaignRegion.findUnique({
        where: { id },
        include: { campaign: { include: INCLUDE_TARGET_CAMPAIGN } }
      })
      if (region == null) throw notFound('region not found')
      return {
        kind,
        id,
        campaign: region.campaign,
        caps: CAMPAIGN_REGION_TEXT_FIELDS
      }
    }
    case 'string': {
      const string = await prisma.campaignString.findUnique({
        where: { id },
        include: { campaign: { include: INCLUDE_TARGET_CAMPAIGN } }
      })
      if (string == null) throw notFound('string not found')
      return {
        kind,
        id,
        campaign: string.campaign,
        caps: CAMPAIGN_STRING_TEXT_FIELDS
      }
    }
    case 'campaign': {
      const campaign = await prisma.campaign.findUnique({
        where: { id },
        include: INCLUDE_TARGET_CAMPAIGN
      })
      if (campaign == null) throw notFound('campaign not found')
      return {
        kind,
        id,
        campaign,
        caps: CAMPAIGN_TITLE_TEXT_FIELDS
      }
    }
  }
}

/**
 * The next `<field>Translations` JSON: `value` as a human entry for
 * `languageId`, or the entry removed when `value` is empty.
 */
export function withTranslation(
  current: unknown,
  languageId: string,
  value: string
): TranslationsJson {
  const json: TranslationsJson =
    current != null && typeof current === 'object' && !Array.isArray(current)
      ? { ...(current as TranslationsJson) }
      : {}
  if (value === '') {
    delete json[languageId]
    return json
  }
  json[languageId] = { value, source: 'human' }
  return json
}

/**
 * Lock the target row, read its current `<column>` JSON and write the merged
 * entry back in one transaction. The read happens under the lock, not in
 * `loadTarget`, so two writes to the same field in different languages
 * serialize instead of overwriting each other's JSON.
 */
async function writeTranslation(
  target: TranslationTarget,
  column: string,
  languageId: string,
  value: string
): Promise<TranslationsJson> {
  return await prisma.$transaction(async (tx) => {
    const select = { [column]: true }
    let current: Record<string, unknown> | null
    switch (target.kind) {
      case 'block':
        await tx.$queryRaw`SELECT 1 FROM "CampaignBlock" WHERE id = ${target.id} FOR UPDATE`
        current = await tx.campaignBlock.findUnique({
          where: { id: target.id },
          select
        })
        break
      case 'region':
        await tx.$queryRaw`SELECT 1 FROM "CampaignRegion" WHERE id = ${target.id} FOR UPDATE`
        current = await tx.campaignRegion.findUnique({
          where: { id: target.id },
          select
        })
        break
      case 'string':
        await tx.$queryRaw`SELECT 1 FROM "CampaignString" WHERE id = ${target.id} FOR UPDATE`
        current = await tx.campaignString.findUnique({
          where: { id: target.id },
          select
        })
        break
      case 'campaign':
        await tx.$queryRaw`SELECT 1 FROM "Campaign" WHERE id = ${target.id} FOR UPDATE`
        current = await tx.campaign.findUnique({
          where: { id: target.id },
          select
        })
        break
    }
    if (current == null) throw notFound(`${target.kind} not found`)
    const json = withTranslation(current[column], languageId, value)
    const data = { [column]: json }
    switch (target.kind) {
      case 'block':
        await tx.campaignBlock.update({ where: { id: target.id }, data })
        break
      case 'region':
        await tx.campaignRegion.update({ where: { id: target.id }, data })
        break
      case 'string':
        await tx.campaignString.update({ where: { id: target.id }, data })
        break
      case 'campaign':
        await tx.campaign.update({ where: { id: target.id }, data })
        break
    }
    if (target.kind !== 'campaign') await touchCampaign(tx, target.campaign.id)
    return json
  })
}

export async function setCampaignTranslation(
  input: {
    target: TargetIds
    field: CampaignTextFieldName
    languageId: string | number
    value: string
  },
  user: User
): Promise<TranslatedValueShape[]> {
  const { kind, id } = pickTranslationTarget(input.target)
  const target = await loadTarget(kind, id)
  if (!campaignAcl(Action.Update, target.campaign, user))
    throw new GraphQLError('user is not allowed to update campaign', {
      extensions: { code: 'FORBIDDEN' }
    })

  const cap = target.caps[input.field]
  if (cap == null)
    throw badUserInput(
      `field ${input.field} is not a translatable field of this target`,
      'field'
    )

  const languageId = String(input.languageId)
  if (
    !target.campaign.languages.some(
      (language) => language.languageId === languageId
    )
  )
    throw badUserInput(
      'languageId must be one of the campaign languages',
      'languageId'
    )
  if (languageId === target.campaign.defaultLanguageId)
    throw badUserInput(
      'languageId must not be the default language; edit the field itself instead',
      'languageId'
    )

  const value = assertLength(input.value, input.field, cap)
  const column = translationsColumn(input.field)
  const json = await writeTranslation(target, column, languageId, value)
  return toTranslatedValues(json)
}

builder.mutationField('campaignTranslationSet', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    description:
      'Write one translation of one Translated Field: `{ value, source: human }` into the target’s `<field>Translations[languageId]`, or clear that entry when `value` is empty. The default-language value is the field itself and is edited through the target’s typed update mutation. Returns the field’s translations after the write.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: the target row does not exist or is not live.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `target`): not exactly one target id.\n- BAD_USER_INPUT (field: `field`): the target has no such translatable field.\n- BAD_USER_INPUT (field: `languageId`): not a campaign language, or the default language.\n- BAD_USER_INPUT (field: the text field): over the field’s cap.',
    type: [TranslatedValueRef],
    nullable: false,
    args: {
      input: t.arg({ type: CampaignTranslationSetInput, required: true })
    },
    resolve: async (_parent, { input }, context) =>
      await setCampaignTranslation(input, context.user)
  })
)

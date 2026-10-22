import { prisma } from '@core/prisma/journeys/client'
import { User } from '@core/yoga/firebaseClient'

import { Action } from '../../../lib/auth/ability'
import { builder } from '../../builder'
import { lockCampaign, touchCampaign } from '../block/service'
import { CampaignAclSubject, campaignAcl } from '../campaign.acl'
import { badUserInput, forbidden, notFound } from '../errors'
import {
  TranslatedValueRef,
  TranslatedValueShape,
  TranslationsJson,
  parseTranslations,
  toTranslatedValues
} from '../translatedValue'
import { assertLength } from '../validation'

import { CampaignTranslationSetInput } from './inputs'
import {
  CampaignTextFieldCaps,
  CampaignTextFieldName,
  translationsColumn
} from './textFields'
import { TRANSLATION_TARGETS, TranslationTargetKind } from './translationTarget'

/** Which row a translation is written to; the GraphQL input's four ids become this once, in the resolver. */
interface TranslationTargetRef {
  kind: TranslationTargetKind
  id: string
}

interface TranslationTarget extends TranslationTargetRef {
  campaign: CampaignAclSubject & {
    id: string
    defaultLanguageId: string
    languages: Array<{ languageId: string }>
  }
  /** The target's translatable fields and their caps. */
  caps: CampaignTextFieldCaps
}

interface TargetIds {
  blockId?: string | number | null
  regionId?: string | number | null
  stringId?: string | number | null
  campaignId?: string | number | null
}

/** Exactly one of the four target ids, else `BAD_USER_INPUT` / `target`. */
export function pickTranslationTarget(target: TargetIds): TranslationTargetRef {
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

async function loadTarget({
  kind,
  id
}: TranslationTargetRef): Promise<TranslationTarget> {
  const model = TRANSLATION_TARGETS[kind]
  const found = await model.findWithCampaign(prisma, id)
  if (found == null) throw notFound(`${kind} not found`)
  return { kind, id, campaign: found.campaign, caps: model.caps(found.row) }
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
  const json = parseTranslations(current)
  if (value === '') {
    delete json[languageId]
    return json
  }
  json[languageId] = { value, source: 'human' }
  return json
}

/**
 * Refuse `languageId` unless it is a campaign language other than the
 * default: `BAD_USER_INPUT`, field `languageId`.
 */
function assertTranslationLanguage(
  campaign: {
    defaultLanguageId: string
    languages: Array<{ languageId: string }>
  },
  languageId: string
): void {
  if (
    !campaign.languages.some((language) => language.languageId === languageId)
  )
    throw badUserInput(
      'languageId must be one of the campaign languages',
      'languageId'
    )
  if (languageId === campaign.defaultLanguageId)
    throw badUserInput(
      'languageId must not be the default language; edit the field itself instead',
      'languageId'
    )
}

/**
 * Lock the target row, read its current `<column>` JSON and write the merged
 * entry back in one transaction. The read happens under the lock, not in
 * `loadTarget`, so two writes to the same field in different languages
 * serialize instead of overwriting each other's JSON. The campaign row is
 * then locked (after the target row, the order the default-language swap and
 * block edits take) and the language checked again, so a swap that made
 * `languageId` the default, or a removal of the language, while this write
 * waited is refused rather than leaving an entry under the default.
 */
async function writeTranslation(
  target: TranslationTarget,
  column: string,
  languageId: string,
  value: string
): Promise<TranslationsJson> {
  return await prisma.$transaction(async (tx) => {
    const model = TRANSLATION_TARGETS[target.kind]
    await model.lock(tx, [target.id])
    const current = await model.select(tx, target.id, { [column]: true })
    if (current == null) throw notFound(`${target.kind} not found`)
    await lockCampaign(tx, target.campaign.id)
    const campaign = await tx.campaign.findUnique({
      where: { id: target.campaign.id },
      select: { defaultLanguageId: true, languages: true }
    })
    if (campaign == null) throw notFound('campaign not found')
    assertTranslationLanguage(campaign, languageId)
    const json = withTranslation(current[column], languageId, value)
    await model.update(tx, target.id, { [column]: json })
    if (target.kind !== 'campaign') await touchCampaign(tx, target.campaign.id)
    return json
  })
}

export async function setCampaignTranslation(
  input: {
    target: TranslationTargetRef
    field: CampaignTextFieldName
    languageId: string | number
    value: string
  },
  user: User
): Promise<TranslatedValueShape[]> {
  const target = await loadTarget(input.target)
  if (!campaignAcl(Action.Update, target.campaign, user))
    throw forbidden('user is not allowed to update campaign')

  const cap = target.caps[input.field]
  if (cap == null)
    throw badUserInput(
      `field ${input.field} is not a translatable field of this target`,
      'field'
    )

  const languageId = String(input.languageId)
  assertTranslationLanguage(target.campaign, languageId)

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
      await setCampaignTranslation(
        { ...input, target: pickTranslationTarget(input.target) },
        context.user
      )
  })
)

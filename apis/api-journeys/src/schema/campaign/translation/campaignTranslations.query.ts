import { builder } from '../../builder'
import { authorizeCampaign } from '../campaign.acl'
import {
  CampaignTextField,
  CampaignTextSource,
  CampaignTranslationFilter,
  type CampaignTranslationFilterValue,
  CampaignTranslationGroup
} from '../enums'
import { badUserInput } from '../errors'

import {
  CampaignTranslationRowShape,
  CampaignTranslationTargetShape,
  INCLUDE_TRANSLATIONS_CAMPAIGN,
  campaignTranslationRows
} from './translationRows'
import { TranslationTargetKind } from './translationTarget'

/** The target's id under the input field `kind` names, the shape `campaignTranslationSet` takes. */
function idOfKind(
  target: CampaignTranslationTargetShape,
  kind: TranslationTargetKind
): string | null {
  return target.kind === kind ? target.id : null
}

const CampaignTranslationTargetRef =
  builder.objectRef<CampaignTranslationTargetShape>('CampaignTranslationTarget')

builder.objectType(CampaignTranslationTargetRef, {
  description:
    'The row a Translated Field belongs to, in the shape `campaignTranslationSet` takes: exactly one of `blockId`, `regionId`, `stringId` or `campaignId` is set.',
  fields: (t) => ({
    typename: t.exposeString('typename', {
      nullable: false,
      description:
        'The block typename (`CampaignHeroBlock`, …), or `CampaignRegion`, `CampaignString` or `Campaign`.'
    }),
    blockId: t.id({
      nullable: true,
      resolve: (target) => idOfKind(target, 'block')
    }),
    regionId: t.id({
      nullable: true,
      resolve: (target) => idOfKind(target, 'region')
    }),
    stringId: t.id({
      nullable: true,
      resolve: (target) => idOfKind(target, 'string')
    }),
    campaignId: t.id({
      nullable: true,
      resolve: (target) => idOfKind(target, 'campaign')
    })
  })
})

const CampaignTranslationRowRef =
  builder.objectRef<CampaignTranslationRowShape>('CampaignTranslation')

builder.objectType(CampaignTranslationRowRef, {
  description:
    'One line of the Translations view: a Translated Field, its default-language text and its text in the requested language.',
  fields: (t) => ({
    target: t.field({
      type: CampaignTranslationTargetRef,
      nullable: false,
      resolve: (row) => row.target
    }),
    group: t.field({
      type: CampaignTranslationGroup,
      nullable: false,
      resolve: (row) => row.group
    }),
    field: t.field({
      type: CampaignTextField,
      nullable: false,
      resolve: (row) => row.field
    }),
    maxLength: t.exposeInt('maxLength', {
      nullable: false,
      description: 'The field’s cap on this target, in characters.'
    }),
    defaultValue: t.exposeString('defaultValue', {
      nullable: false,
      description: 'The text in the campaign’s default language.'
    }),
    value: t.exposeString('value', {
      nullable: true,
      description: 'The text in the requested language; null when missing.'
    }),
    source: t.field({
      type: CampaignTextSource,
      nullable: true,
      description:
        'Who wrote `value`: a person (`human`) or the machine; null when missing.',
      resolve: (row) => row.source
    }),
    needsReview: t.exposeBoolean('needsReview', {
      nullable: false,
      description:
        'The machine wrote `value` and was not sure of it: the line a person should check first. False for a person’s text, a confident machine line and a missing one.'
    })
  })
})

export function matchesTranslationFilter(
  row: Pick<CampaignTranslationRowShape, 'source' | 'needsReview'>,
  filter: CampaignTranslationFilterValue
): boolean {
  switch (filter) {
    case 'all':
      return true
    case 'needsReview':
      return row.needsReview
    case 'edited':
      return row.source === 'human'
    case 'missing':
      return row.source == null
  }
}

builder.queryField('campaignTranslations', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    description:
      'The Translations view of one campaign language: every Translated Field that has default-language text, with its text in `languageId`. Each row says who wrote it (`source`) and whether the machine flagged its line as a guess (`needsReview`); the filters are `needsReview` (flagged machine lines), `edited` (a person’s) and `missing` (no entry). Rows come in the view’s order (Interface, Landing page, Region page, Regions); `group` names the section.\n\nAuth: campaign Read — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: campaign does not resolve.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `languageId`): not a campaign language, or the default language, whose text is the field itself.',
    type: [CampaignTranslationRowRef],
    nullable: false,
    args: {
      campaignId: t.arg({ type: 'ID', required: true }),
      languageId: t.arg({ type: 'ID', required: true }),
      filter: t.arg({
        type: CampaignTranslationFilter,
        required: false,
        defaultValue: 'all'
      })
    },
    resolve: async (_parent, args, context) => {
      const campaign = await authorizeCampaign(
        String(args.campaignId),
        'view',
        context.user,
        INCLUDE_TRANSLATIONS_CAMPAIGN
      )

      const languageId = String(args.languageId)
      if (
        languageId === campaign.defaultLanguageId ||
        !campaign.languages.some(
          (language) => language.languageId === languageId
        )
      )
        throw badUserInput(
          'languageId must be a campaign language other than the default',
          'languageId'
        )

      const filter = args.filter ?? 'all'
      return campaignTranslationRows(campaign, languageId).filter((row) =>
        matchesTranslationFilter(row, filter)
      )
    }
  })
)

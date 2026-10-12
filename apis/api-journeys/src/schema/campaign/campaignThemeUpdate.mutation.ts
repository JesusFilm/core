import { GraphQLError } from 'graphql'

import {
  CampaignButtonRadius,
  CampaignRadius,
  Prisma,
  ThemeMode,
  prisma
} from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { Action, INCLUDE_CAMPAIGN_ACL, campaignAcl } from './campaign.acl'
import { CampaignThemeRef } from './campaignTheme'
import { CampaignThemeUpdateInput } from './inputs'
import { PRESET_COLOR_COLUMNS } from './seed/presets'
import {
  assertEnum,
  assertFontFamily,
  assertHex,
  badUserInput
} from './validation'

const FONT_COLUMNS = ['headerFont', 'bodyFont', 'labelFont'] as const

type CampaignThemeUpdateArgs = {
  themeMode?: ThemeMode | null
  radius?: CampaignRadius | null
  buttonRadius?: CampaignButtonRadius | null
} & Partial<Record<(typeof PRESET_COLOR_COLUMNS)[number], string | null>> &
  Partial<Record<(typeof FONT_COLUMNS)[number], string | null>>

/** A non-null column: omitted leaves it alone, null is `BAD_USER_INPUT` on the column. */
function requiredColumn<T>(
  value: T | null | undefined,
  field: string
): T | undefined {
  if (value === undefined) return undefined
  if (value === null) throw badUserInput(`${field} is required`, field)
  return value
}

/**
 * Only the given columns are written (PRD §15): the eight colours through
 * `assertHex`, the three fonts against the shared curated list (null = the
 * default), the three enum columns against their enum's values.
 */
export function validateCampaignThemeInput(
  input: CampaignThemeUpdateArgs
): Prisma.CampaignThemeUpdateInput {
  const data: Prisma.CampaignThemeUpdateInput = {}
  const themeMode = requiredColumn(input.themeMode, 'themeMode')
  if (themeMode !== undefined)
    data.themeMode = assertEnum(
      themeMode,
      'themeMode',
      Object.values(ThemeMode)
    )
  for (const column of FONT_COLUMNS) {
    const value = input[column]
    if (value === undefined) continue
    data[column] = assertFontFamily(value, column)
  }
  for (const column of PRESET_COLOR_COLUMNS) {
    const value = requiredColumn(input[column], column)
    if (value === undefined) continue
    data[column] = assertHex(value, column)
  }
  const radius = requiredColumn(input.radius, 'radius')
  if (radius !== undefined)
    data.radius = assertEnum(radius, 'radius', Object.values(CampaignRadius))
  const buttonRadius = requiredColumn(input.buttonRadius, 'buttonRadius')
  if (buttonRadius !== undefined)
    data.buttonRadius = assertEnum(
      buttonRadius,
      'buttonRadius',
      Object.values(CampaignButtonRadius)
    )
  return data
}

builder.mutationField('campaignThemeUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      'Update the Campaign Theme: its mode, any of the three fonts, any of the eight colours, the corner radius or the button shape. Only the given columns change. Applying a Theme Preset is this mutation with the mode and the eight colours; fonts and both radii stay. Nothing records which preset is active. Each call is one Command in the editor; undo writes the previous values back through the same mutation.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to a Campaign Theme.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: the colour column): a colour is null, empty or not a hex colour.\n- BAD_USER_INPUT (field: `headerFont` / `bodyFont` / `labelFont`): a font name is not in the shared curated list.\n- BAD_USER_INPUT (field: `themeMode` / `radius` / `buttonRadius`): null, or not one of the enum’s values.',
    type: CampaignThemeRef,
    nullable: false,
    args: {
      id: t.arg({
        type: 'ID',
        required: true,
        description: 'The Campaign Theme id (`campaign.theme.id`).'
      }),
      input: t.arg({ type: CampaignThemeUpdateInput, required: true })
    },
    resolve: async (query, _parent, { id: rawId, input }, context) => {
      const id = String(rawId)
      const theme = await prisma.campaignTheme.findUnique({
        where: { id },
        include: { campaign: { include: INCLUDE_CAMPAIGN_ACL } }
      })
      if (theme == null)
        throw new GraphQLError('campaign theme not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      if (!campaignAcl(Action.Update, theme.campaign, context.user))
        throw new GraphQLError('user is not allowed to update campaign theme', {
          extensions: { code: 'FORBIDDEN' }
        })

      const data = validateCampaignThemeInput(input)
      return await prisma.campaignTheme.update({
        ...query,
        where: { id },
        data
      })
    }
  })
)

import { InMemoryCache, gql } from '@apollo/client'
import { ReactElement } from 'react'

import {
  GetCampaign_campaign_blocks as CampaignBlock,
  GetCampaign_campaign_theme as CampaignTheme
} from '../../../__generated__/GetCampaign'
import { CampaignThemeUpdateInput } from '../../../__generated__/globalTypes'
import { CAMPAIGN_PALETTE_UPDATE } from '../../libs/useCampaignPaletteUpdateMutation'
import {
  CampaignSectionStyleInput,
  CampaignStyledBlock,
  SECTION_STYLE_OPERATIONS,
  campaignSectionStyleRow
} from '../../libs/useCampaignSectionStyleMutation'
import { CAMPAIGN_THEME_UPDATE } from '../../libs/useCampaignThemeUpdateMutation'

import { useCampaignEditor } from './CampaignEditorProvider'
import { campaign } from './data'

export type StyleMock = {
  request: Record<string, unknown>
  result: ReturnType<typeof vi.fn>
  delay?: number
  maxUsageCount?: number
}

/** A mock for one section style write: the block's row with `input` applied. */
export function sectionStyleMock(
  block: CampaignStyledBlock,
  input: CampaignSectionStyleInput,
  current: CampaignSectionStyleInput = {}
): StyleMock {
  const { document, operation } = SECTION_STYLE_OPERATIONS[block.__typename]
  return {
    request: { query: document, variables: { id: block.id, input } },
    result: vi.fn(() => ({
      data: {
        [operation]: campaignSectionStyleRow({ ...block, ...current }, input)
      }
    }))
  }
}

/** A mock for the Palette save `nextPalette` produces for `palette`. */
export function paletteMock(palette: string[]): StyleMock {
  return {
    request: {
      query: CAMPAIGN_PALETTE_UPDATE,
      variables: { id: campaign.id, input: { palette } }
    },
    result: vi.fn(() => ({
      data: {
        campaignUpdate: { __typename: 'Campaign', id: campaign.id, palette }
      }
    }))
  }
}

const SECTION_STYLE = gql`
  fragment SectionStyle on CampaignSectionBlock {
    backgroundKind
    backgroundColor
    headingColor
    textColor
    buttonColor
    buttonTextColor
    accentColor
  }
`

/** The nine shared fields of a block as the cache currently holds them (optimistic layer included). */
export function readSectionStyle(
  cache: InMemoryCache,
  block: Pick<CampaignBlock, '__typename' | 'id'>
): Record<string, unknown> | null {
  return cache.readFragment({
    id: `${block.__typename}:${block.id}`,
    fragment: SECTION_STYLE,
    optimistic: true
  })
}

export function blockOf<T extends CampaignBlock['__typename']>(
  id: string
): Extract<CampaignBlock, { __typename: T }> {
  const block = campaign.blocks.find((candidate) => candidate.id === id)
  if (block == null) throw new Error(`no fixture block ${id}`)
  return block as Extract<CampaignBlock, { __typename: T }>
}

interface WithBlockProps<T extends CampaignBlock['__typename']> {
  blockId: string
  typename: T
  children: (block: Extract<CampaignBlock, { __typename: T }>) => ReactElement
}

/** Renders `children` over the block as the provider (and so the cache) currently holds it. */
export function WithBlock<T extends CampaignBlock['__typename']>({
  blockId,
  typename,
  children
}: WithBlockProps<T>): ReactElement | null {
  const { campaign: current } = useCampaignEditor()
  const block = current.blocks.find((candidate) => candidate.id === blockId)
  if (block == null || block.__typename !== typename) return null
  return children(block as Extract<CampaignBlock, { __typename: T }>)
}

/** A mock for one Campaign Theme write: the theme row with `input` applied over `current`. */
export function themeMock(
  input: CampaignThemeUpdateInput,
  current: Partial<CampaignTheme> = {}
): StyleMock {
  return {
    request: {
      query: CAMPAIGN_THEME_UPDATE,
      variables: { id: campaign.theme.id, input }
    },
    result: vi.fn(() => ({
      data: { campaignThemeUpdate: { ...campaign.theme, ...current, ...input } }
    }))
  }
}

const THEME_FIELDS = gql`
  fragment ThemeFields on CampaignTheme {
    themeMode
    headerFont
    bodyFont
    labelFont
    primaryColor
    accentColor
    backgroundColor
    surfaceColor
    textColor
    mutedColor
    contrastBackgroundColor
    contrastTextColor
    radius
    buttonRadius
  }
`

/** The Campaign Theme as the cache currently holds it (optimistic layer included). */
export function readTheme(
  cache: InMemoryCache
): Record<string, unknown> | null {
  return cache.readFragment({
    id: `CampaignTheme:${campaign.theme.id}`,
    fragment: THEME_FIELDS,
    optimistic: true
  })
}

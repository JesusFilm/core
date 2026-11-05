import {
  ReactElement,
  ReactNode,
  createContext,
  useContext,
  useMemo
} from 'react'

import {
  CampaignPageKind,
  CampaignStringKey
} from '../../../../__generated__/globalTypes'
import type { WorldMapShapes } from '../CampaignAnalytics/WorldMap'
import type { CampaignPublic, CampaignRegion } from '../types'

import { campaignString } from './campaignString'

export interface CampaignContextValue {
  campaign: CampaignPublic
  /** Which of the two pages is rendering. */
  pageKind: CampaignPageKind
  /** The Campaign Region a Region Page renders for; null on the landing page. */
  region: CampaignRegion | null
  /** The path the landing page is served at (`/campaign/<slug>` or `` on a Campaign Domain). */
  basePath: string
  /** The projected world map for the Analytics section; null when the page has none (the section then skips the map). */
  worldMap?: WorldMapShapes | null
  /** Ids of the blocks a same-page anchor can scroll to on the current page. */
  pageBlockIds: ReadonlySet<string>
  /** A Campaign String in the Page Language; empty when the campaign lacks the row or it is blank. */
  string: (key: CampaignStringKey) => string
  /** Whether the page sends campaign events to Plausible: the public page only, never the editor canvas. */
  reportEvents?: boolean
}

const CampaignContext = createContext<CampaignContextValue | null>(null)

interface CampaignProviderProps {
  value: Omit<CampaignContextValue, 'pageBlockIds' | 'basePath' | 'string'> & {
    basePath?: string
    /** The sections the page renders; defaults to every block of the page (the canvas). */
    pageBlockIds?: ReadonlySet<string>
  }
  children: ReactNode
}

export function campaignBasePath(slug: string): string {
  return `/campaign/${slug}`
}

/**
 * A campaign page path in the current Page Language: the `lang` param
 * carried forward whenever the visitor has a choice (two or more campaign
 * languages), so every in-campaign link keeps the language sticky.
 */
export function campaignPageHref(
  path: string,
  campaign: Pick<CampaignPublic, 'language' | 'languages'>
): string {
  const bcp47 = campaign.language.bcp47
  if (campaign.languages.length < 2 || bcp47 == null) return path
  return `${path}?lang=${encodeURIComponent(bcp47)}`
}

/** The landing page in the current Page Language (`/` on a Campaign Domain). */
export function campaignLandingHref(
  context: Pick<CampaignContextValue, 'campaign' | 'basePath'>
): string {
  return campaignPageHref(
    context.basePath === '' ? '/' : context.basePath,
    context.campaign
  )
}

export function CampaignProvider({
  value,
  children
}: CampaignProviderProps): ReactElement {
  const contextValue = useMemo<CampaignContextValue>(() => {
    const page = value.campaign.pages.find(
      (candidate) => candidate.kind === value.pageKind
    )
    return {
      ...value,
      basePath: value.basePath ?? campaignBasePath(value.campaign.slug),
      pageBlockIds:
        value.pageBlockIds ??
        new Set(page?.blocks.map((block) => block.id) ?? []),
      string: (key) => campaignString(value.campaign.strings, key)
    }
  }, [value])
  return (
    <CampaignContext.Provider value={contextValue}>
      {children}
    </CampaignContext.Provider>
  )
}

export function useCampaign(): CampaignContextValue {
  const context = useContext(CampaignContext)
  if (context == null)
    throw new Error('useCampaign must be used within a CampaignProvider')
  return context
}

export function useOptionalCampaign(): CampaignContextValue | null {
  return useContext(CampaignContext)
}

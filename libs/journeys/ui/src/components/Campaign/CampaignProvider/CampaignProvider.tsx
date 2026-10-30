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
import {
  campaignBasePath,
  campaignDomainName,
  campaignLinkPath,
  campaignPagePath
} from '../libs/campaignAddress'
import type { CampaignAddressInput } from '../libs/campaignAddress'
import type { CampaignPublic, CampaignRegion } from '../types'

import { campaignString } from './campaignString'

export interface CampaignContextValue {
  campaign: CampaignPublic
  /** Which of the two pages is rendering. */
  pageKind: CampaignPageKind
  /** The Campaign Region a Region Page renders for; null on the landing page. */
  region: CampaignRegion | null
  /** The path the landing page is served at (`/campaign/<slug>` or `` on a Campaign Domain), from the campaign's domain. */
  basePath: string
  /** Ids of the blocks a same-page anchor can scroll to on the current page. */
  pageBlockIds: ReadonlySet<string>
  /**
   * The block whose heading is the page's one `h1` (a Region Header or a
   * Hero), or null when neither renders. Unset outside `CampaignPage`, where
   * a Hero keeps its `h1`.
   */
  pageHeadingBlockId?: string | null
  /** A Campaign String in the Page Language; empty when the campaign lacks the row or it is blank. */
  string: (key: CampaignStringKey) => string
}

const CampaignContext = createContext<CampaignContextValue | null>(null)

interface CampaignProviderProps {
  value: Omit<CampaignContextValue, 'pageBlockIds' | 'basePath' | 'string'> & {
    /** The sections the page renders; defaults to every block of the page (the canvas). */
    pageBlockIds?: ReadonlySet<string>
  }
  children: ReactNode
}

/**
 * What the campaign's Campaign Address is built from: its slug and its
 * Campaign Domain. The payload carries a domain only when the page is served
 * on it, so it alone decides the form.
 */
export function campaignAddressInput(
  campaign: Pick<CampaignPublic, 'slug' | 'customDomainNames'>
): CampaignAddressInput {
  return {
    slug: campaign.slug,
    domainName: campaignDomainName(campaign.customDomainNames)
  }
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
  return campaignLinkPath(path, campaign)
}

/** The landing page in the current Page Language (`/` on a Campaign Domain). */
export function campaignLandingHref({
  campaign
}: Pick<CampaignContextValue, 'campaign'>): string {
  return campaignPageHref(
    campaignPagePath(campaignAddressInput(campaign)),
    campaign
  )
}

/** A region's page in the current Page Language (`/<region>` on a Campaign Domain). */
export function campaignRegionHref(
  campaign: CampaignPublic,
  regionSlug: string
): string {
  return campaignPageHref(
    campaignPagePath(campaignAddressInput(campaign), regionSlug),
    campaign
  )
}

/**
 * The campaign context. The value is memoised on its fields rather than on
 * the `value` object, which callers build inline each render, so consumers
 * re-render only when a field changes.
 */
export function CampaignProvider({
  value,
  children
}: CampaignProviderProps): ReactElement {
  const { campaign, pageKind, region, pageBlockIds, pageHeadingBlockId } = value
  const contextValue = useMemo<CampaignContextValue>(() => {
    const page = campaign.pages.find((candidate) => candidate.kind === pageKind)
    return {
      campaign,
      pageKind,
      region,
      basePath: campaignBasePath(campaignAddressInput(campaign)),
      pageBlockIds:
        pageBlockIds ?? new Set(page?.blocks.map((block) => block.id) ?? []),
      pageHeadingBlockId,
      string: (key) => campaignString(campaign.strings, key)
    }
  }, [campaign, pageKind, region, pageBlockIds, pageHeadingBlockId])
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

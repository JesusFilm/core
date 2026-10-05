import { ReactElement, ReactNode, createContext, useContext, useMemo } from 'react'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import type { CampaignPublic, CampaignRegion } from '../types'

export interface CampaignContextValue {
  campaign: CampaignPublic
  /** Which of the two pages is rendering. */
  pageKind: CampaignPageKind
  /** The Campaign Region a Region Page renders for; null on the landing page. */
  region: CampaignRegion | null
  /** The path the landing page is served at (`/campaign/<slug>` or `` on a Campaign Root). */
  basePath: string
  /** Ids of every block on the current page, for same-page anchors. */
  pageBlockIds: ReadonlySet<string>
}

const CampaignContext = createContext<CampaignContextValue | null>(null)

interface CampaignProviderProps {
  value: Omit<CampaignContextValue, 'pageBlockIds' | 'basePath'> & {
    basePath?: string
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

/** The landing page in the current Page Language (`/` on a Campaign Root). */
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
      pageBlockIds: new Set(page?.blocks.map((block) => block.id) ?? [])
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

import Box from '@mui/material/Box'
import GlobalStyles from '@mui/material/GlobalStyles'
import { ReactElement, useMemo } from 'react'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { CampaignFooter } from '../CampaignFooter'
import { CampaignHeader } from '../CampaignHeader'
import { CampaignProvider } from '../CampaignProvider'
import { CampaignRenderer } from '../CampaignRenderer'
import { transformCampaignBlocks } from '../libs/transformer'
import { isCampaignSection } from '../types'
import type {
  CampaignPublic,
  CampaignRegion,
  CampaignSectionTree
} from '../types'

import { campaignChromeTrees } from './campaignChromeTrees'
import { shouldRenderSection } from './shouldRenderSection'

interface CampaignPageProps {
  campaign: CampaignPublic
  pageKind: CampaignPageKind
  /** The region a Region Page renders for. */
  region?: CampaignRegion | null
  /** Where the landing page is served; defaults to `/campaign/<slug>`. */
  basePath?: string
}

/**
 * One of the two campaign pages from the payload: the Campaign Chrome header,
 * the page's sections treed from its flat block list, filtered through the
 * empty-state matrix, each rendered through `CampaignRenderer`, then the
 * chrome footer. Header and footer always render, the same rows the same way
 * on both pages; the page kind decides only the header's back-chip slot.
 * Single column below `md`; the authored layout from `md` up.
 */
export function CampaignPage({
  campaign,
  pageKind,
  region = null,
  basePath
}: CampaignPageProps): ReactElement {
  const chrome = useMemo(() => campaignChromeTrees(campaign), [campaign])
  const sections = useMemo<CampaignSectionTree[]>(() => {
    const page = campaign.pages.find((candidate) => candidate.kind === pageKind)
    if (page == null) return []
    return transformCampaignBlocks(page.blocks).filter(
      (block): block is CampaignSectionTree =>
        isCampaignSection(block) &&
        shouldRenderSection(block, {
          pageKind,
          region,
          regions: campaign.regions
        })
    )
  }, [campaign, pageKind, region])

  return (
    <CampaignProvider value={{ campaign, pageKind, region, basePath }}>
      <GlobalStyles styles={{ html: { scrollBehavior: 'smooth' } }} />
      <Box
        data-testid="CampaignPage"
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.default',
          color: 'text.primary'
        }}
      >
        <CampaignHeader block={chrome.header} />
        <Box component="main" sx={{ flexGrow: 1 }}>
          {sections.map((section) => (
            <CampaignRenderer key={section.id} block={section} />
          ))}
        </Box>
        <CampaignFooter block={chrome.footer} />
      </Box>
    </CampaignProvider>
  )
}

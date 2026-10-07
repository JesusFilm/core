import Box from '@mui/material/Box'
import GlobalStyles from '@mui/material/GlobalStyles'
import { ReactElement, ReactNode, useMemo } from 'react'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import type { WorldMapShapes } from '../CampaignAnalytics/WorldMap'
import { CampaignProvider } from '../CampaignProvider'
import { CampaignRenderer } from '../CampaignRenderer'
import { transformCampaignBlocks } from '../libs/transformer'
import { isCampaignSection } from '../types'
import type {
  CampaignPublic,
  CampaignRegion,
  CampaignSectionTree
} from '../types'

import { shouldRenderSection } from './shouldRenderSection'

interface CampaignPageProps {
  campaign: CampaignPublic
  pageKind: CampaignPageKind
  /** The region a Region Page renders for. */
  region?: CampaignRegion | null
  /** Where the landing page is served; defaults to `/campaign/<slug>`. */
  basePath?: string
  /** The projected world map, built once on the server from the viewer's `countries-110m.json`. */
  worldMap?: WorldMapShapes | null
  /** The Campaign Chrome header, filled by the chrome ticket. */
  headerSlot?: ReactNode
  /** The Campaign Chrome footer, filled by the chrome ticket. */
  footerSlot?: ReactNode
}

/**
 * One of the two campaign pages from the payload: the page's sections treed
 * from its flat block list, filtered through the empty-state matrix, each
 * rendered through `CampaignRenderer`, between the chrome slots. Single
 * column below `md`; the authored layout from `md` up.
 */
export function CampaignPage({
  campaign,
  pageKind,
  region = null,
  basePath,
  worldMap = null,
  headerSlot,
  footerSlot
}: CampaignPageProps): ReactElement {
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
    <CampaignProvider
      value={{ campaign, pageKind, region, basePath, worldMap }}
    >
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
        {headerSlot}
        <Box component="main" sx={{ flexGrow: 1 }}>
          {sections.map((section) => (
            <CampaignRenderer key={section.id} block={section} />
          ))}
        </Box>
        {footerSlot}
      </Box>
    </CampaignProvider>
  )
}

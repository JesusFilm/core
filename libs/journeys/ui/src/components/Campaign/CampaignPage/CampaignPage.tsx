import Box from '@mui/material/Box'
import GlobalStyles from '@mui/material/GlobalStyles'
import { ReactElement, useEffect, useMemo } from 'react'

import { getLocaleRTL } from '@core/shared/ui/rtl'

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
import { renderedSectionIds, shouldRenderSection } from './shouldRenderSection'

interface CampaignPageProps {
  campaign: CampaignPublic
  pageKind: CampaignPageKind
  /** The region a Region Page renders for. */
  region?: CampaignRegion | null
}

/**
 * One of the two campaign pages from the payload: the Campaign Chrome header,
 * the page's sections treed from its flat block list, filtered through the
 * empty-state matrix, each rendered through `CampaignRenderer`, then the
 * chrome footer. Only the sections it renders are same-page scroll targets,
 * so a button aimed at a skipped one renders inert. Header and footer always render, the same rows the same way
 * on both pages; the page kind decides only the header's back-chip slot.
 * Single column below `md`; the authored layout from `md` up. The document's
 * `lang` is the Page Language's bcp47 and `dir` follows the RTL lookup on it
 * (`ltr` when there is none), mirroring what the document shell renders.
 */
export function CampaignPage({
  campaign,
  pageKind,
  region = null
}: CampaignPageProps): ReactElement {
  const chrome = useMemo(() => campaignChromeTrees(campaign), [campaign])
  const bcp47 = campaign.language.bcp47
  useEffect(() => {
    const root = document.documentElement
    root.lang = bcp47 ?? ''
    root.dir = getLocaleRTL(bcp47 ?? '') ? 'rtl' : 'ltr'
  }, [bcp47])
  const { sections, pageBlockIds } = useMemo(() => {
    const context = {
      pageKind,
      region,
      regions: campaign.regions,
      strings: campaign.strings
    }
    const page = campaign.pages.find((candidate) => candidate.kind === pageKind)
    const rendered =
      page == null
        ? []
        : transformCampaignBlocks(page.blocks).filter(
            (block): block is CampaignSectionTree =>
              isCampaignSection(block) && shouldRenderSection(block, context)
          )
    return {
      sections: rendered,
      pageBlockIds: renderedSectionIds(rendered, context)
    }
  }, [campaign, pageKind, region])

  return (
    <CampaignProvider value={{ campaign, pageKind, region, pageBlockIds }}>
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

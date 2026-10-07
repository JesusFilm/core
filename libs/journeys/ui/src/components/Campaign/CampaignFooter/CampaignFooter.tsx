import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import { ReactElement, useMemo } from 'react'

import { useCampaign } from '../CampaignProvider'
import { CampaignRenderer } from '../CampaignRenderer'
import {
  CAMPAIGN_HEADER_HEIGHT,
  CampaignBandCover,
  CampaignSectionContext
} from '../CampaignSectionBand'
import { bandCssVariables, resolveBand } from '../libs/resolveBand'
import { hasText } from '../types'
import type { CampaignTree, CampaignTreeOf } from '../types'

interface CampaignFooterProps {
  block: CampaignTreeOf<'CampaignFooterBlock'>
}

function isLine(child: CampaignTree): boolean {
  return (
    child.__typename === 'CampaignTypographyBlock' && hasText(child.content)
  )
}

function isLink(child: CampaignTree): boolean {
  return child.__typename === 'CampaignButtonBlock' && hasText(child.label)
}

/**
 * The Campaign Chrome footer: a static band at the page end painted from the
 * band table like any section, its typography children as lines and its
 * button children as links, each group by parentOrder. Side by side from
 * `md` up, stacked below; an empty footer is a thin band. Same render on
 * both pages.
 */
export function CampaignFooter({ block }: CampaignFooterProps): ReactElement {
  const { campaign } = useCampaign()
  const band = useMemo(
    () => resolveBand(block, campaign.theme),
    [block, campaign.theme]
  )
  const sectionContext = useMemo(() => ({ band, align: null }), [band])
  const lines = block.children.filter(isLine)
  const links = block.children.filter(isLink)
  const empty = lines.length === 0 && links.length === 0

  return (
    <CampaignSectionContext.Provider value={sectionContext}>
      <Box
        component="footer"
        id={block.id}
        data-testid="CampaignFooter"
        data-empty={empty ? 'true' : undefined}
        style={bandCssVariables(band)}
        sx={{
          position: 'relative',
          backgroundColor: 'var(--campaign-band-background)',
          color: 'var(--campaign-band-text)',
          scrollMarginTop: `${CAMPAIGN_HEADER_HEIGHT}px`,
          borderTop: '1px solid var(--campaign-band-border)',
          minHeight: empty ? 16 : undefined,
          py: empty ? 0 : { xs: 4, md: 5 }
        }}
      >
        <CampaignBandCover block={block} />
        {!empty && (
          <Container maxWidth="lg" sx={{ position: 'relative' }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={{ xs: 2, md: 4 }}
              data-testid="CampaignFooterRow"
              sx={{
                alignItems: { xs: 'flex-start', md: 'center' },
                justifyContent: 'space-between'
              }}
            >
              {lines.length > 0 && (
                <Stack spacing={0.5} data-testid="CampaignFooterLines">
                  {lines.map((line) => (
                    <CampaignRenderer key={line.id} block={line} />
                  ))}
                </Stack>
              )}
              {links.length > 0 && (
                <Box
                  component="nav"
                  data-testid="CampaignFooterLinks"
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: { xs: 1, md: 2 }
                  }}
                >
                  {links.map((link) => (
                    <CampaignRenderer key={link.id} block={link} />
                  ))}
                </Box>
              )}
            </Stack>
          </Container>
        )}
      </Box>
    </CampaignSectionContext.Provider>
  )
}

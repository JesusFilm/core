import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { CampaignMediaSplit } from '../CampaignMediaSlot'
import { CampaignSectionBand } from '../CampaignSectionBand'
import { CampaignSectionHeading } from '../CampaignSectionHeading'
import { hasText } from '../types'
import type { CampaignTreeOf } from '../types'

interface CampaignFeaturedMediaProps {
  block: CampaignTreeOf<'CampaignFeaturedMediaBlock'>
}

/** The `bullets` column split one per line, blank lines dropped. */
export function featuredMediaBullets(bullets: string | null): string[] {
  if (bullets == null) return []
  return bullets
    .split(/\r?\n/)
    .map((bullet) => bullet.trim())
    .filter((bullet) => bullet !== '')
}

/**
 * The Featured Media section: eyebrow, title, lede and one-per-line bullets
 * beside its Media Slot, the media on `mediaSide` from `md` up and a single
 * column below it. Empty media leaves the text full width; empty text leaves
 * the media alone; the page skips the section when both are empty and it has
 * no Extras.
 */
export function CampaignFeaturedMedia({
  block
}: CampaignFeaturedMediaProps): ReactElement {
  const bullets = featuredMediaBullets(block.bullets)
  const hasHeading =
    hasText(block.eyebrow) || hasText(block.title) || hasText(block.lede)

  return (
    <CampaignSectionBand block={block}>
      <CampaignMediaSplit
        media={block.media}
        mediaSide={block.mediaSide}
        text={
          hasHeading || bullets.length > 0 ? (
            <Stack spacing={3}>
              <CampaignSectionHeading
                eyebrow={block.eyebrow}
                title={block.title}
                lede={block.lede}
              />
              {bullets.length > 0 && (
                <Box
                  component="ul"
                  data-testid="CampaignFeaturedMediaBullets"
                  sx={{ m: 0, pl: 3 }}
                >
                  {bullets.map((bullet, index) => (
                    <Typography
                      key={index}
                      component="li"
                      variant="body1"
                      sx={{
                        mb: 1,
                        '&::marker': { color: 'var(--campaign-band-accent)' }
                      }}
                    >
                      {bullet}
                    </Typography>
                  ))}
                </Box>
              )}
            </Stack>
          ) : null
        }
      />
    </CampaignSectionBand>
  )
}

import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, useMemo } from 'react'

import { CampaignStringKey } from '../../../../__generated__/globalTypes'
import { Video } from '../../Video'
import { useCampaign } from '../CampaignProvider'
import type { CampaignTreeOf } from '../types'

import {
  CampaignVideoDetails,
  campaignVideoDetails,
  campaignVideoPlayerBlock
} from './campaignVideoDetails'

interface CampaignVideoProps {
  block: CampaignTreeOf<'CampaignVideoBlock'>
}

function CampaignVideoCaption({
  details
}: {
  details: CampaignVideoDetails
}): ReactElement | null {
  if (details.title == null && details.description == null) return null
  return (
    <Stack component="figcaption" spacing={0.5}>
      {details.title != null && (
        <Typography
          variant="subtitle1"
          component="p"
          data-testid="CampaignVideoTitle"
          sx={{ color: 'var(--campaign-band-heading)' }}
        >
          {details.title}
        </Typography>
      )}
      {details.description != null && (
        <Typography
          variant="body2"
          data-testid="CampaignVideoDescription"
          sx={{
            color: 'var(--campaign-band-muted)',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {details.description}
        </Typography>
      )}
    </Stack>
  )
}

/**
 * A Campaign Video in a Media Slot. A Watch video with children is a poster
 * card — its title in the Page Language and "<n> videos" — linking out to
 * Watch; any other video plays inline in the journeys `Video` player, framed
 * at 16:9 and captioned with its title and description.
 */
export function CampaignVideo({ block }: CampaignVideoProps): ReactElement {
  const { campaign } = useCampaign()
  const details = useMemo(
    () => campaignVideoDetails(block, campaign.languageId),
    [block, campaign.languageId]
  )
  const playerBlock = useMemo(
    () => campaignVideoPlayerBlock(block, details),
    [block, details]
  )

  if (details.childrenCount > 0) {
    const videos =
      campaign.strings.find((string) => string.key === CampaignStringKey.videos)
        ?.value ?? ''
    return (
      <ButtonBase
        component="a"
        href={details.watchHref ?? undefined}
        target="_blank"
        rel="noopener noreferrer"
        data-testid={`CampaignVideoCard-${block.id}`}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          width: '100%',
          overflow: 'hidden',
          borderRadius: 1,
          textAlign: 'left',
          backgroundColor: 'var(--campaign-band-card)',
          border: '1px solid var(--campaign-band-border)'
        }}
      >
        <Box
          sx={{
            aspectRatio: '16 / 9',
            backgroundColor: 'var(--campaign-band-border)'
          }}
        >
          {details.poster != null && (
            <Box
              component="img"
              src={details.poster}
              alt=""
              loading="lazy"
              sx={{
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          )}
        </Box>
        <Stack spacing={0.5} sx={{ p: 3 }}>
          {details.title != null && (
            <Typography
              variant="h5"
              component="span"
              sx={{ color: 'var(--campaign-band-heading)' }}
            >
              {details.title}
            </Typography>
          )}
          <Typography
            variant="body2"
            component="span"
            sx={{ color: 'var(--campaign-band-muted)' }}
          >
            {`${details.childrenCount} ${videos}`.trim()}
          </Typography>
        </Stack>
      </ButtonBase>
    )
  }

  return (
    <Stack
      component="figure"
      spacing={1.5}
      data-testid={`CampaignVideo-${block.id}`}
      sx={{ m: 0, width: '100%' }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          overflow: 'hidden',
          borderRadius: 1,
          backgroundColor: '#000'
        }}
      >
        <Video {...playerBlock} />
      </Box>
      <CampaignVideoCaption details={details} />
    </Stack>
  )
}

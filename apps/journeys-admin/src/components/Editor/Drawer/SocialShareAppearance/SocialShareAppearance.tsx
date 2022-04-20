import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import ToolTip from '@mui/material/Tooltip'
import FacebookIcon from '@mui/icons-material/FacebookOutlined'
import TwitterIcon from '@mui/icons-material/Twitter'
import { useJourney } from '../../../../libs/context'
import { ImageEdit } from './ImageEdit/ImageEdit'
import { TitleEdit } from './TitleEdit/TitleEdit'
import { DescriptionEdit } from './DescriptionEdit/DescriptionEdit'

export function SocialShareAppearance(): ReactElement {
  const journey = useJourney()
  const shareUrl = journey?.slug ?? `untitled-journey-${journey?.id as string}`
  const encodedUrl = encodeURIComponent(shareUrl)
  const isPublished = journey?.status === 'published'

  return (
    <Box sx={{ px: 6, py: 4 }}>
      <Typography variant="subtitle2" sx={{ pb: 4 }}>
        Social Image
      </Typography>

      <ImageEdit />
      <TitleEdit />
      <DescriptionEdit />

      <Typography variant="subtitle2" sx={{ pb: 4 }}>
        Share Preview
      </Typography>

      <Stack direction="row" spacing={3}>
        <ToolTip
          title="Only published journeys are shareable"
          disableHoverListener={isPublished}
        >
          <span>
            <Button
              startIcon={
                <FacebookIcon
                  sx={{ height: '16px', width: '16px', color: '#1877F2' }}
                />
              }
              disabled={journey == null || !isPublished}
              href={`https://www.facebook.com/sharer/sharer.php?u=https://your.nextstep.is/${encodedUrl}`}
              target="_blank"
              rel="noopener"
            >
              <Typography variant="body2" color="secondary.dark">
                Facebook
              </Typography>
            </Button>
          </span>
        </ToolTip>

        <ToolTip
          title="Only published journeys are shareable"
          disableHoverListener={isPublished}
        >
          <span>
            <Button
              startIcon={
                <TwitterIcon
                  sx={{ height: '16px', width: '16px', color: '#1DA1F2' }}
                />
              }
              disabled={journey == null || !isPublished}
              href={`https://twitter.com/intent/tweet?url=https://your.nextstep.is/${encodedUrl}`}
              target="_blank"
              rel="noopener"
            >
              <Typography variant="body2" color="secondary.dark">
                Twitter
              </Typography>
            </Button>
          </span>
        </ToolTip>
      </Stack>
    </Box>
  )
}

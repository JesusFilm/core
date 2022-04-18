import { ReactElement, useState } from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
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

  const [openFacebookTooltip, setOpenFacebookTooltip] = useState(false)
  const [openTwitterTooltip, setOpenTwitterTooltip] = useState(false)

  const handleOpenFacebookTooltip = (): void => {
    if (journey?.publishedAt != null) return
    setOpenFacebookTooltip(true)
  }

  const handleCloseFacebookTooltip = (): void => {
    setOpenFacebookTooltip(false)
  }

  const handleOpenTwitterTooltip = (): void => {
    if (journey?.publishedAt != null) return
    setOpenTwitterTooltip(true)
  }

  const handleCloseTwitterTooltip = (): void => {
    setOpenTwitterTooltip(false)
  }

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
          open={openFacebookTooltip}
          onOpen={handleOpenFacebookTooltip}
          onClose={handleCloseFacebookTooltip}
          title="Only published journeys are shareable"
        >
          <span>
            <Button
              startIcon={
                <FacebookIcon
                  sx={{ height: '16px', width: '16px', color: '#1877F2' }}
                />
              }
              data-testid="facebook-share-button"
              disabled={journey == null || journey?.publishedAt == null}
            >
              <Link
                component="a"
                variant="body2"
                color="secondary.dark"
                underline="none"
                href={`https://www.facebook.com/sharer/sharer.php?u=https://your.nextstep.is/${encodedUrl}`}
                target="_blank"
                rel="noopener"
              >
                Facebook
              </Link>
            </Button>
          </span>
        </ToolTip>

        <ToolTip
          open={openTwitterTooltip}
          onOpen={handleOpenTwitterTooltip}
          onClose={handleCloseTwitterTooltip}
          title="Only published journeys are shareable"
        >
          <span>
            <Button
              startIcon={
                <TwitterIcon
                  sx={{ height: '16px', width: '16px', color: '#1DA1F2' }}
                />
              }
              data-testid="twitter-share-button"
              disabled={journey == null || journey?.publishedAt == null}
            >
              <Link
                component="a"
                variant="body2"
                color="secondary.dark"
                underline="none"
                href={`https://twitter.com/intent/tweet?url=https://your.nextstep.is/${encodedUrl}`}
                target="_blank"
                rel="noopener"
              >
                Twitter
              </Link>
            </Button>
          </span>
        </ToolTip>
      </Stack>
    </Box>
  )
}

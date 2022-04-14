import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import FacebookIcon from '@mui/icons-material/FacebookOutlined'
import TwitterIcon from '@mui/icons-material/Twitter'
import { useJourney } from '../../../../libs/context'
import { ImageEdit } from './ImageEdit/ImageEdit'
import { TitleEdit } from './TitleEdit/TitleEdit'
import { DescriptionEdit } from './DescriptionEdit/DescriptionEdit'

export function SocialShareAppearance(): ReactElement {
  const journey = useJourney()
  const shareUrl = journey?.slug ?? `untitled-journey-${journey?.id as string}`

  function handleShareFacebook(e): void {
    if (journey == null) return
    e.preventDefault()
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=https://your.nextstep.is/${shareUrl}`,
      '_blank'
    )
  }

  function handleShareTwitter(e): void {
    if (journey == null) return
    e.preventDefault()
    const encodedUrl = encodeURIComponent(shareUrl)
    window.open(
      `https://twitter.com/intent/tweet?url=https://your.nextstep.is/${encodedUrl}`,
      '_blank'
    )
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
        <Button
          onClick={handleShareFacebook}
          startIcon={
            <FacebookIcon
              sx={{ height: '16px', width: '16px', color: '#1877F2' }}
            />
          }
          data-testid="facebook-share-button"
          disabled={journey == null}
        >
          <Typography variant="body2" sx={{ color: 'black' }}>
            Facebook
          </Typography>
        </Button>
        <Button
          onClick={handleShareTwitter}
          startIcon={
            <TwitterIcon
              sx={{ height: '16px', width: '16px', color: '#1DA1F2' }}
            />
          }
          data-testid="twitter-share-button"
          disabled={journey == null}
        >
          <Typography variant="body2" sx={{ color: 'black' }}>
            Twitter
          </Typography>
        </Button>
      </Stack>
    </Box>
  )
}

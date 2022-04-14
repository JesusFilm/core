import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Image from 'next/image'
import { useJourney } from '../../../../libs/context'
import facebookIcon from '../../../../../public/facebook.svg'
import twitterIcon from '../../../../../public/twitter.svg'
import { ImageEdit } from './ImageEdit/ImageEdit'
import { TitleEdit } from './TitleEdit/TitleEdit'
import { DescriptionEdit } from './DescriptionEdit/DescriptionEdit'

export function SocialShareAppearance(): ReactElement {
  const journey = useJourney()

  const shareUrl = journey?.slug ?? `untitled-journey-${journey?.id as string}`

  function handleShareFacebook(e): void {
    e.preventDefault()
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=https://your.nextstep.is/${shareUrl}`,
      '_blank'
    )
  }

  function handleShareTwitter(e): void {
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
        <Button onClick={handleShareFacebook} startIcon={<FacebookIcon />}>
          <Typography variant="caption" sx={{ color: 'black' }}>
            Facebook
          </Typography>
        </Button>
        <Button onClick={handleShareTwitter} startIcon={<TwitterIcon />}>
          <Typography variant="caption" sx={{ color: 'black' }}>
            Twitter
          </Typography>
        </Button>
      </Stack>
    </Box>
  )
}

function FacebookIcon(): ReactElement {
  return (
    <Image src={facebookIcon} alt="Facebook share" height={14} width={14} />
  )
}

function TwitterIcon(): ReactElement {
  return <Image src={twitterIcon} alt="Twitter share" height={14} width={14} />
}

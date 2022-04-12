import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Image from 'next/image'
import facebookIcon from '../../../../../public/facebook.svg'
import twitterIcon from '../../../../../public/twitter.svg'

import { ImageEdit } from './ImageEdit/ImageEdit'
import { TitleEdit } from './TitleEdit/TitleEdit'
import { DescriptionEdit } from './DescriptionEdit/DescriptionEdit'

interface SocialShareAppearanceProps {
  id: string
}

export function SocialShareAppearance({
  id
}: SocialShareAppearanceProps): ReactElement {
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
        <Button startIcon={<FacebookIcon />} data-testid="facebook-button">
          <Typography color="secondary">Facebook</Typography>
        </Button>
        <Button startIcon={<TwitterIcon />} data-testid="twitter-button">
          <Typography color="secondary">Twitter</Typography>
        </Button>
      </Stack>
    </Box>
  )
}

function FacebookIcon(): ReactElement {
  return <Image src={facebookIcon} alt="FacebookLogo" height={14} width={14} />
}

function TwitterIcon(): ReactElement {
  return <Image src={twitterIcon} alt="TwitterLogo" height={14} width={14} />
}

import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import FacebookTwoToneIcon from '@mui/icons-material/FacebookTwoTone'
import TwitterIcon from '@mui/icons-material/Twitter'

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
        {/* Replace icon when available */}
        <Button startIcon={<FacebookTwoToneIcon sx={{ color: '#0163E0' }} />}>
          <Typography color="secondary">Facebook</Typography>
        </Button>
        {/* Replace icon when available */}
        <Button startIcon={<TwitterIcon sx={{ color: '#47ACDF' }} />}>
          <Typography color="secondary">Twitter</Typography>
        </Button>
      </Stack>
    </Box>
  )
}

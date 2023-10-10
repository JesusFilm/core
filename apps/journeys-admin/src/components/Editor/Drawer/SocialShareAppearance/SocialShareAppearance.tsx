import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { DescriptionEdit } from './DescriptionEdit/DescriptionEdit'
import { ImageEdit } from './ImageEdit/ImageEdit'
import { TitleEdit } from './TitleEdit/TitleEdit'

export function SocialShareAppearance(): ReactElement {
  return (
    <Box sx={{ px: 6, py: 4 }} data-testid="SocialShareAppearance" >
      <Typography variant="subtitle2" sx={{ pb: 4 }}>
        Social Image
      </Typography>

      <ImageEdit />
      <TitleEdit />
      <DescriptionEdit />
    </Box>
  )
}

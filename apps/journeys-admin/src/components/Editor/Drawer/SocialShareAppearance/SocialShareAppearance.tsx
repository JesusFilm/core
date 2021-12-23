import Box from '@mui/material/Box'
import { ReactElement } from 'react'

interface SocialShareAppearanceProps {
  id: string
}

export function SocialShareAppearance({
  id
}: SocialShareAppearanceProps): ReactElement {
  return (
    <>
      <Box sx={{ px: 6, py: 4 }}>Social Image</Box>
    </>
  )
}

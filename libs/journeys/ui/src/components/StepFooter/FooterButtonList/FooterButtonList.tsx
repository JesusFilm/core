import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'
import { ShareButton } from './ShareButton'

export function FooterButtonList(): ReactElement {
  return (
    <Stack direction="row" gap={2} data-testId="footer-buttons">
      <ShareButton />
      {/* Like */}
      {/* Dislike */}
    </Stack>
  )
}

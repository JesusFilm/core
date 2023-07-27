import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'
import { ShareButton } from './ShareButton'
import { ReactionButton } from './ReactionButton'

export function FooterButtonList(): ReactElement {
  return (
    <Stack direction="row" gap={2} data-testid="footer-buttons">
      <ShareButton />
      <ReactionButton variant="thumbsup" />
      <ReactionButton variant="thumbsdown" />
    </Stack>
  )
}

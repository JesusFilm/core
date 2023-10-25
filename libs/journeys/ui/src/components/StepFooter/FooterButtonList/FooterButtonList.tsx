import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { ReactionButton } from './ReactionButton'
import { ShareButton } from './ShareButton'

export function FooterButtonList(): ReactElement {
  return (
    <Stack direction="row" gap={2.5} data-testid="StepFooterButtonList">
      <ShareButton />
      <ReactionButton variant="thumbsup" />
      <ReactionButton variant="thumbsdown" />
    </Stack>
  )
}

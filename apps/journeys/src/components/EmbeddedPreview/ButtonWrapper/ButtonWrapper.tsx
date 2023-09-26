import Box from '@mui/material/Box'
import MuiButton from '@mui/material/Button'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { Icon } from '@core/journeys/ui/Icon'

import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../__generated__/GetJourney'
import { ButtonVariant } from '../../../../__generated__/globalTypes'
import { IconFields } from '../../../../__generated__/IconFields'

export function ButtonWrapper({
  block
}: {
  block: TreeBlock<ButtonBlock>
}): ReactElement {
  const startIcon = block.children.find(
    (child) => child.id === block.startIconId
  ) as TreeBlock<IconFields> | undefined

  const endIcon = block.children.find(
    (child) => child.id === block.endIconId
  ) as TreeBlock<IconFields> | undefined

  return (
    // Margin added via Box so it's ignored by admin selection border outline
    <Box
      sx={{
        mb: 4,
        mt:
          block.size === 'large'
            ? 6
            : block.size === 'medium'
            ? 5
            : block.size === 'small'
            ? 4
            : 5
      }}
      data-testid="EmbedButtonWrapper"
    >
      <MuiButton
        variant={block.buttonVariant ?? ButtonVariant.contained}
        color={block.buttonColor ?? undefined}
        size={block.size ?? undefined}
        startIcon={startIcon != null ? <Icon {...startIcon} /> : undefined}
        endIcon={endIcon != null ? <Icon {...endIcon} /> : undefined}
        fullWidth
        disableRipple
        sx={{
          '&.MuiButtonBase-root': { pointerEvents: 'none' }
        }}
      >
        {block.label}
      </MuiButton>
    </Box>
  )
}

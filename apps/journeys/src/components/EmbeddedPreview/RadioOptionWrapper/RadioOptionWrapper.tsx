import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import MuiButton, { ButtonProps } from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'

import { GetJourney_journey_blocks_RadioOptionBlock as RadioOptionBlock } from '../../../../__generated__/GetJourney'

export const StyledRadioOption = styled(MuiButton)<ButtonProps>(
  ({ theme }) => ({
    fontFamily: theme.typography.body2.fontFamily,
    fontSize: theme.typography.body2.fontSize,
    fontWeight: 600,
    lineHeight: theme.typography.body2.lineHeight,
    textAlign: 'start',
    justifyContent: 'flex-start',
    borderRadius: 'inherit',
    padding: '14px 10px 14px 14px'
  })
)

export function RadioOptionWrapper({
  block
}: {
  block: TreeBlock<RadioOptionBlock>
}): ReactElement {
  return (
    <StyledRadioOption
      variant="contained"
      fullWidth
      disableRipple
      startIcon={
        <RadioButtonUncheckedIcon data-testid="RadioOptionRadioButtonUncheckedIcon" />
      }
      sx={{
        '&.MuiButtonBase-root': { pointerEvents: 'none' }
      }}
    >
      {block.label}
    </StyledRadioOption>
  )
}

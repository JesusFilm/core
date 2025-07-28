import Box, { BoxProps } from '@mui/material/Box'
import ButtonGroup from '@mui/material/ButtonGroup'
import { styled } from '@mui/material/styles'
import { ReactElement } from 'react'

const StyledRadioQuestion = styled(Box)<BoxProps>(({ theme }) => ({
  marginBottom: theme.spacing(4)
}))

interface ListVariantProps {
  options: (ReactElement | false)[]
  addOption?: ReactElement
  blockId: string
}

export function ListVariant({
  options,
  addOption,
  blockId
}: ListVariantProps): ReactElement {
  return (
    <StyledRadioQuestion data-testid={`JourneysRadioQuestion-${blockId}`}>
      <ButtonGroup orientation="vertical" variant="contained" fullWidth>
        {options}
        {addOption}
      </ButtonGroup>
    </StyledRadioQuestion>
  )
}

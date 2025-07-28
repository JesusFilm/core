import Grid from '@mui/material/Grid'
import { styled } from '@mui/material/styles'
import { ReactElement } from 'react'

const StyledGridRadioQuestion = styled(Grid)(({ theme }) => ({
  marginBottom: theme.spacing(4)
}))

interface GridVariantProps {
  options: (ReactElement | false)[]
  addOption?: () => void
  blockId: string
}

export function GridVariant({
  options,
  addOption,
  blockId
}: GridVariantProps): ReactElement {
  return (
    <StyledGridRadioQuestion
      container
      spacing={2}
      data-testid={`JourneysRadioQuestionGrid-${blockId}`}
    >
      {options.map((option, index) => (
        <Grid key={index} size={6}>
          {option}
        </Grid>
      ))}
    </StyledGridRadioQuestion>
  )
}

import Grid from '@mui/material/Grid'
import { ReactElement } from 'react'

interface GridVariantProps {
  options: (ReactElement | false)[]
  addOption?: ReactElement
  blockId: string
}

export function GridVariant({
  options,
  addOption,
  blockId
}: GridVariantProps): ReactElement {
  return (
    <Grid
      container
      spacing={2}
      sx={{ marginBottom: 4 }}
      data-testid={`JourneysRadioQuestionGrid-${blockId}`}
    >
      {options.map((option, index) => (
        <Grid key={index} size={6}>
          {option}
        </Grid>
      ))}
      {addOption && <Grid size={6}>{addOption}</Grid>}
    </Grid>
  )
}

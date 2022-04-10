import { ReactElement } from 'react'
import TextField from '@mui/material/TextField'
import { useJourney } from '../../../../../libs/context'

export function DescriptionEdit(): ReactElement {
  const { description } = useJourney()
  return (
    <TextField
      variant="filled"
      label="Description"
      helperText="Recommended length: up to 18 words"
      fullWidth
      value={description}
      sx={{
        pb: 6
      }}
    />
  )
}

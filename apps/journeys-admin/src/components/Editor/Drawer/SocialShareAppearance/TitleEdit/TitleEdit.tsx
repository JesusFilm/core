import { ReactElement } from 'react'
import TextField from '@mui/material/TextField'
import { useJourney } from '../../../../../libs/context'

export function TitleEdit(): ReactElement {
  const { title } = useJourney()
  return (
    <TextField
      variant="filled"
      label="Title"
      helperText="Recommended length: 5 words"
      fullWidth
      value={title}
      sx={{
        pb: 4
      }}
    />
  )
}

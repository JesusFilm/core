// import { gql, useMutation, useQuery } from '@apollo/client'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
// import { Form, Formik } from 'formik'
import { ReactElement } from 'react'

interface AIPromptProps {
  textValue: string | null
  handleChange: (e) => void
  handleSubmit: () => void
  loading?: boolean
}

export function AIPrompt({
  textValue,
  handleChange,
  handleSubmit,
  loading
}: AIPromptProps): ReactElement {
  return (
    <Stack sx={{ m: 4 }}>
      <TextField
        id="outlined-textarea"
        multiline
        variant="filled"
        defaultValue={textValue}
        onChange={(e) => handleChange(e)}
        disabled={loading}
        label="Prompt"
      />
      <Button
        onClick={() => handleSubmit()}
        sx={{ mt: 4 }}
        disabled={loading}
        variant="outlined"
      >
        Prompt
      </Button>
    </Stack>
  )
}

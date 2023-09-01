// import { gql, useMutation, useQuery } from '@apollo/client'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
// import { Form, Formik } from 'formik'
import { ReactElement } from 'react'

interface AIPromptProps {
  textValue: string | null
  handleChange: (e) => void
  handleSubmit: () => void
}

export function AIPrompt({
  textValue,
  handleChange,
  handleSubmit
}: AIPromptProps): ReactElement {
  return (
    <Stack sx={{ m: 4 }}>
      {/* <Formik
        initialValues={{
          src: 'prompt'
        }}
        onSubmit={async (e) => {
          handleSubmit(e.src)
        }}
      >
        {({ values, handleSubmit, handleChange }) => (
          <Form> */}

      <TextField
        id="outlined-textarea"
        multiline
        variant="filled"
        defaultValue={textValue}
        onChange={(e) => handleChange(e)}
      />
      <Button onClick={() => handleSubmit()} sx={{ mt: 4 }}>
        Prompt
      </Button>

      {/* </Form>
        )}
      </Formik> */}
    </Stack>
  )
}

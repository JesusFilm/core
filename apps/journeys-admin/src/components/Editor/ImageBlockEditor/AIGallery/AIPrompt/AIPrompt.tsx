// import { gql, useMutation, useQuery } from '@apollo/client'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
// import { Form, Formik } from 'formik'
import { ReactElement, useState } from 'react'

// interface AIPromptProps {
//   prompt: string
// }

export function AIPrompt(): ReactElement {
  const somePrompt =
    'this prompt will need to be passed in as a prop in the future based on drawer selection'
  const [textValue, setTextvalue] = useState<string | null>(somePrompt)
  const handleSubmit = (): void => {
    console.log(textValue)
  }

  const handleChange = (e): void => {
    setTextvalue(e.target.value)
    console.log(textValue)
  }

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
        placeholder={somePrompt}
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

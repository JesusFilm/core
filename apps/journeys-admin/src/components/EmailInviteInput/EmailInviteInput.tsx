import { ReactElement, useState } from 'react'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import { Form, Formik } from 'formik'

interface EmailInviteInputProps {
  onClose: () => void
}

export function EmailInviteInput({
  onClose
}: EmailInviteInputProps): ReactElement {
  const handleAddUser = (): void => {
    console.log('Blank... for now')
  }
  const [email, setEmail] = useState('')

  return (
    <Formik initialValues={{}} onSubmit={handleAddUser}>
      <Form>
        <TextField
          autoFocus
          margin="normal"
          id="email"
          label="Email Address"
          type="email"
          fullWidth
          variant="outlined"
          value={email}
          onChange={(newEmail) => setEmail(newEmail.target.value)}
        />
        <TextField
          margin="normal"
          id="name"
          label="Display Name"
          fullWidth
          variant="outlined"
        />
        <Button type="submit">Submit</Button>
        <Button onClick={onClose}>Close</Button>
      </Form>
    </Formik>
  )
}

import { ReactElement, useState } from 'react'
import { Dialog } from '@core/shared/ui/Dialog'
import TextField from '@mui/material/TextField'
import List from '@mui/material/List'
import Button from '@mui/material/Button'
// import { gql, useQuery } from '@apollo/client'
// import { GetUser } from '../../../__generated__/GetUser'

// export const GET_USER = gql`
//   query GetUser {
//     me {
//       id
//     }
//   }
// `

interface EmailInviteInputProps {
  open?: boolean
  onClose: () => void
}

export function EmailInviteInput({
  open,
  onClose
}: EmailInviteInputProps): ReactElement {
  // const { data: id } = useQuery<GetUser>(GET_USER)
  // console.log(id)
  const handleAddUser = (): void => {}
  const [email, setEmail] = useState('')
  return (
    <Dialog
      open={open ?? false}
      onClose={onClose}
      dialogTitle={{ title: 'Add User With Email', closeButton: true }}
    >
      <List>
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
        <Button onClick={handleAddUser}>Submit</Button>
      </List>
    </Dialog>
  )
}

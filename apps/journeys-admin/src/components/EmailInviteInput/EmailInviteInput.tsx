import { ReactElement } from 'react'
import { Dialog } from '@core/shared/ui/Dialog'
import TextField from '@mui/material/TextField'
import List from '@mui/material/List'

interface EmailInviteInputProps {
  open?: boolean
  onClose: () => void
}

export function EmailInviteInput({
  open,
  onClose
}: EmailInviteInputProps): ReactElement {
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
        />
        <TextField
          margin="normal"
          id="name"
          label="Display Name"
          fullWidth
          variant="outlined"
        />
      </List>
    </Dialog>
  )
}

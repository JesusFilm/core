import { ReactElement } from 'react'
import MuiDialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'

interface DialogProps {
  open: boolean
  handleClose: () => void
  dialogAction?: DialogAction
  title?: string
  description?: string
  children?: ReactElement
}

interface DialogAction {
  onSubmit: () => void
  submitText: string
}

export function Dialog({
  open,
  handleClose,
  dialogAction,
  title,
  description,
  children
}: DialogProps): ReactElement {
  function handleSubmit(): void {
    dialogAction?.onSubmit()
    handleClose()
  }

  return (
    <MuiDialog
      open={open}
      maxWidth="sm"
      fullWidth={true}
      onClose={handleClose}
      sx={{
        p: 1,
        maxHeight: '560dp'
      }}
    >
      {title != null && (
        <Box sx={{ display: 'flex' }}>
          <DialogTitle>{title}</DialogTitle>
          <IconButton onClick={handleClose} sx={{ ml: 'auto' }}>
            <CloseRoundedIcon />
          </IconButton>
        </Box>
      )}
      <DialogContent>
        {/* Should description be combined with children? */}
        {description != null && (
          <DialogContentText>{description}</DialogContentText>
        )}
        {children}
      </DialogContent>
      {dialogAction != null && (
        <DialogActions>
          {/* Should the cancel text be changeable? */}
          {/* Should cancel button always show? */}
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}>{dialogAction.submitText}</Button>
        </DialogActions>
      )}
    </MuiDialog>
  )
}

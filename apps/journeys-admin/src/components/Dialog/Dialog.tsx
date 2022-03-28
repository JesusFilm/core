import { ReactElement } from 'react'
import MuiDialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'

export interface DialogProps {
  open: boolean
  handleClose: () => void
  dialogAction?: DialogAction
  title?: string
  closeButton?: boolean
  divider?: boolean
  children?: ReactElement
}

interface DialogAction {
  onSubmit: () => void
  submitLabel?: string
  closeLabel?: string
}

export function Dialog({
  open,
  handleClose,
  dialogAction,
  title,
  closeButton,
  divider,
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
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          {title}
          {/* pb needs to be adjusted */}
          {closeButton != null && closeButton && (
            <IconButton onClick={handleClose} sx={{ ml: 'auto' }}>
              <CloseRoundedIcon />
            </IconButton>
          )}
        </DialogTitle>
      )}
      <DialogContent dividers={divider}>{children}</DialogContent>
      {dialogAction != null && (
        <DialogActions>
          {/* Close button only shows when closeLabel is passed in */}
          <Button onClick={handleClose}>{dialogAction.closeLabel}</Button>
          <Button onClick={handleSubmit}>
            {dialogAction.submitLabel ?? 'Save'}
          </Button>
        </DialogActions>
      )}
    </MuiDialog>
  )
}

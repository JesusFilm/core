import { ReactElement } from 'react'
import { styled } from '@mui/system'
import MuiDialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
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

const StyledDialog = styled(MuiDialog)({
  '& .MuiDialogTitle-root': {
    display: 'flex',
    color: 'secondary.dark',
    paddingTop: 20,
    alignItems: 'center',
    '& .MuiIconButton-root': {
      marginLeft: 'auto'
    }
  },
  '& .MuiDialogContent-root': {
    paddingBottom: 24
  },
  '& .MuiDialogContent-dividers': {
    padding: 24
  },
  '& .MuiDialogActions-root': {
    paddingRight: 16,
    paddingTop: 8,
    paddingBottom: 8,
    '& > *': {
      '&:not(:first-of-type)': {
        marginLeft: 26
      }
    }
  },
  '& .MuiTypography-body1': {
    color: 'secondary.light'
  }
})

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
    <StyledDialog
      open={open}
      maxWidth="sm"
      fullWidth={true}
      onClose={handleClose}
    >
      {title != null && (
        <DialogTitle>
          <Typography variant="h5">{title}</Typography>
          {closeButton != null && closeButton && (
            <IconButton size="medium" onClick={handleClose}>
              <CloseRoundedIcon />
            </IconButton>
          )}
        </DialogTitle>
      )}
      <DialogContent dividers={divider}>{children}</DialogContent>
      {dialogAction != null && (
        <DialogActions>
          {dialogAction.closeLabel != null && (
            <Button onClick={handleClose}>{dialogAction.closeLabel}</Button>
          )}
          <Button onClick={handleSubmit}>
            {dialogAction.submitLabel ?? 'Save'}
          </Button>
        </DialogActions>
      )}
    </StyledDialog>
  )
}

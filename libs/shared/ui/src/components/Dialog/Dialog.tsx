import { ReactElement, ReactNode } from 'react'
import { styled } from '@mui/material/styles'
import MuiDialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import MuiDialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'

interface DialogProps {
  open: boolean
  onClose: () => void
  dialogTitle?: DialogTitle
  dialogAction?: DialogAction
  divider?: boolean
  fullscreen?: boolean
  children?: ReactElement
}

interface DialogAction {
  onSubmit: () => void
  submitLabel?: string
  closeLabel?: string
}

interface DialogTitle {
  icon?: ReactNode
  title: string
  closeButton?: boolean
}

const StyledDialog = styled(MuiDialog)({
  '& .MuiDialogTitle-root': {
    display: 'flex',
    color: 'secondary.dark',
    paddingTop: 20,
    alignItems: 'center',
    '& .MuiIconButton-root': {
      marginLeft: 'auto',
      padding: 0
    }
  },
  '& .MuiDialogContent-root': {
    paddingBottom: 24
  },
  '& .MuiDialogContent-dividers': {
    padding: 24
  },
  '& .MuiDialogActions-root': {
    padding: 8,
    '& .MuiButton-root': {
      padding: '10px 20px 10px 18px'
    },
    '& > *': {
      '&:not(:first-of-type)': {
        marginLeft: 0
      }
    }
  },
  '& .MuiTypography-body1': {
    color: 'secondary.light'
  }
})

export function Dialog({
  open,
  onClose,
  dialogTitle,
  dialogAction,
  divider,
  fullscreen,
  children
}: DialogProps): ReactElement {
  return (
    <StyledDialog
      open={open}
      fullScreen={fullscreen}
      maxWidth="sm"
      fullWidth
      onClose={onClose}
    >
      {dialogTitle != null && (
        <MuiDialogTitle>
          {dialogTitle.icon != null && dialogTitle.icon}
          {dialogTitle.title}
          {dialogTitle.closeButton != null && dialogTitle.closeButton && (
            <IconButton
              size="medium"
              onClick={onClose}
              data-testid="dialog-close-button"
            >
              <CloseRoundedIcon />
            </IconButton>
          )}
        </MuiDialogTitle>
      )}
      <DialogContent dividers={divider}>{children}</DialogContent>
      {dialogAction != null && (
        <DialogActions>
          {dialogAction.closeLabel != null && (
            <Button onClick={onClose}>{dialogAction.closeLabel}</Button>
          )}
          <Button onClick={dialogAction?.onSubmit}>
            {dialogAction.submitLabel ?? 'Save'}
          </Button>
        </DialogActions>
      )}
    </StyledDialog>
  )
}

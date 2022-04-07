import { ReactElement } from 'react'
import { styled } from '@mui/material/styles'
import MuiDialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import MuiDialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'

export interface DialogProps {
  open: boolean
  handleClose: () => void
  dialogTitle?: DialogTitle
  dialogAction?: DialogAction
  divider?: boolean
  fullScreen?: boolean
  children?: ReactElement
}

interface DialogAction {
  onSubmit: () => void
  submitLabel?: string
  closeLabel?: string
}

interface DialogTitle {
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
  handleClose,
  dialogTitle,
  dialogAction,
  divider,
  fullScreen,
  children
}: DialogProps): ReactElement {
  function handleSubmit(): void {
    dialogAction?.onSubmit()
    handleClose()
  }

  return (
    <StyledDialog
      open={open}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth={true}
      onClose={handleClose}
    >
      {dialogTitle != null && (
        <MuiDialogTitle>
          {dialogTitle.title}
          {dialogTitle.closeButton != null && dialogTitle.closeButton && (
            <IconButton
              size="medium"
              onClick={handleClose}
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

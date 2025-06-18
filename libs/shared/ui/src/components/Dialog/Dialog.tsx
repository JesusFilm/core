import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import Button from '@mui/material/Button'
import MuiDialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import MuiDialogTitle from '@mui/material/DialogTitle'
import IconButton, { IconButtonProps } from '@mui/material/IconButton'
import { SxProps, styled } from '@mui/material/styles'
import { ReactElement, ReactNode } from 'react'

interface DialogProps {
  open?: boolean
  onClose?: () => void
  dialogTitle?: DialogTitle
  dialogAction?: DialogAction
  /** Prefer `dialogAction` when child elements are buttons */
  dialogActionChildren?: ReactNode
  divider?: boolean
  fullscreen?: boolean
  children?: ReactNode
  container?: HTMLElement
  loading?: boolean
  testId?: string
  slotProps?: SlotProps
  sx?: SxProps
}

interface DialogAction {
  onSubmit: () => void
  submitLabel?: string
  closeLabel?: string
}

interface DialogTitle {
  icon?: ReactElement
  title: string
  closeButton?: boolean
}

interface SlotProps {
  titleButton: IconButtonProps
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
  dialogActionChildren,
  divider,
  fullscreen,
  children,
  container,
  loading = false,
  testId,
  slotProps,
  sx
}: DialogProps): ReactElement {
  return (
    <StyledDialog
      open={open === true}
      fullScreen={fullscreen}
      maxWidth="sm"
      fullWidth
      onClose={onClose}
      container={container}
      data-testid={testId}
      sx={sx}
    >
      {dialogTitle != null && (
        <MuiDialogTitle>
          {dialogTitle.icon != null && dialogTitle.icon}
          {dialogTitle.title}
          {dialogTitle.closeButton != null && dialogTitle.closeButton && (
            <IconButton
              size="medium"
              {...slotProps?.titleButton}
              onClick={onClose}
              data-testid="dialog-close-button"
            >
              <CloseRoundedIcon data-testid="CloseRoundedIcon" />
            </IconButton>
          )}
        </MuiDialogTitle>
      )}
      <DialogContent dividers={divider ?? dialogActionChildren != null}>
        {children}
      </DialogContent>
      {dialogAction != null ? (
        <DialogActions data-testid="dialog-action">
          {dialogAction.closeLabel != null && (
            <Button onClick={onClose} disabled={loading}>
              {dialogAction.closeLabel}
            </Button>
          )}
          <Button onClick={dialogAction?.onSubmit} loading={loading}>
            {dialogAction.submitLabel ?? 'Save'}
          </Button>
        </DialogActions>
      ) : dialogActionChildren != null ? (
        <DialogActions data-testid="dialog-action">
          {dialogActionChildren}
        </DialogActions>
      ) : null}
    </StyledDialog>
  )
}

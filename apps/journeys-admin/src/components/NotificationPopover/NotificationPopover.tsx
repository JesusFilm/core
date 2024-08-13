import Button from '@mui/material/Button'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

interface NotificationPopoverProps {
  title: string
  description: string
  open: boolean
  currentRef: HTMLElement | null
  pointerPosition: string // percentage
  handleClose: () => void
  popoverAction?: PopoverAction
}

interface PopoverAction {
  label: string
  handleClick: () => void
}

export function NotificationPopover({
  title,
  description,
  open,
  currentRef,
  pointerPosition,
  handleClose,
  popoverAction
}: NotificationPopoverProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  function handleClick(): void {
    if (popoverAction != null) {
      handleClose()
      popoverAction.handleClick()
    }
  }

  return currentRef != null ? (
    <Popover
      open={open}
      anchorEl={currentRef}
      anchorOrigin={{
        vertical: 35,
        horizontal: 'left'
      }}
      onClose={handleClose}
      slotProps={{
        paper: {
          sx: {
            maxWidth: { xs: 'calc(100% - 30px)', sm: 300 },
            mt: 4,
            position: 'relative',
            overflow: 'visible',
            '&::before': {
              backgroundColor: 'background.paper',
              content: '""',
              display: 'block',
              position: 'absolute',
              width: 12,
              height: 12,
              top: -6,
              transform: 'rotate(45deg)',
              left: pointerPosition,
              zIndex: 1
            }
          }
        }
      }}
    >
      <Stack spacing={2} p={4}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography>{description}</Typography>
        <Stack direction="row" gap={3} sx={{ alignSelf: 'flex-end' }}>
          <Button onClick={handleClose}>{t('Dismiss')}</Button>
          {popoverAction != null && (
            <Button onClick={handleClick}>{popoverAction.label}</Button>
          )}
        </Stack>
      </Stack>
    </Popover>
  ) : (
    <></>
  )
}

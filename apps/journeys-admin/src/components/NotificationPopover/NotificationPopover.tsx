import Box from '@mui/material/Box'
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
  handleClose: () => void
  currentRef: HTMLElement | null
  pointerPosition: string // percentage
}

export function NotificationPopover({
  title,
  description,
  open,
  handleClose,
  currentRef,
  pointerPosition
}: NotificationPopoverProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return currentRef != null ? (
    <Popover
      open={open}
      anchorEl={currentRef}
      anchorOrigin={{
        vertical: 35,
        horizontal: 'left'
      }}
      slotProps={{
        paper: {
          sx: {
            maxWidth: { xs: 'calc(100% - 30px)', sm: 300 },
            mt: 4,
            position: 'relative',
            overflow: 'visible',
            '&::before': {
              backgroundColor: 'white',
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
        <Box textAlign="right">
          <Button onClick={handleClose}>{t('Dismiss')}</Button>
        </Box>
      </Stack>
    </Popover>
  ) : (
    <></>
  )
}

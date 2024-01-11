import { Modal as MuiModal, Stack, Typography } from '@mui/material'
import { FC, ReactNode } from 'react'

interface ModalProps {
  title: string
  subtitle?: string
  open: boolean
  handleClose: () => void
  children: ReactNode
  actions: ReactNode
}

export const Modal: FC<ModalProps> = ({
  title,
  subtitle,
  open,
  handleClose,
  children,
  actions
}) => {
  return (
    <MuiModal open={open} onClose={handleClose}>
      <Stack
        sx={{
          width: '600px',
          backgroundColor: '#fff',
          borderRadius: '4px',
          p: '24px',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
        spacing={6}
      >
        <Stack spacing={2}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {subtitle}
            </Typography>
          )}
        </Stack>
        {children}
        {actions}
      </Stack>
    </MuiModal>
  )
}

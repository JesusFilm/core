import { Modal as MuiModal, Stack, Typography } from '@mui/material'
import { FC, ReactNode } from 'react'

interface ModalProps {
  title: string
  open: boolean
  handleClose: () => void
  children: ReactNode
  actions: ReactNode
}

export const Modal: FC<ModalProps> = ({
  title,
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
        spacing={10}
      >
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {children}
        {actions}
      </Stack>
    </MuiModal>
  )
}

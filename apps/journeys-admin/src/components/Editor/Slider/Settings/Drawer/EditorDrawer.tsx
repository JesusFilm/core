import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { ReactElement, ReactNode } from 'react'

import { DrawerTitle } from './Drawer'

interface EditorDrawerProps {
  title?: string
  onClose?: () => void
  children: ReactNode
}

export function EditorDrawer({
  title,
  onClose,
  children
}: EditorDrawerProps): ReactElement {
  return (
    <Stack
      component={Paper}
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: 3,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        overflow: 'hidden'
      }}
      border={1}
      borderColor="divider"
      data-testId="SettingsDrawer"
    >
      <DrawerTitle title={title} onClose={onClose} />
      <Stack
        data-testid="SettingsDrawerContent"
        className="swiper-no-swiping"
        flexGrow={1}
        sx={{ overflow: 'auto' }}
      >
        {children}
      </Stack>
    </Stack>
  )
}

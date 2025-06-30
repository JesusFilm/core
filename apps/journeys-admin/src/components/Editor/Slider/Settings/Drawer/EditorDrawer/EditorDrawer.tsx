import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { ReactElement, ReactNode } from 'react'

import { DRAWER_WIDTH } from '../../../../constants'
import { DrawerTitle } from '../Drawer'

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
        borderRadius: { xs: 0, md: 3 },
        overflow: 'hidden',
        width: { xs: '100%', md: DRAWER_WIDTH }
      }}
      border={1}
      borderColor="divider"
      data-testId="SettingsDrawer"
    >
      <DrawerTitle title={title} onClose={onClose} />
      <Stack
        data-testid="SettingsDrawerContent"
        flexGrow={1}
        sx={{ overflow: 'auto' }}
      >
        {children}
      </Stack>
    </Stack>
  )
}

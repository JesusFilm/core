import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { DrawerTitle } from '../Drawer/Drawer'

export function DrawerContentWrapper({
  title,
  onClose,
  children
}): ReactElement {
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
      {children}
    </Stack>
  )
}

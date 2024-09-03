import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import Stack from '@mui/material/Stack'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'
import LogoutIcon from '@mui/icons-material/Logout'

import { signOut } from '../../../auth'
import IconButton from '@mui/material/IconButton'

export async function Nav(): Promise<ReactElement> {
  const t = useTranslations()
  return (
    <Drawer
      open
      variant="permanent"
      anchor="left"
      sx={{
        display: { xs: 'none', md: 'flex' },
        backgroundColor: 'secondary.dark',
        height: '100vh',
        width: '75px',
        '& .MuiDrawer-paper': {
          width: 'inherit',
          border: 0,
          overflowY: 'hidden',
          backgroundColor: 'secondary.dark'
        }
      }}
    >
      <Stack
        direction="column"
        alignItems="center"
        sx={{
          overflow: 'hidden',
          mt: 1,
          display: { xs: 'none', md: 'flex' },
          height: 'inherit',
          flex: '0 0 auto'
        }}
      >
        <Box
          component="form"
          action={async () => {
            'use server'
            await signOut()
          }}
        >
          <IconButton aria-label="sign-out" type="submit">
            <LogoutIcon sx={{ color: 'secondary.light' }} />
          </IconButton>
        </Box>
      </Stack>
    </Drawer>
  )
}

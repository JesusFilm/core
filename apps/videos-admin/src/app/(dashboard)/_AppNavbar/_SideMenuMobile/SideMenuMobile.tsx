import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Drawer, { drawerClasses } from '@mui/material/Drawer'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { MenuContent } from '../../../../components/MenuContent'
import { useAuth } from '../../../../libs/auth/authContext'
import { useLogout } from '../../../../libs/useLogout'

interface SideMenuMobileProps {
  open: boolean | undefined
  toggleDrawer: (newOpen: boolean) => () => void
}

export function SideMenuMobile({
  open,
  toggleDrawer
}: SideMenuMobileProps): ReactElement {
  const auth = useAuth()
  const handleLogout = useLogout()

  return (
    <Drawer
      data-testid="SideMenuMobile"
      anchor="right"
      open={open}
      onClose={toggleDrawer(false)}
      sx={{
        [`& .${drawerClasses.paper}`]: {
          backgroundImage: 'none',
          backgroundColor: 'background.paper'
        }
      }}
    >
      <Stack
        sx={{
          maxWidth: '70dvw',
          height: '100%'
        }}
      >
        <Stack direction="row" sx={{ p: 2, pb: 0, gap: 1 }}>
          <Stack
            direction="row"
            sx={{ gap: 1, alignItems: 'center', flexGrow: 1, p: 1 }}
          >
            <Avatar
              sizes="small"
              alt={auth.user?.displayName ?? ''}
              src={auth.user?.photoURL ?? ''}
              sx={{ width: 24, height: 24 }}
            />
            <Typography component="p" variant="h6">
              {auth.user?.displayName}
            </Typography>
          </Stack>
        </Stack>
        <Divider />
        <Stack sx={{ flexGrow: 1 }}>
          <MenuContent />
          <Divider />
        </Stack>
        <Stack sx={{ p: 2 }}>
          <Button
            onClick={handleLogout}
            variant="outlined"
            fullWidth
            startIcon={<LogoutRoundedIcon />}
          >
            Sign Out
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  )
}

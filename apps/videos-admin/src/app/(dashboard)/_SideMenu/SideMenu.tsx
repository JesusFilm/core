import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { ReactElement } from 'react'

import minimalLogo from '../../../assets/minimal-logo.png'
import { MenuContent } from '../../../components/MenuContent'
import { OptionsMenu } from '../../../components/OptionsMenu'
import { useAuth } from '../../../libs/auth/authContext'
import { getEnvironmentBannerHeight } from '../../../libs/environment'

const drawerWidth = 240

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: 'border-box',
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: 'border-box'
  }
})

export function SideMenu(): ReactElement {
  const auth = useAuth()
  const environmentBannerHeight = getEnvironmentBannerHeight()

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: 'background.paper',
          top: `${environmentBannerHeight}px`,
          height: `calc(100vh - ${environmentBannerHeight}px)`
        }
      }}
    >
      <Stack
        direction="row"
        sx={{ px: 1.5, pt: 1.5 }}
        alignItems="center"
        gap={1}
      >
        <Image
          src={minimalLogo}
          alt="Jesus Film Project"
          width={37}
          height={37}
        />
        <Typography component="h1" variant="h6">
          Nexus
        </Typography>
      </Stack>
      <MenuContent />
      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1,
          alignItems: 'center',
          borderTop: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Avatar
          sizes="small"
          alt={auth.user?.displayName ?? ''}
          src={auth.user?.photoURL ?? ''}
          sx={{ width: 36, height: 36 }}
        />
        <Box
          flexGrow={1}
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, lineHeight: '16px' }}
          >
            {auth.user?.displayName}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary'
            }}
          >
            {auth.user?.email}
          </Typography>
        </Box>
        <OptionsMenu />
      </Stack>
    </Drawer>
  )
}

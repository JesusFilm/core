import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useRouter } from 'next/router'
import { ReactElement, ReactNode, useState } from 'react'

import { AppHeader } from './AppHeader'
import { Header } from './Header'
import { NavigationDrawer } from './NavigationDrawer'
import { usePageWrapperStyles } from './utils/usePageWrapperStyles'

interface PageWrapperProps {
  showAppHeader?: boolean
  title?: string
  hasBack?: boolean
  children: ReactNode
}

export function PageWrapper({
  showAppHeader = true,
  children,
  title,
  hasBack = false
}: PageWrapperProps): ReactElement {
  const [open, setOpen] = useState<boolean>(false)
  const { navbar, toolbar } = usePageWrapperStyles()
  const router = useRouter()

  return (
    <Stack
      direction="row"
      sx={{
        minHeight: '100vh'
      }}
    >
      <Stack
        flexGrow={1}
        direction={{ xs: 'column', md: 'row' }}
        sx={{
          backgroundColor: 'background.default',
          width: {
            xs: '100vw',
            md: `calc(100vw - ${navbar.width})`
          },
          pt: { xs: showAppHeader ? toolbar.height : 0, md: 0 }
        }}
      >
        {showAppHeader && <AppHeader onClick={() => setOpen(!open)} />}
        <NavigationDrawer
          open={open}
          onClose={setOpen}
          selectedPage={router?.pathname?.split('/')[1]}
        />
        <Stack
          flexGrow={1}
          sx={{
            width: {
              xs: '100vw',
              md: `calc(100vw - ${navbar.width})`
            },
            backgroundColor: '#F6F5F6',
            py: 2,
            px: 3
          }}
        >
          <Header title={title} hasBack={hasBack} />
          <Box>{children}</Box>
        </Stack>
      </Stack>
    </Stack>
  )
}

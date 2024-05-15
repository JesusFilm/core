import Stack from '@mui/material/Stack'
import { useRouter } from 'next/router'
import { User } from 'next-firebase-auth'
import { ReactElement, ReactNode, useState } from 'react'

import { AppHeader } from './AppHeader'
import { Header } from './Header'
import { NavigationDrawer } from './NavigationDrawer'
import { usePageWrapperStyles } from './utils/usePageWrapperStyles'

interface PageWrapperProps {
  title?: string
  hasBack?: boolean
  children?: ReactNode
  user?: User
}

export function PageWrapper({
  children,
  title,
  user,
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
          pt: { xs: toolbar.height, md: 0 }
        }}
      >
        <AppHeader onClick={() => setOpen(!open)} />
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
            backgroundColor: 'background.default',
            py: 2,
            px: 3
          }}
        >
          <Header user={user} title={title} hasBack={hasBack} />
          <Stack flexGrow={1} data-testid="main-body">
            {children}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  )
}

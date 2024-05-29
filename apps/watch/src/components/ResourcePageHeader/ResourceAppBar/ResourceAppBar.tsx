import MenuIcon from '@mui/icons-material/Menu'
import AppBar from '@mui/material/AppBar'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Image from 'next/image'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import logo from '../../Header/assets/logo.svg'

interface ResourceAppBarProps {
  selectedTab: string
  showBreadcrumb: boolean
  setTestButtonClicked: (boolean) => void
}

export function ResourceAppBar({
  selectedTab,
  showBreadcrumb,
  setTestButtonClicked
}: ResourceAppBarProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  return (
    <AppBar
      position="relative"
      sx={{
        p: 4,
        background: 'transparent',
        boxShadow: 'none'
        // backgroundColor: 'red'
      }}
      data-testid="ResourceHeader"
    >
      <Container maxWidth="xxl" disableGutters>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Stack flexDirection="row">
            <NextLink href="/" passHref legacyBehavior>
              <Image
                src={logo}
                width="160"
                height="40"
                alt="Watch Logo"
                style={{
                  cursor: 'pointer',
                  maxWidth: '100%',
                  height: 'auto'
                }}
              />
            </NextLink>
            {showBreadcrumb && (
              <Breadcrumbs sx={{ marginLeft: '20px' }}>
                <Link
                  color="inherit"
                  onClick={() => setTestButtonClicked(false)}
                  // onClick={() => console.log('clicking')}
                  underline="none"
                  style={{ cursor: 'pointer' }}
                >
                  {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}
                </Link>
              </Breadcrumbs>
            )}
          </Stack>
          <Stack spacing={0.5} direction="row">
            <Button
              sx={{
                color: 'black',
                borderRadius: '50%',
                border: '2px red'
              }}
            >
              {t('Sign in')}
            </Button>
            <Button
              sx={{
                p: 2,
                //   borderStyle: 'solid',
                //   borderColor: 'red',
                //   borderWidth: 2,
                borderRadius: '80px',
                border: '2px solid red'
              }}
            >
              {t('Give now')}
            </Button>
            <IconButton
              color="secondary"
              aria-label="open header menu"
              edge="start"
              onClick={() => console.log('menu click')}
            >
              <MenuIcon />
            </IconButton>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  )
}

import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded'
import AppBar, { AppBarProps } from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import NextLink from 'next/link'
import { MouseEventHandler, ReactElement, useState } from 'react'

import logo from '../assets/logo.svg'

const DynamicLanguageSwitchDialog = dynamic(
  () =>
    import(
      /* webpackChunkName: "LanguageSwitchDialog" */
      '../../LanguageSwitchDialog'
    ).then((mod) => mod.LanguageSwitchDialog),
  { ssr: false }
)

interface LocalAppBarProps extends AppBarProps {
  onMenuClick: MouseEventHandler<HTMLButtonElement>
  hideSpacer?: boolean
  menuOpen?: boolean
}

export function LocalAppBar({
  onMenuClick,
  hideSpacer = false,
  menuOpen = false,
  ...props
}: LocalAppBarProps): ReactElement {
  const [openLanguagesDialog, setOpenLanguagesDialog] = useState(false)

  return (
    <AppBar
      data-testid="Header"
      position="static"
      {...props}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        background: 'transparent',
        color: hideSpacer ? 'background.default' : 'inherit',
        boxShadow: 'none',
        py: 10,
        pt: { lg: '69px' },
        pb: { lg: 14 },
        height: { xs: 100, lg: 159 },
        width: '100%',
        ...props.sx
      }}
    >
      <Container maxWidth="xxl" disableGutters sx={{ px: 8 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          flexGrow={1}
        >
          <NextLink passHref legacyBehavior href="https://www.jesusfilm.org/">
            <Box
              data-testid="WatchLogo"
              sx={{
                width: { xs: 126, lg: 186 },
                mt: { xs: 1.2, lg: 3.5 },
                mb: { xs: -1.2, lg: -3.5 },
                zIndex: (theme) => ({ xs: theme.zIndex.drawer + 1, lg: 0 })
              }}
            >
              <Image
                src={logo}
                alt="Watch Logo"
                style={{
                  cursor: 'pointer',
                  maxWidth: '100%',
                  height: 'auto',
                  width: 'auto'
                }}
              />
            </Box>
          </NextLink>
          <Box data-testid="MenuBox">
            <IconButton
              color="inherit"
              aria-label="open language selector"
              data-testid="LanguageSelector"
              onClick={() => setOpenLanguagesDialog(true)}
              sx={{
                mr: 8,
                zIndex: (theme) => theme.zIndex.drawer + 1
              }}
            >
              <LanguageRoundedIcon
                sx={{ fontSize: 39, color: 'text.secondary' }}
              />
            </IconButton>
            <DynamicLanguageSwitchDialog
              open={openLanguagesDialog}
              handleClose={() => setOpenLanguagesDialog(false)}
            />

            <IconButton
              data-testid="MenuIcon"
              color="inherit"
              aria-label="open header menu"
              edge="start"
              onClick={onMenuClick}
              disableRipple
              className={menuOpen ? 'expanded' : ''}
              aria-expanded={menuOpen}
              sx={{
                width: 39,
                height: 30,
                p: 0,
                position: 'relative',
                zIndex: (theme) => theme.zIndex.drawer + 1,
                '& span': {
                  display: 'block',
                  position: 'absolute',
                  width: '100%',
                  height: 6,
                  borderRadius: 6,
                  backgroundColor: 'text.secondary',
                  opacity: 1,
                  left: 0,
                  transform: 'rotate(0deg)',
                  transition: '0.15s ease-in-out',
                  '&:nth-of-type(1)': {
                    top: 0
                  },
                  '&:nth-of-type(2)': {
                    top: 12
                  },
                  '&:nth-of-type(3)': {
                    top: 12
                  },
                  '&:nth-of-type(4)': {
                    top: 24
                  }
                },
                '&.expanded': {
                  '& span': {
                    '&:nth-of-type(1), &:nth-of-type(4)': {
                      top: 15,
                      width: '0%',
                      left: '50%',
                      opacity: 0
                    },
                    '&:nth-of-type(2)': {
                      transform: 'rotate(45deg)'
                    },
                    '&:nth-of-type(3)': {
                      transform: 'rotate(-45deg)'
                    }
                  }
                }
              }}
            >
              <span />
              <span />
              <span />
              <span />
            </IconButton>
          </Box>
        </Stack>
      </Container>
    </AppBar>
  )
}

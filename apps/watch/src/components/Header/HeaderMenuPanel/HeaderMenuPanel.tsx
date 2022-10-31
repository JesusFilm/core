import { ReactElement, ReactEventHandler } from 'react'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FavoriteIcon from '@mui/icons-material/Favorite'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import CloseIcon from '@mui/icons-material/Close'
import Divider from '@mui/material/Divider'
import MuiLink from '@mui/material/Link'
import { useTheme } from '@mui/material/styles'
import Image from 'next/image'
import NextLink from 'next/link'

import logo from '../../../../public/taskbar-icon.svg'

interface HeaderMenuPanelProps {
  toggleDrawer: (anchor: string, open: boolean) => ReactEventHandler
}

export function HeaderMenuPanel({
  toggleDrawer
}: HeaderMenuPanelProps): ReactElement {
  const theme = useTheme()

  const ListLink = ({
    url,
    label
  }: {
    url: string
    label: string
  }): ReactElement => (
    <MuiLink
      href={url}
      underline="none"
      target="_blank"
      rel="noopener"
      style={{
        color: '#26262E'
      }}
    >
      <ListItemButton
        key={label}
        onClick={toggleDrawer('top', false)}
        onKeyDown={toggleDrawer('top', false)}
      >
        <ListItemText primary={label} />
      </ListItemButton>
      <Divider
        sx={{ mx: 2, [theme.breakpoints.up('md')]: { display: 'none' } }}
      />
    </MuiLink>
  )

  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: '#FFFFFF'
      }}
    >
      <Stack spacing={0.5} direction="row" justifyContent="space-between" p={5}>
        <NextLink href="/" passHref>
          <Image
            src={logo}
            width="60"
            height="40"
            alt="Watch Logo"
            style={{ cursor: 'pointer' }}
          />
        </NextLink>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={toggleDrawer('top', false)}
        >
          <CloseIcon />
        </IconButton>
      </Stack>
      <Divider />
      <Box
        sx={{
          p: 4,
          display: 'flex',
          justifyContent: 'space-between',
          [theme.breakpoints.up('md')]: {
            flexDirection: 'row'
          },
          [theme.breakpoints.down('md')]: {
            flexDirection: 'column'
          }
        }}
      >
        <List
          sx={{
            display: 'flex',
            [theme.breakpoints.up('md')]: {
              flexDirection: 'row'
            },
            [theme.breakpoints.down('md')]: {
              flexDirection: 'column'
            }
          }}
        >
          <ListLink url="https://www.jesusfilm.org/about" label="About" />
          <ListLink url="https://www.jesusfilm.org/give" label="Give" />
          <ListLink url="https://www.jesusfilm.org/partners" label="Partner" />
          <ListLink url="https://www.jesusfilm.org/tools" label="Tools" />
          <ListLink url="https://www.jesusfilm.org/blog" label="Blog" />
        </List>
        <MuiLink
          href="https://www.jesusfilm.org/how-to-help/ways-to-donate/give-now-2/?amount=&frequency=single&campaign-code=NXWJPO&designation-number=2592320&thankYouRedirect=https%3A%2F%2Fwww.jesusfilm.org%2Fcontent%2Fjf%2Fus%2Fdevelopment%2Fspecial%2Fthank-you-refer%2Fsocial-share.html"
          underline="none"
          target="_blank"
          rel="noopener"
          sx={{
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <Button startIcon={<FavoriteIcon />}>Give Now</Button>
        </MuiLink>
      </Box>
    </Box>
  )
}

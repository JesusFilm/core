import { ReactElement, KeyboardEvent, MouseEvent } from 'react'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import FavoriteIcon from '@mui/icons-material/Favorite'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import CloseIcon from '@mui/icons-material/Close'
import Divider from '@mui/material/Divider'
import MuiLink from '@mui/material/Link'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import NextLink from 'next/link'

import logo from '../../../../public/taskbar-icon.svg'

interface HeaderMenuPanelProps {
  toggleDrawer: (
    anchor: string,
    open: boolean
  ) => (event: KeyboardEvent | MouseEvent) => void
}

export function HeaderMenuPanel({
  toggleDrawer
}: HeaderMenuPanelProps): ReactElement {
  const theme = useTheme()

  const HeaderLink = ({
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
      color="#26262E"
      variant="overline2"
      onClick={toggleDrawer('top', false)}
      onKeyDown={toggleDrawer('top', false)}
    >
      {label}
      <Divider
        sx={{ pb: 3, [theme.breakpoints.up('sm')]: { display: 'none' } }}
      />
    </MuiLink>
  )

  return (
    <Paper elevation={0}>
      <Stack spacing={0.5} direction="row" justifyContent="space-between" p={8}>
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
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        p={8}
      >
        <Stack
          justifyContent="space-between"
          alignItems={{ sm: 'center' }}
          spacing={{ xs: 3, sm: 3, md: 8 }}
          direction={{ xs: 'column', sm: 'row' }}
        >
          <HeaderLink url="https://www.jesusfilm.org/about" label="About" />
          <HeaderLink url="https://www.jesusfilm.org/give" label="Give" />
          <HeaderLink
            url="https://www.jesusfilm.org/partners"
            label="Partner"
          />
          <HeaderLink url="https://www.jesusfilm.org/tools" label="Tools" />
          <HeaderLink url="https://www.jesusfilm.org/blog" label="Blog" />
        </Stack>
        <Button
          startIcon={<FavoriteIcon />}
          href="https://www.jesusfilm.org/how-to-help/ways-to-donate/give-now-2/?amount=&frequency=single&campaign-code=NXWJPO&designation-number=2592320&thankYouRedirect=https%3A%2F%2Fwww.jesusfilm.org%2Fcontent%2Fjf%2Fus%2Fdevelopment%2Fspecial%2Fthank-you-refer%2Fsocial-share.html"
          target="_blank"
          rel="noopener"
        >
          <Typography variant="overline2">Give Now</Typography>
        </Button>
      </Stack>
    </Paper>
  )
}

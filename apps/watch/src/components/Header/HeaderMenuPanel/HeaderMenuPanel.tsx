import CloseIcon from '@mui/icons-material/Close'
import FavoriteIcon from '@mui/icons-material/Favorite'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import logo from '../assets/logo.svg'

import { HeaderLinkAccordion } from './HeaderLinkAccordion'
import { headerLinks } from './headerLinks'

interface HeaderMenuPanelProps {
  onClose: () => void
}

export function HeaderMenuPanel({
  onClose
}: HeaderMenuPanelProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const [expanded, setExpanded] = useState<string | false>(false)

  const handleAccordionChange =
    (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false)
    }

  return (
    <Paper
      elevation={0}
      data-testid="HeaderMenuPanel"
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        backgroundColor: 'background.paper',
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0
      }}
    >
      <Stack spacing={0.5} direction="row" justifyContent="space-between" p={8}>
        <NextLink href="/watch">
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
        <IconButton
          color="inherit"
          aria-label="close drawer"
          edge="start"
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      </Stack>
      <Stack
        direction="column"
        justifyContent="space-between"
        p={4}
        sx={{ flexGrow: 1 }}
      >
        <Stack
          justifyContent="flex-start"
          spacing={0}
          direction="column"
          alignItems="flex-end"
        >
          {headerLinks.map((link) => (
            <HeaderLinkAccordion
              key={link.label}
              label={t(link.label)}
              url={link.url}
              expanded={expanded === link.label}
              onAccordionChange={handleAccordionChange}
              subLinks={link.subLinks?.map((subLink) => ({
                ...subLink,
                label: t(subLink.label)
              }))}
              onClose={onClose}
            />
          ))}
        </Stack>
        <Button
          startIcon={<FavoriteIcon />}
          href="https://www.jesusfilm.org/how-to-help/ways-to-donate/give-now-2/?amount=&frequency=single&campaign-code=NXWJPO&designation-number=2592320&thankYouRedirect=https%3A%2F%2Fwww.jesusfilm.org%2Fcontent%2Fjf%2Fus%2Fdevelopment%2Fspecial%2Fthank-you-refer%2Fsocial-share.html"
          rel="noopener"
        >
          <Typography variant="overline2">{t('Give Now')}</Typography>
        </Button>
      </Stack>
    </Paper>
  )
}

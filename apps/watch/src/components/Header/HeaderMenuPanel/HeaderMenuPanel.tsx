import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
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
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        backgroundColor: 'background.paper',
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        borderTopLeftRadius: { xs: 0, sm: 4 },
        borderBottomLeftRadius: { xs: 0, sm: 4 }
      }}
    >
      <Stack
        spacing={2}
        direction="row"
        sx={{
          height: { xs: 100, sm: 160 },
          px: 6,
          alignItems: 'center',
          justifyContent: { xs: 'space-between', sm: 'flex-end' }
        }}
      >
        <Box
          sx={{
            display: { xs: 'flex', sm: 'none' }
          }}
        >
          <NextLink href="/watch">
            <Image
              src={logo}
              width="126"
              height="40"
              alt="Watch Logo"
              style={{
                cursor: 'pointer',
                maxWidth: '100%',
                height: 'auto'
              }}
            />
          </NextLink>
        </Box>
        <Stack
          direction="row"
          spacing={2}
          justifyContent="flex-end"
          alignItems="center"
          py={8}
        >
          <Button
            href="https://www.jesusfilm.org/how-to-help/ways-to-donate/give-now-2/?amount=&frequency=single&campaign-code=NXWJPO&designation-number=2592320&thankYouRedirect=https%3A%2F%2Fwww.jesusfilm.org%2Fcontent%2Fjf%2Fus%2Fdevelopment%2Fspecial%2Fthank-you-refer%2Fsocial-share.html"
            rel="noopener"
            variant="contained"
            sx={{
              height: 34,
              minWidth: 100,
              px: 4,
              borderRadius: 4,
              '&:hover': {
                backgroundColor: 'background.paper',
                color: 'primary.main',
                border: '1px solid',
                borderColor: 'primary.main',
                boxShadow: 'none'
              }
            }}
          >
            <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
              {t('Give Now')}
            </Typography>
          </Button>
          <IconButton
            color="inherit"
            aria-label="close drawer"
            edge="start"
            onClick={onClose}
            sx={{ width: 40, height: 40 }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </Stack>
      <Stack
        direction="column"
        justifyContent="space-between"
        py={4}
        sx={{ flexGrow: 1 }}
      >
        <Stack
          justifyContent="flex-start"
          direction="column"
          sx={{
            gap: 2
          }}
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
      </Stack>
    </Paper>
  )
}

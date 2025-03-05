import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
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
        backgroundColor: 'background.default',
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
          height: { xs: 100, sm: 159 },
          px: { xs: 8, xl: 3 },
          pt: { xs: 0, sm: 10 },
          alignItems: 'center',
          justifyContent: { xs: 'space-between', sm: 'flex-end' }
        }}
      >
        <Box sx={{ display: { xs: 'flex', sm: 'none' } }}>
          <NextLink href="/watch">
            <Image
              src={logo}
              width="126"
              height="40"
              alt="Watch Logo"
              style={{ cursor: 'pointer', maxWidth: '100%', height: 'auto' }}
            />
          </NextLink>
        </Box>
        <Stack
          direction="row"
          spacing={2}
          justifyContent="flex-end"
          alignItems="center"
          pb={6.5}
          pr={14}
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
            <Typography
              variant="h6"
              sx={{ fontSize: 15, fontWeight: 'bold', lineHeight: 1 }}
            >
              {t('Give Now')}
            </Typography>
          </Button>
        </Stack>
      </Stack>
      <Stack
        direction="column"
        justifyContent="space-between"
        sx={{ flexGrow: 1, py: { xs: 17, md: 2, xl: 0 } }}
      >
        <Stack
          justifyContent="flex-start"
          direction="column"
          sx={{ gap: { xs: 2, sm: 1 } }}
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

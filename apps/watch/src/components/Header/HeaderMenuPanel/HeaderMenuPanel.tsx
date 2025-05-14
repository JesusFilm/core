import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

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
        borderRadius: 0,
        position: 'relative'
      }}
    >
      <Box
        sx={{
          height: { xs: 100, lg: 159 },
          width: '100%'
        }}
      >
        <Box
          sx={{
            height: { xs: 100, lg: 159 },
            pr: 20,
            py: 10,
            pt: { lg: '69px' },
            pb: { lg: 14 },
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            position: 'fixed',
            width: { xs: '100%', lg: 530 },
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: 'background.default',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: '100%',
              width: '100vw',
              backgroundColor: 'background.default'
            }
          }}
        >
          <Button
            href="https://www.jesusfilm.org/how-to-help/ways-to-donate/give-now-2/?amount=&frequency=single&campaign-code=NXWJPO&designation-number=2592320&thankYouRedirect=https%3A%2F%2Fwww.jesusfilm.org%2Fcontent%2Fjf%2Fus%2Fdevelopment%2Fspecial%2Fthank-you-refer%2Fsocial-share.html"
            rel="noopener"
            variant="contained"
            sx={{
              height: 34,
              px: 3.5,
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
              {t('Give Now', { lng: 'en' })}
            </Typography>
          </Button>
        </Box>
      </Box>
      <Stack
        direction="column"
        justifyContent="space-between"
        sx={{ flexGrow: 1, py: { xs: 17, md: 2, xl: 0 } }}
      >
        <Stack
          justifyContent="flex-start"
          direction="column"
          sx={{ gap: { xs: '8px' } }}
        >
          {headerLinks.map((link) => (
            <HeaderLinkAccordion
              key={link.label}
              label={t(link.label, { lng: 'en' })}
              url={link.url}
              expanded={expanded === link.label}
              onAccordionChange={handleAccordionChange}
              subLinks={link.subLinks?.map((subLink) => ({
                ...subLink,
                label: t(subLink.label, { lng: 'en' })
              }))}
              onClose={onClose}
            />
          ))}
        </Stack>
      </Stack>
    </Paper>
  )
}

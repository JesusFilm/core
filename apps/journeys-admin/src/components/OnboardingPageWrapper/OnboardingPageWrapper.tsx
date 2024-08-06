import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import { SxProps, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { User } from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { ReactElement, ReactNode, useState } from 'react'
import { use100vh } from 'react-div-100vh'

import { HelpScoutBeacon } from '../HelpScoutBeacon'
import { LanguageSwitcher } from '../LanguageSwitcher'

import { OnboardingDrawer } from './OnboardingDrawer'

interface OnboardingPageWrapperProps {
  title?: string
  emailSubject: string
  children: ReactNode
  user?: User
}

export function OnboardingPageWrapper({
  title,
  emailSubject,
  children,
  user
}: OnboardingPageWrapperProps): ReactElement {
  const [open, setOpen] = useState(false)
  const viewportHeight = use100vh()
  const theme = useTheme()

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      sx={{
        height: viewportHeight ?? '100vh',
        backgroundColor: { xs: 'background.default', md: 'background.paper' }
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          right: { xs: 12, sm: 8, md: 28 },
          top: { xs: 16, sm: 8, md: 24 }
        }}
      >
        <HelpScoutBeacon
          userInfo={{
            name: user?.displayName ?? '',
            email: user?.email ?? ''
          }}
        />
      </Box>
      <OnboardingDrawer />
      <Stack
        justifyContent="safe center"
        alignItems="center"
        gap={12}
        sx={{
          m: { xs: 0, sm: 4 },
          ml: { xs: 0, md: 0 },
          pt: 8,
          overflowY: 'auto',
          flexGrow: 1,
          borderColor: 'divider',
          borderWidth: 'medium',
          borderRadius: { xs: 2, sm: 4 },
          borderStyle: { xs: 'none', sm: 'solid' },
          backgroundColor: { xs: 'background.paper', md: 'background.default' }
        }}
        data-testid="JourneysAdminOnboardingPageWrapper"
      >
        <Typography
          variant="h2"
          textAlign="center"
          sx={{
            display: { xs: 'none', sm: 'flex' },
            overflowWrap: 'break-word'
          }}
        >
          {title}
        </Typography>
        <Stack
          alignItems="center"
          sx={{
            flexGrow: { xs: 1, sm: 0 },
            maxWidth: { xs: '100%', sm: 397 }
          }}
        >
          <Card
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              p: 4,
              borderBottomLeftRadius: { xs: 0, sm: 8 },
              borderBottomRightRadius: { xs: 0, sm: 8 },
              width: { xs: '100vw', sm: 418 },
              [theme.breakpoints.down('md')]: {
                boxShadow: 'none'
              }
            }}
          >
            <CardContent
              sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 4
              }}
            >
              {children}
            </CardContent>
            <CardActions
              sx={{
                display: {
                  xs: 'flex',
                  sm: 'none'
                },
                mb: 5,
                justifyContent: 'center'
              }}
            >
              <OnboardingUtilities
                open={open}
                setOpen={setOpen}
                emailSubject={emailSubject}
              />
            </CardActions>
          </Card>
        </Stack>
        <OnboardingUtilities
          open={open}
          setOpen={setOpen}
          emailSubject={emailSubject}
          sx={{
            display: { xs: 'none', sm: 'flex' },
            pb: 10
          }}
        />
      </Stack>
    </Stack>
  )
}

interface OnboardingUtilitiesProps {
  open: boolean
  setOpen: (open: boolean) => void
  emailSubject: string
  sx?: SxProps
}

function OnboardingUtilities({
  open,
  setOpen,
  emailSubject,
  sx
}: OnboardingUtilitiesProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        gap={4}
        sx={{ ...sx }}
      >
        <Button size="small">
          <Typography
            variant="body2"
            sx={{ color: 'primary.main', cursor: 'pointer' }}
            component="a"
            href={`mailto:support@nextstep.is?subject=${emailSubject}`}
          >
            {t('Feedback & Support')}
          </Typography>
        </Button>
        <Button size="small" onClick={() => setOpen(true)}>
          <Typography variant="body2">{t('Language')}</Typography>
        </Button>
      </Stack>
      {open && (
        <LanguageSwitcher open={open} handleClose={() => setOpen(false)} />
      )}
    </>
  )
}

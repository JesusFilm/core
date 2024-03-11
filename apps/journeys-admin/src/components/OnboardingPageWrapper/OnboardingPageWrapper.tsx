import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, ReactNode, useState } from 'react'
import { use100vh } from 'react-div-100vh'

import { LanguageSwitcher } from '../LanguageSwitcher'

import { OnboardingDrawer } from './OnboardingDrawer'

interface OnboardingPageWrapperProps {
  title: string
  emailSubject: string
  children: ReactNode
}

export function OnboardingPageWrapper({
  title,
  emailSubject,
  children
}: OnboardingPageWrapperProps): ReactElement {
  const [open, setOpen] = useState(false)
  const viewportHeight = use100vh()

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      sx={{
        backgroundColor: { xs: 'background.default', md: 'background.paper' },
        height: viewportHeight ?? '100vh',
        overflow: 'hidden'
      }}
    >
      <OnboardingDrawer />
      <Stack
        justifyContent="center"
        alignItems="center"
        gap={10}
        sx={{
          height: '100vh',
          flexGrow: 1,
          borderTopLeftRadius: { xs: 16, sm: 24, md: 30 },
          borderBottomLeftRadius: { xs: 0, md: 30 },
          borderTopRightRadius: { xs: 16, sm: 24, md: 0 },
          borderLeftStyle: { xs: null, md: 'solid' },
          borderTopStyle: { xs: 'solid', md: null },
          borderColor: 'divider',
          backgroundColor: 'background.default'
        }}
        data-testid="OnboardingPageWrapper"
      >
        <Typography variant="h1" sx={{ display: { xs: 'none', md: 'flex' } }}>
          {title}
        </Typography>
        <Stack sx={{ maxWidth: { xs: '100%', sm: 397 } }}>
          <Card
            sx={{
              height: { xs: '100vh', sm: 'inherit' },
              width: { xs: '100vw', sm: 397 },
              maxWidth: { xs: '100%', sm: 397 },
              borderRadius: { xs: 4, sm: 2 }
            }}
          >
            <CardContent
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                p: 6,
                pt: 7
              }}
            >
              {children}
              <OnboardingUtilities
                open={open}
                setOpen={setOpen}
                emailSubject={emailSubject}
                sx={{
                  display: { xs: 'flex', sm: 'none' }
                }}
              />
            </CardContent>
          </Card>
        </Stack>
        <OnboardingUtilities
          open={open}
          setOpen={setOpen}
          emailSubject={emailSubject}
          sx={{
            display: { xs: 'none', sm: 'flex' }
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

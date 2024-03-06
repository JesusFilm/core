import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, ReactNode, useState } from 'react'

import { LanguageSwitcher } from '../LanguageSwitcher'

import { OnboardingSideBar } from './OnboardingSideBar'

interface OnboardingPageWrapperProps {
  emailSubject: string
  children: ReactNode
}

export function OnboardingPageWrapper({
  emailSubject,
  children
}: OnboardingPageWrapperProps): ReactElement {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Stack direction="row" sx={{ backgroundColor: 'background.paper' }}>
      <OnboardingSideBar />
      <Stack
        justifyContent="space-evenly"
        alignItems="center"
        sx={{
          height: '100vh',
          minHeight: '600px',
          flexGrow: 1,
          borderTopLeftRadius: 30,
          borderBottomLeftRadius: 30,
          borderLeftStyle: 'solid',
          borderColor: 'divider',
          backgroundColor: 'background.default'
        }}
        data-testid="JourneysAdminOnboardingPageWrapper"
      >
        <Stack alignItems="center" sx={{ maxWidth: { xs: 311, md: 397 } }}>
          {children}
        </Stack>
        <Stack direction="row" alignItems="center" gap={4}>
          <Link
            variant="body2"
            underline="none"
            sx={{
              color: 'primary.main',
              cursor: 'pointer'
            }}
            href={`mailto:support@nextstep.is?subject=${emailSubject}`}
          >
            {t('Feedback & Support')}
          </Link>
          <Button size="small" onClick={() => setOpen(true)}>
            <Typography variant="body2">{t('Language')}</Typography>
          </Button>
        </Stack>
        {open && (
          <LanguageSwitcher open={open} handleClose={() => setOpen(false)} />
        )}
      </Stack>
    </Stack>
  )
}

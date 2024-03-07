import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, ReactNode, useState } from 'react'
import { use100vh } from 'react-div-100vh'

import { LanguageSwitcher } from '../LanguageSwitcher'

import { OnboardingDrawer } from './OnboardingDrawer'

interface OnboardingPageWrapperProps {
  emailSubject: string
  children: ReactNode
}

export function OnboardingPageWrapper({
  emailSubject,
  children
}: OnboardingPageWrapperProps): ReactElement {
  const [open, setOpen] = useState(false)
  const viewportHeight = use100vh()
  const { t } = useTranslation('apps-journeys-admin')

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
        justifyContent="space-evenly"
        alignItems="center"
        sx={{
          height: '100vh',
          flexGrow: 1,
          borderTopLeftRadius: { xs: 24, md: 30 },
          borderBottomLeftRadius: { xs: 0, md: 30 },
          borderTopRightRadius: { xs: 24, md: 0 },
          borderLeftStyle: { xs: null, md: 'solid' },
          borderTopStyle: { xs: 'solid', md: null },
          borderColor: 'divider',
          backgroundColor: { xs: 'background.paper', md: 'background.default' }
        }}
        data-testid="OnboardingPageWrapper"
      >
        <Stack alignItems="center" sx={{ maxWidth: { xs: '100%', sm: 397 } }}>
          {children}
        </Stack>
        <Stack
          direction="row"
          alignItems="center"
          gap={4}
          sx={{ display: { xs: 'none', sm: 'block' } }}
        >
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

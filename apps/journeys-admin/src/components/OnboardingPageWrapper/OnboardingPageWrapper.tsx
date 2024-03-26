import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { ReactElement, ReactNode, useState } from 'react'

import taskbarIcon from '../../../public/taskbar-icon.svg'
import { LanguageSwitcher } from '../LanguageSwitcher'

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
    <Stack
      justifyContent="space-evenly"
      alignItems="center"
      sx={{ height: '100vh', minHeight: '600px' }}
      data-testid="JourneysAdminOnboardingPageWrapper"
    >
      <Stack alignItems="center" sx={{ maxWidth: { xs: 311, md: 397 } }}>
        <Box sx={{ mb: 10, flexShrink: 0 }}>
          <Image
            src={taskbarIcon}
            alt="Next Steps"
            height={43}
            width={43}
            style={{
              maxWidth: '100%',
              height: 'auto'
            }}
          />
        </Box>
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
  )
}

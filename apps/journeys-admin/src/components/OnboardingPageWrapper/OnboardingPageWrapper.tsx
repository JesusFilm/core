import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Image from 'next/image'
import { ReactElement, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import taskbarIcon from '../../../public/taskbar-icon.svg'

interface OnboardingPageWrapperProps {
  email: string
  children: ReactNode
}

export function OnboardingPageWrapper({
  email,
  children
}: OnboardingPageWrapperProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Stack
      justifyContent="space-evenly"
      alignItems="center"
      sx={{ height: '100vh', minHeight: '600px' }}
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
      <Link
        variant="body2"
        underline="none"
        sx={{
          color: 'primary.main',
          cursor: 'pointer'
        }}
        href={`mailto:${email}?subject=A question about the terms and conditions form`}
      >
        {t('Feedback & Support')}
      </Link>
    </Stack>
  )
}

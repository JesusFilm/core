import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { TemplateActionButton } from '../TemplateViewHeader/TemplateActionButton'

interface TemplateFooterProps {
  signedIn?: boolean
}

export function TemplateFooter({
  signedIn
}: TemplateFooterProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')

  return (
    <Stack
      data-testid="TemplateFooter"
      sx={{
        alignItems: 'center',
        gap: 6,
        py: 9
      }}
    >
      <Typography
        variant="subtitle1"
        align="center"
        sx={{
          display: { xs: 'none', sm: 'block' }
        }}
      >
        {t('Use this template to make it your journey')}
      </Typography>
      <Typography
        variant="subtitle2"
        align="center"
        sx={{
          display: { xs: 'block', sm: 'none' }
        }}
      >
        {t('Use this template to make it your journey')}
      </Typography>
      <TemplateActionButton signedIn={signedIn} />
    </Stack>
  )
}

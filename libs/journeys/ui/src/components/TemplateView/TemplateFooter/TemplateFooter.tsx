import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { TemplateActionButton } from '../TemplateViewHeader/TemplateActionButton'

interface TemplateFooterProps {
  signedIn?: boolean
  displayOpenTeamDialog?: boolean
}

export function TemplateFooter({
  signedIn,
  displayOpenTeamDialog = true
}: TemplateFooterProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')

  return (
    <Stack
      alignItems="center"
      gap={6}
      sx={{ py: 9 }}
      data-testid="TemplateFooter"
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
      <TemplateActionButton signedIn={signedIn} displayOpenTeamDialog={displayOpenTeamDialog} />
    </Stack>
  )
}

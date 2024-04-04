import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { CreateJourneyButton } from '../CreateJourneyButton'

interface TemplateFooterProps {
  signedIn?: boolean
}

export function TemplateFooter({
  signedIn
}: TemplateFooterProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [openTeamDialog, setOpenTeamDialog] = useState(false)

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
      <CreateJourneyButton
        signedIn={signedIn}
        openTeamDialog={openTeamDialog}
        setOpenTeamDialog={setOpenTeamDialog}
      />
    </Stack>
  )
}

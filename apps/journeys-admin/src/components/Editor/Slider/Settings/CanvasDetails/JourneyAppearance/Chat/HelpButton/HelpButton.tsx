import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import LinkExternal from '@core/shared/ui/icons/LinkExternal'

export function HelpButton(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  function handleClick(): void {
    window.open(
      'https://support.nextstep.is/article/1356-hosted-by-and-chat-widget',
      '_blank'
    )
  }
  return (
    <Stack sx={{ px: 6, pb: 4 }}>
      <Card
        variant="outlined"
        sx={{ borderRadius: 2 }}
        data-testid="JourneysAdminHelpButton"
      >
        <CardActionArea onClick={handleClick}>
          <Stack
            direction="row"
            alignItems="center"
            sx={{ px: 4, py: 3, color: 'secondary.main' }}
            justifyContent="space-between"
          >
            <Typography variant="caption" color="secondary.main">
              {t('Learn how to get your direct chat link for any platform')}
            </Typography>
            <Stack color="secondary.light">
              <LinkExternal />
            </Stack>
          </Stack>
        </CardActionArea>
      </Card>
    </Stack>
  )
}

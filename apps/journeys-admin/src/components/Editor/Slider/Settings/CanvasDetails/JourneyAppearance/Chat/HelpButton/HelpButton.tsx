import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import Icon from '@mui/material/Icon'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'

import LinkExternal from '@core/shared/ui/icons/LinkExternal'
import { ReactElement } from 'react'

export function HelpButton(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  function handleClick(): void {
    window.open(
      'https://support.nextstep.is/article/1356-hosted-by-and-chat-widget',
      '_blank'
    )
  }
  return (
    <Card
      variant="outlined"
      sx={{ borderRadius: 2 }}
      data-testid="JourneysAdminHelpButton"
    >
      <CardActionArea onClick={handleClick}>
        <Stack
          direction="row"
          alignItems="center"
          sx={{ px: 4, py: 3 }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="caption">
              {t('Learn how to get your direct chat link for any platform')}
            </Typography>
          </Box>
          <LinkExternal />
        </Stack>
      </CardActionArea>
    </Card>
  )
}

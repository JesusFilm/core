import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

function VideosSubHeroStats(): ReactElement {
  const { t } = useTranslation('apps-watch')
  return (
    <Stack
      direction="row"
      spacing={10}
      sx={{ justifyContent: { md: 'flex-end' } }}
      data-testid="VideosSubHeroStats"
    >
      <Box>
        <Typography variant="h3">{t('724')}</Typography>
        <Typography variant="overline">{t('Videos')}</Typography>
      </Box>
      <Box>
        <Typography variant="h3">{t('2,042')}</Typography>
        <Typography variant="overline">{t('Languages')}</Typography>
      </Box>
    </Stack>
  )
}

export function VideosSubHero(): ReactElement {
  const { t } = useTranslation('apps-watch')
  return (
    <Stack
      py={12}
      direction={{ xs: 'column-reverse', sm: 'row' }}
      spacing={9}
      data-testid="VideosSubHero"
    >
      <Box flex={1}>
        <Typography variant="subtitle1">
          {t(
            'We believe film is the most dynamic way to hear and see the greatest ' +
              'story ever lived — so we are driven to bring Christ-centered video to ' +
              'the ends of the earth.'
          )}
        </Typography>
      </Box>
      <Box flex={1}>
        <VideosSubHeroStats />
      </Box>
    </Stack>
  )
}

export default VideosSubHero

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, useMemo } from 'react'

import { usePreferredLocale } from '../../libs/locale'
import { DEFAULT_LOCALE, LANGUAGE_MAPPINGS } from '../../libs/localeMapping'

export function LocaleSuggestionBanner(): ReactElement | null {
  const router = useRouter()
  const { t } = useTranslation('apps-watch')
  const preferredLocale = usePreferredLocale()

  const currentLocale = useMemo(
    () => router.locale ?? router.defaultLocale ?? DEFAULT_LOCALE,
    [router.defaultLocale, router.locale]
  )

  if (preferredLocale == null || preferredLocale === currentLocale) return null

  const localeDetails = LANGUAGE_MAPPINGS[preferredLocale]

  if (localeDetails == null) return null

  const handleSwitchLocale = () => {
    void router.push(router.asPath, router.asPath, { locale: preferredLocale })
  }

  return (
    <Box
      data-testid="LocaleSuggestionBanner"
      sx={{
        width: '100%',
        backgroundColor: 'primary.dark',
        color: 'common.white',
        px: { xs: 4, sm: 6 },
        py: 2
      }}
    >
      <Container maxWidth="xl" disableGutters>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="center"
          textAlign="center"
        >
          <Typography variant="body2" component="span">
            {t('localeSuggestion.message', {
              localeName: localeDetails.nativeName
            })}
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleSwitchLocale}
            sx={{ alignSelf: { xs: 'center', sm: 'auto' } }}
          >
            {t('localeSuggestion.action', {
              localeName: localeDetails.nativeName
            })}
          </Button>
        </Stack>
      </Container>
    </Box>
  )
}

import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { GetServerSideProps } from 'next'
import Image from 'next/image'
import { useTranslation } from 'next-i18next/pages'
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import { getLocaleRTL } from '@core/shared/ui/rtl'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import { ThemeMode, ThemeName } from '../../../__generated__/globalTypes'
import i18nConfig from '../../../next-i18next.config'
import logo from '../../../public/logo.svg'

function AboutChatPage(): ReactElement {
  const { t, i18n } = useTranslation('apps-journeys')
  // Flip layout direction for RTL languages (ar, ur, fa, …) so translated
  // copy reads correctly. `i18n.language` is the locale resolved by
  // getServerSideProps below; it can be undefined when the component renders
  // outside appWithTranslation (tests), so default to LTR.
  const dir = getLocaleRTL(i18n.language ?? '') ? 'rtl' : 'ltr'

  return (
    <>
      {/* `_app.tsx` sets titleTemplate '%s | Next Steps', so pass the bare
          page title here — the template appends the site name centrally. */}
      <NextSeo title={t('About this chat')} nofollow noindex />
      <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
        <Container maxWidth="sm" dir={dir} data-testid="AboutChatPage">
          <Stack spacing={5} py={{ xs: 5, sm: 7 }}>
            <Image
              src={logo}
              alt="Next Steps"
              height={48}
              width={107}
              style={{
                maxWidth: '100%',
                height: 'auto',
                alignSelf: 'center'
              }}
            />
            <Stack spacing={4} component="article">
              <Stack spacing={2}>
                <Typography variant="h4" component="h1">
                  {t('About this chat')}
                </Typography>
                <Typography variant="body1">
                  {t(
                    'The chat on this journey is powered by an AI assistant. To help us improve future replies, the messages you send and the assistant’s replies are saved.'
                  )}
                </Typography>
                <Typography variant="body1">
                  {t(
                    'We do not save your name, email address, or any account details, and we do not link conversations to your identity.'
                  )}
                </Typography>
              </Stack>
              <Stack spacing={1.5}>
                <Typography variant="h5" component="h2">
                  {t('Where the messages go')}
                </Typography>
                <Typography variant="body1">
                  {t(
                    'Your messages and the assistant’s replies pass through two third-party services: an AI service that generates the replies, and an analytics service called Langfuse where the conversations are stored so the team can review them in aggregate to improve the experience. They are not sold and they are not used for advertising.'
                  )}
                </Typography>
              </Stack>
              <Stack spacing={1.5}>
                <Typography variant="h5" component="h2">
                  {t('If you prefer not to take part')}
                </Typography>
                <Typography variant="body1">
                  {t(
                    'There is no chat-specific opt-out today. If you would rather not have your messages saved, please do not use the chat — the rest of the journey works without it.'
                  )}
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {t('Last updated: June 2026')}
              </Typography>
            </Stack>
          </Stack>
        </Container>
      </ThemeProvider>
    </>
  )
}

// The journey viewer translates its UI by `journey.language.bcp47`, not by
// URL locale — and the chat surfaces link here without a locale prefix, so
// `context.locale` is always `en`. The links carry the journey language as
// `?lang=<bcp47>` instead (NES-1724); resolve translations from it exactly
// the way the journey page does, with the i18n config's `fallbackLng`
// mapping short codes (es → es-ES) and falling back to English for
// languages without translation files.
//
// `lang` is untrusted query input that ends up in i18next's filesystem
// loader, so only accept values shaped like a BCP-47 tag.
const LANG_PARAM_PATTERN = /^[a-z]{2,3}(-[a-z0-9]{2,8}){0,4}$/i

export const getServerSideProps: GetServerSideProps = async (context) => {
  const langParam = context.query.lang
  const lang =
    typeof langParam === 'string' && LANG_PARAM_PATTERN.test(langParam)
      ? langParam
      : undefined

  return {
    props: {
      ...(await serverSideTranslations(
        lang ?? context.locale ?? 'en',
        ['apps-journeys', 'libs-journeys-ui'],
        i18nConfig
      ))
    }
  }
}

export default AboutChatPage

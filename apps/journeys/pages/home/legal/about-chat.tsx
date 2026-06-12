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
  // Direction must follow the words actually rendered, not the requested
  // language (NES-1731): an untranslated RTL language falls back to English
  // text and must render LTR — never RTL-aligned English. Bundle-level
  // checks aren't enough: a partially translated locale (e.g. ur-PK before
  // its Crowdin round-trip) has a non-empty bundle while this page's strings
  // still fall back to their English keys. The page title is the sentinel —
  // keys ARE the English source strings, so t() returning the key verbatim
  // means the page is rendering the English fallback.
  const title = t('About this chat')
  const dir =
    title !== 'About this chat' && getLocaleRTL(i18n.language ?? '')
      ? 'rtl'
      : 'ltr'

  return (
    <>
      {/* `_app.tsx` sets titleTemplate '%s | Next Steps', so pass the bare
          page title here — the template appends the site name centrally. */}
      <NextSeo title={title} nofollow noindex />
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
                  {title}
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

// Language tags are case-insensitive by spec, but the folder lookup below is
// case-exact — canonicalize before resolving: 'ES' → 'es', 'AR-sa' → 'ar-SA',
// 'zh-hans-cn' → 'zh-Hans-CN' (NES-1729).
function canonicalizeLangParam(value: string): string {
  const [language, ...subtags] = value.split('-')
  return [
    language.toLowerCase(),
    ...subtags.map((subtag) => {
      if (subtag.length === 2) return subtag.toUpperCase()
      if (subtag.length === 4)
        return subtag[0].toUpperCase() + subtag.slice(1).toLowerCase()
      return subtag.toLowerCase()
    })
  ].join('-')
}

// Journeys store short language codes (`ar`, `pt`) while the translation
// folders in libs/locales are named with full region tags (`ar-SA`, `pt-BR`)
// — resolve every short code to the folder that actually holds its files
// (NES-1731). Tags not listed here pass through unchanged and either match a
// folder directly (`ar-SA`) or fall back to English. The journeys i18n
// config's own fallbackLng only covers 9 of these, so this map is the single
// source of resolution for the `lang` param.
const LANG_FOLDER_BY_LANGUAGE: Record<string, string> = {
  am: 'am-ET',
  ar: 'ar-SA',
  bn: 'bn-BD',
  de: 'de-DE',
  es: 'es-ES',
  fr: 'fr-FR',
  hi: 'hi-IN',
  id: 'id-ID',
  ja: 'ja-JP',
  ko: 'ko-KR',
  ms: 'ms-MY',
  my: 'my-MM',
  ne: 'ne-NP',
  pt: 'pt-BR',
  ru: 'ru-RU',
  th: 'th-TH',
  tl: 'tl-PH',
  tr: 'tr-TR',
  ur: 'ur-PK',
  vi: 'vi-VN',
  zh: 'zh-Hans-CN',
  'zh-Hant': 'zh-Hant-TW'
}

// Real journey languages are mostly dialect tags — the languages API has 24
// Arabic entries and only one is plain `ar`; the rest look like `ar-afb`
// (Gulf), `ar-aec` (Saidi), `ar-arb-EG` (MSA Egyptian). Walk the tag from
// most- to least-specific so every `ar-*` dialect resolves to the Arabic
// translations (and `zh-Hant-TW` still hits `zh-Hant` before `zh`).
function resolveLangFolder(canonical: string): string {
  const subtags = canonical.split('-')
  for (let length = subtags.length; length >= 1; length--) {
    const folder = LANG_FOLDER_BY_LANGUAGE[subtags.slice(0, length).join('-')]
    if (folder != null) return folder
  }
  return canonical
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const langParam = context.query.lang
  const canonical =
    typeof langParam === 'string' && LANG_PARAM_PATTERN.test(langParam)
      ? canonicalizeLangParam(langParam)
      : undefined
  const lang = canonical != null ? resolveLangFolder(canonical) : undefined

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

import Container from '@mui/material/Container'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { GetStaticProps } from 'next'
import Image from 'next/image'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next/pages'
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import { ThemeMode, ThemeName } from '../../../__generated__/globalTypes'
import i18nConfig from '../../../next-i18next.config'
import logo from '../../../public/logo.svg'

function AboutChatPage(): ReactElement {
  const { t } = useTranslation('apps-journeys')

  return (
    <>
      <NextSeo title={t('About this chat | Next Steps')} nofollow noindex />
      <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
        <Container maxWidth="sm">
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
            <Stack spacing={3} component="article">
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
              <Typography variant="h6" component="h2">
                {t('Where the messages go')}
              </Typography>
              <Typography variant="body1">
                {t(
                  'Your messages and the assistant’s replies pass through two third-party services: an AI service that generates the replies, and an analytics service called Langfuse where the conversations are stored so the team can review them in aggregate to improve the experience. They are not sold and they are not used for advertising.'
                )}
              </Typography>
              <Typography variant="h6" component="h2">
                {t('If you prefer not to take part')}
              </Typography>
              <Typography variant="body1">
                {t(
                  'There is no chat-specific opt-out today. If you would rather not have your messages saved, please do not use the chat — the rest of the journey works without it.'
                )}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('Last updated: June 2026')}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Link
                component={NextLink}
                href="/"
                underline="none"
                variant="body2"
              >
                {t('Back to Next Steps')}
              </Link>
            </Stack>
          </Stack>
        </Container>
      </ThemeProvider>
    </>
  )
}

export const getStaticProps: GetStaticProps = async (context) => ({
  props: {
    ...(await serverSideTranslations(
      context.locale ?? 'en',
      ['apps-journeys', 'libs-journeys-ui'],
      i18nConfig
    ))
  }
})

export default AboutChatPage

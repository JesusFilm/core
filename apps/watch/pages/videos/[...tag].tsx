import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { GetStaticProps } from 'next'
import { SSRConfig } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'
import { PageWrapper } from '../../src/components/PageWrapper'
import {
  darkTheme,
  DarkThemeProvider
} from '../../src/components/ThemeProvider/ThemeProvider'
import { Videos } from '../../src/components/Videos/Videos'
import { LanguageProvider } from '../../src/libs/languageContext/LanguageContext'
import { routeParser } from '../../src/libs/routeParser/routeParser'
import i18nConfig from '../../next-i18next.config'

function VideoSearchPage(): ReactElement {
  const router = useRouter()
  const locale = router.locale ?? router.defaultLocale
  const { tag } = router.query
  const { routes, tags, audioLanguage, subtitleLanguage } = routeParser(tag)

  return (
    <DarkThemeProvider>
      <LanguageProvider>
        <PageWrapper />
        <Container
          maxWidth="xl"
          style={{
            position: 'absolute',
            top: 100,
            paddingLeft: 100,
            paddingRight: 100,
            margin: 0
          }}
        >
          <style jsx global>{`
            body {
              background: ${darkTheme.palette.background.default};
              color: ${darkTheme.palette.text.primary};
            }
          `}</style>

          <Typography variant="h4">Videos</Typography>
          <Videos />
          <Box mt="3rem">
            <div>Locale - {locale} </div>
            <div>SeoFriendlyTag - {routes?.join('/')}</div>
            <div>Tags - {tags.join(' ')}</div>
            <div>AudioLanguange - {audioLanguage}</div>
            <div>SubtitleLanguage - {subtitleLanguage}</div>
          </Box>
        </Container>
      </LanguageProvider>
    </DarkThemeProvider>
  )
}

export const getStaticProps: GetStaticProps<SSRConfig> = async (context) => {
  return {
    props: {
      ...(await serverSideTranslations(
        context.locale ?? 'en',
        ['apps-watch'],
        i18nConfig
      ))
    }
  }
}

export default VideoSearchPage

import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'
import { PageWrapper } from '../../src/components/PageWrapper'
import { Videos } from '../../src/components/Videos/Videos'
import { LanguageProvider } from '../../src/libs/languageContext/LanguageContext'
import { routeParser } from '../../src/libs/routeParser/routeParser'

function VideoPage(): ReactElement {
  const router = useRouter()
  const locale = router.locale ?? router.defaultLocale
  const { tag } = router.query
  const { routes, tags, audioLanguage, subtitleLanguage } = routeParser(tag)
  const theme = useTheme()

  return (
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
            background: ${theme.palette.background.default};
            color: ${theme.palette.text.primary};
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
  )
}

export default VideoPage

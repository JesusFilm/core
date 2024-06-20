import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { ReactElement } from 'react'

import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import i18nConfig from '../../next-i18next.config'
import { getFlags } from '../../src/libs/getFlags'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { TemplateGallery } from '@core/journeys/ui/TemplateGallery'
import { Stack } from '@mui/system'
import { PageWrapper } from '../../src/components/PageWrapper'

function JourneysPage(): ReactElement {
  return (
    <PageWrapper>
      <Box
        sx={{ backgroundColor: 'background.default', overflow: 'hidden' }}
        data-testid="JourneysPage"
      >
        <Container maxWidth="xxl" sx={{ paddingY: '4rem' }}>
          <Stack gap={10}>
            <ThemeProvider
              themeName={ThemeName.journeysAdmin}
              themeMode={ThemeMode.light}
              nested
            >
              <TemplateGallery />
            </ThemeProvider>
          </Stack>
        </Container>
      </Box>
    </PageWrapper>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const flags = await getFlags()

  if (flags.journeys !== true)
    return {
      revalidate: 60,
      redirect: '/',
      props: {}
    }

  return {
    revalidate: 60,
    props: {
      flags,
      ...(await serverSideTranslations(
        locale ?? 'en',
        ['apps-watch'],
        i18nConfig
      ))
    }
  }
}

export default JourneysPage

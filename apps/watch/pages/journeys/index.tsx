import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/system/Stack'
import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { ReactElement } from 'react'

import { TemplateGallery } from '@core/journeys/ui/TemplateGallery'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import i18nConfig from '../../next-i18next.config'
import { PageWrapper } from '../../src/components/PageWrapper'
import { getFlags } from '../../src/libs/getFlags'

function JourneysPage(): ReactElement {
  return (
    <PageWrapper>
      <Box
        sx={{ backgroundColor: 'background.default' }}
        data-testid="JourneysPage"
      >
        <Container maxWidth="xxl">
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

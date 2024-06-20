import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { TemplateView } from '@core/journeys/ui/TemplateView'
import {
  GetJourney,
  GetJourneyVariables
} from '@core/journeys/ui/useJourneyQuery/__generated__/GetJourney'
import {
  GET_JOURNEY,
  useJourneyQuery
} from '@core/journeys/ui/useJourneyQuery/useJourneyQuery'
import {
  GetJourneys,
  GetJourneysVariables
} from '@core/journeys/ui/useJourneysQuery/__generated__/GetJourneys'
import { GET_JOURNEYS } from '@core/journeys/ui/useJourneysQuery/useJourneysQuery'
import { GetTags } from '@core/journeys/ui/useTagsQuery/__generated__/GetTags'
import { GET_TAGS } from '@core/journeys/ui/useTagsQuery/useTagsQuery'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'
import { Stack } from '@mui/system'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { IdType } from '../../__generated__/globalTypes'
import i18nConfig from '../../next-i18next.config'
import { PageWrapper } from '../../src/components/PageWrapper'
import { createApolloClient } from '../../src/libs/apolloClient'
import { LanguageProvider } from '../../src/libs/languageContext/LanguageContext'

export default function JourneyDetailsPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const { data } = useJourneyQuery({
    id: router.query.journeyId as string,
    idType: IdType.databaseId
  })

  return (
    <PageWrapper>
      <Box
        sx={{ backgroundColor: 'background.default' }}
        data-testid="HomePage"
      >
        <Container maxWidth="xxl" sx={{ paddingY: '4rem' }}>
          <Stack gap={10}>
            <SnackbarProvider>
              <LanguageProvider>
                <JourneyProvider
                  value={{
                    journey: data?.journey,
                    variant: 'admin'
                  }}
                >
                  <ThemeProvider
                    themeName={ThemeName.journeysAdmin}
                    themeMode={ThemeMode.light}
                    nested
                  >
                    <TemplateView />
                  </ThemeProvider>
                </JourneyProvider>
              </LanguageProvider>
            </SnackbarProvider>
          </Stack>
        </Container>
      </Box>
    </PageWrapper>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
  if (context.params?.journeyId == null) {
    return {
      redirect: {
        destination: '/journeys',
        permanent: false
      }
    }
  }
  const journeyId = context.params.journeyId.toString()

  const apolloClient = createApolloClient()
  try {
    const { data } = await apolloClient.query<GetJourney, GetJourneyVariables>({
      query: GET_JOURNEY,
      variables: {
        id: journeyId,
        idType: IdType.databaseId
      }
    })

    const tagIds = data?.journey.tags.map((tag) => tag.id)

    // src/components/TemplateView/TemplateView.tsx useJourneysQuery
    await apolloClient.query<GetJourneys, GetJourneysVariables>({
      query: GET_JOURNEYS,
      variables: {
        where: {
          template: true,
          orderByRecent: true,
          tagIds
        }
      }
    })

    // src/components/TemplateView/TemplateTags/TemplateTags.tsx useTagsQuery
    await apolloClient.query<GetTags>({
      query: GET_TAGS
    })

    return {
      props: {
        content: data,
        ...(await serverSideTranslations(
          context.locale ?? 'en',
          ['apps-watch'],
          i18nConfig
        ))
      }
    }
  } catch (error) {
    if (error.message === 'journey not found') {
      return {
        redirect: {
          destination: '/journeys',
          permanent: false
        }
      }
    }
    throw error
  }
}

export const getStaticPaths: GetStaticPaths = () => {
  return { paths: [], fallback: 'blocking' }
}

import Stack from '@mui/material/Stack'
import type { GetServerSidePropsResult } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { transformer } from '@core/journeys/ui/transformer'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import {
  GetJourney,
  GetJourney_journey as Journey
} from '../../__generated__/GetJourney'
import i18nConfig from '../../next-i18next.config'
import { VideoWrapperPaused as VideoWrapper } from '../../src/components/VideoWrapperPaused'
import { createApolloClient } from '../../src/libs/apolloClient'
import { GET_JOURNEY } from '../[journeySlug]'

interface JourneyStepPageProps {
  journey: Journey
  locale: string
  rtl: boolean
  stepId: string | string[] | undefined
}

export default function JourneyStep({
  journey,
  locale,
  rtl,
  stepId
}): ReactElement {
  const blocks: TreeBlock[] = transformer(journey.blocks)
  const currentStep: TreeBlock | undefined = blocks.find(
    (block) => block.id === stepId
  )

  return (
    <ThemeProvider
      themeName={journey.themeName}
      themeMode={journey.themeMode}
      rtl={rtl}
      locale={locale}
    >
      <Stack
        sx={{
          height: '100vh'
        }}
      >
        <BlockRenderer
          block={currentStep}
          wrappers={{
            VideoWrapper
          }}
        />
      </Stack>
    </ThemeProvider>
  )
}

export const getServerSideProps = async (
  context
): Promise<GetServerSidePropsResult<JourneyStepPageProps>> => {
  const apolloClient = createApolloClient()
  try {
    const { data } = await apolloClient.query<GetJourney>({
      query: GET_JOURNEY,
      variables: {
        id: context.params?.journeySlug
      }
    })
    const { rtl, locale } = getJourneyRTL(data.journey)
    return {
      props: {
        ...(await serverSideTranslations(
          context.locale ?? 'en',
          ['apps-journeys', 'libs-journeys-ui'],
          i18nConfig
        )),
        journey: data.journey,
        locale,
        rtl,
        stepId: context.params?.stepId
      }
    }
  } catch (e) {
    if (e.message === 'journey not found') {
      return {
        ...(await serverSideTranslations(
          context.locale ?? 'en',
          ['apps-journeys', 'libs-journeys-ui'],
          i18nConfig
        )),

        notFound: true
      }
    }
    throw e
  }
}

import { ReactElement } from 'react'
import { GetServerSideProps } from 'next'
import { gql } from '@apollo/client'
import { ThemeProvider } from '@core/shared/ui'
import Head from 'next/head'
import Conductor from '../src/components/Conductor'
import transformer from '../src/libs/transformer'
import client from '../src/libs/client'
import {
  GetJourney,
  GetJourney_journey as Journey
} from '../__generated__/GetJourney'
import {
  TYPOGRAPHY_FIELDS,
  BUTTON_FIELDS,
  IMAGE_FIELDS,
  GRID_CONTAINER_FIELDS,
  GRID_ITEM_FIELDS,
  CARD_FIELDS,
  SIGN_UP_FIELDS,
  STEP_FIELDS,
  RADIO_OPTION_FIELDS,
  RADIO_QUESTION_FIELDS,
  VIDEO_FIELDS,
  VIDEO_TRIGGER_FIELDS
} from '../src/components/blocks'

interface JourneyPageProps {
  journey: Journey
}

function JourneyPage({ journey }: JourneyPageProps): ReactElement {
  return (
    <>
      <Head>
        <title>{journey.title}</title>
        <meta property="og:title" content={journey.title} />
        {journey.description != null && (
          <meta name="description" content={journey.description} />
        )}
        {journey.primaryImageBlock != null && (
          <meta property="og:image" content={journey.primaryImageBlock.src} />
        )}
      </Head>
      <ThemeProvider
        themeName={journey.themeName}
        themeMode={journey.themeMode}
      >
        {journey.blocks != null && (
          <Conductor blocks={transformer(journey.blocks)} />
        )}
      </ThemeProvider>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<JourneyPageProps> = async (
  context
) => {
  const { data } = await client.query<GetJourney>({
    query: gql`
      ${BUTTON_FIELDS}
      ${CARD_FIELDS}
      ${IMAGE_FIELDS}
      ${GRID_CONTAINER_FIELDS}
      ${GRID_ITEM_FIELDS}
      ${RADIO_OPTION_FIELDS}
      ${RADIO_QUESTION_FIELDS}
      ${SIGN_UP_FIELDS}
      ${STEP_FIELDS}
      ${TYPOGRAPHY_FIELDS}
      ${VIDEO_FIELDS}
      ${VIDEO_TRIGGER_FIELDS}
      query GetJourney($id: ID!) {
        # slug might have to be string
        journey(id: $id, idType: slug) {
          id
          themeName
          themeMode
          title
          description
          primaryImageBlock {
            src
          }
          blocks {
            id
            parentBlockId
            ... on ButtonBlock {
              ...ButtonFields
            }
            ... on CardBlock {
              ...CardFields
            }
            ... on GridContainerBlock {
              ...GridContainerFields
            }
            ... on GridItemBlock {
              ...GridItemFields
            }
            ... on ImageBlock {
              ...ImageFields
            }
            ... on RadioOptionBlock {
              ...RadioOptionFields
            }
            ... on RadioQuestionBlock {
              ...RadioQuestionFields
            }
            ... on SignUpBlock {
              ...SignUpFields
            }
            ... on StepBlock {
              ...StepFields
            }
            ... on TypographyBlock {
              ...TypographyFields
            }
            ... on VideoBlock {
              ...VideoFields
            }
            ... on VideoTriggerBlock {
              ...VideoTriggerFields
            }
          }
        }
      }
    `,
    variables: {
      id: context.query.journeySlug
    }
  })

  if (data.journey === null) {
    return {
      notFound: true
    }
  } else {
    return {
      props: {
        journey: data.journey
      }
    }
  }
}

export default JourneyPage

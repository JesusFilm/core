import { ReactElement } from 'react'
import { Conductor } from '../src/components/Conductor'
import transformer from '../src/libs/transformer'
import { GetServerSideProps } from 'next'
import client from '../src/libs/client'
import { gql } from '@apollo/client'
import {
  GetJourney,
  GetJourney_journey as Journey
} from '../__generated__/GetJourney'
import { ThemeProvider } from '@core/shared/ui'
import {
  TYPOGRAPHY_FIELDS,
  BUTTON_FIELDS,
  IMAGE_FIELDS,
  CARD_FIELDS,
  SIGN_UP_FIELDS,
  STEP_FIELDS,
  RADIO_OPTION_FIELDS,
  RADIO_QUESTION_FIELDS,
  VIDEO_FIELDS
} from '../src/components/blocks'
import Head from 'next/head'

interface JourneyPageProps {
  journey: Journey
}

function JourneyPage({ journey }: JourneyPageProps): ReactElement {
  const primaryImageBlock = journey.blocks?.find(block => block.id === journey.primaryImageBlockId)
  return (
    <ThemeProvider themeName={journey.themeName} themeMode={journey.themeMode}>
      {journey.description !== null && journey.primaryImageBlockId !== null && (
        <Head>
          <title>{journey.title}</title>
          <meta name='description' content={journey.description} />
          <meta property='og:title' content={journey.title} />
          <meta property='og:image' content={primaryImageBlock?.src} /> {/* how to fix this error? */}
        </Head>
      )}

      {journey.blocks != null && (
      <Conductor blocks={transformer(journey.blocks)} />
      )}
    </ThemeProvider>
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
      ${RADIO_OPTION_FIELDS}
      ${RADIO_QUESTION_FIELDS}
      ${SIGN_UP_FIELDS}
      ${STEP_FIELDS}
      ${TYPOGRAPHY_FIELDS}
      ${VIDEO_FIELDS}
      query GetJourney($id: ID!) {
        journey(id: $id) {
          id
          themeName
          themeMode
          title
          description
          primaryImageBlockId
          blocks {
            id
            parentBlockId
            ... on ButtonBlock {
              ...ButtonFields
            }
            ... on CardBlock {
              ...CardFields
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
          }
        }
      }
    `,
    variables: {
      id: context.query.journeyId
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

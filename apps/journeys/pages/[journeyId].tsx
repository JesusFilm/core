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
import { TYPOGRAPHY_FIELDS } from '../src/components/blocks/Typography'
import { IMAGE_FIELDS } from '../src/components/blocks/Image'

interface JourneyPageProps {
  journey: Journey
}

function JourneyPage({ journey }: JourneyPageProps): ReactElement {
  return (
    <ThemeProvider themeName={journey.themeName} themeMode={journey.themeMode}>
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
      ${IMAGE_FIELDS}
      ${TYPOGRAPHY_FIELDS}
      query GetJourney($id: ID!) {
        journey(id: $id) {
          id
          themeName
          themeMode
          blocks {
            id
            parentBlockId
            ... on StepBlock {
              locked
              nextBlockId
            }
            ... on VideoBlock {
              src
              title
              volume
              autoplay
            }
            ... on CardBlock {
              backgroundColor
              coverBlockId
              themeMode
              themeName
            }
            ... on ImageBlock {
              ...ImageFields
            }
            ... on RadioQuestionBlock {
              label
              description
            }
            ... on RadioOptionBlock {
              label
              action {
                __typename
                gtmEventName
                ... on NavigateToBlockAction {
                  blockId
                }
                ... on NavigateToJourneyAction {
                  journeyId
                }
                ... on LinkAction {
                  url
                }
              }
            }
            ... on TypographyBlock {
              ...TypographyFields
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

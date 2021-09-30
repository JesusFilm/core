import { ReactElement } from 'react'
import { Conductor } from '../src/components/Conductor'
import transformer from '../src/libs/transformer'
import { Container } from '@mui/material'
import { GetServerSideProps } from 'next'
import client from '../src/libs/client'
import { gql } from '@apollo/client'
import {
  GetJourney,
  GetJourney_journey as Journey
} from '../__generated__/GetJourney'
import { ThemeProvider } from '@core/shared/ui'
import { TYPOGRAPHY_FIELDS } from '../src/components/blocks/Typography'
import { BUTTON_FIELDS } from '../src/components/blocks/Button'

interface JourneyPageProps {
  journey: Journey
}

function JourneyPage({ journey }: JourneyPageProps): ReactElement {
  return (
    <ThemeProvider themeName={journey.themeName} themeMode={journey.themeMode}>
      <Container>
        {journey.blocks != null && (
          <Conductor blocks={transformer(journey.blocks)} />
        )}
      </Container>
    </ThemeProvider>
  )
}

export const getServerSideProps: GetServerSideProps<JourneyPageProps> = async (
  context
) => {
  const { data } = await client.query<GetJourney>({
    query: gql`
      ${BUTTON_FIELDS}
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
            ... on ButtonBlock {
              ...ButtonFields
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

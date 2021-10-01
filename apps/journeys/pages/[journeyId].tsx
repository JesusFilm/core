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
import { ACTION_FIELDS } from '../src/libs/action'
import { BUTTON_FIELDS } from '../src/components/blocks/Button'
import { IMAGE_FIELDS } from '../src/components/blocks/Image'
import { SIGN_UP_FIELDS } from '../src/components/blocks/SignUp'
import { TYPOGRAPHY_FIELDS } from '../src/components/blocks/Typography'

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
      ${ACTION_FIELDS}
      ${BUTTON_FIELDS}
      ${IMAGE_FIELDS}
      ${SIGN_UP_FIELDS}
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
                ...ActionFields
              }
            }
            ... on ButtonBlock {
              ...ButtonFields
            }
            ... on SignUpBlock {
              ...SignUpFields
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

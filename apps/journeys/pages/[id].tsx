import { ReactElement } from 'react'
import { Conductor } from '../src/components/Conductor'
import transformer from '../src/libs/transformer'
import { Container } from '@material-ui/core'
import { Provider } from 'react-redux'
import { store } from '../src/libs/store/store'
import { GetServerSideProps } from 'next'
import client from '../src/libs/client'
import { gql } from '@apollo/client'
import { GetJourney, GetJourney_journey } from '../__generated__/GetJourney'

interface JourneyPageProps {
  journey: GetJourney_journey | null
}

function JourneyPage ({ journey }: JourneyPageProps): ReactElement {
  return (
    <Container>
      <Provider store={store}>
        {((journey?.blocks) != null) && <Conductor blocks={transformer(journey?.blocks)} />}
      </Provider>
    </Container>
  )
}

export const getServerSideProps: GetServerSideProps<JourneyPageProps> = async (context) => {
  const { data } = await client.query<GetJourney>({
    query: gql`
      query GetJourney($id: ID!) {
        journey(id: $id) {
          id
          blocks {
            id
            parentBlockId
            ... on VideoBlock {
              src
              title
              provider
            }
            ... on RadioQuestionBlock {
              label
              description
              variant
            }
            ... on RadioOptionBlock {
              label
              image
            }
          }
        }
      }
    `,
    variables: {
      id: context.query.id
    }
  })

  return {
    props: {
      journey: data.journey
    }
  }
}

export default JourneyPage

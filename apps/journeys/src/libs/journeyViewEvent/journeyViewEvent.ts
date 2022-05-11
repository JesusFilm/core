import { gql } from '@apollo/client'
import { v4 as uuidv4 } from 'uuid'
import { createApolloClient } from '../client'

interface journeyViewEventProps {
  journeyId: string
}

export async function journeyViewEvent({
  journeyId
}: journeyViewEventProps): Promise<void> {
  const id = uuidv4()
  const client = createApolloClient()

  void client.mutate({
    mutation: gql`
      mutation JourneyViewEventCreate($input: JourneyViewEventCreateInput!) {
        journeyViewEventCreate(input: $input) {
          id
        }
      }
    `,
    variables: {
      input: { id, journeyId }
    }
  })
}

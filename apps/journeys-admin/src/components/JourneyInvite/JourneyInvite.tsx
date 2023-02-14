import { gql, useMutation } from '@apollo/client'
import { ReactElement, useState } from 'react'
import { UserJourneyRequest } from '../../../__generated__/UserJourneyRequest'
import { AccessDenied } from '../AccessDenied'

export const USER_JOURNEY_REQUEST = gql`
  mutation UserJourneyRequest($journeyId: ID!) {
    userJourneyRequest(journeyId: $journeyId, idType: databaseId) {
      id
    }
  }
`

export interface JourneyInviteProps {
  journeyId: string
  requestReceived?: boolean
}

export function JourneyInvite({
  journeyId,
  requestReceived: initialRequestReceived
}: JourneyInviteProps): ReactElement {
  const [userJourneyRequest] =
    useMutation<UserJourneyRequest>(USER_JOURNEY_REQUEST)
  const [requestReceived, setRequestReceived] = useState(
    Boolean(initialRequestReceived)
  )

  const handleClick = async (): Promise<void> => {
    await userJourneyRequest({
      variables: { journeyId }
    })
    setRequestReceived(true)
  }
  return (
    <>
      <AccessDenied
        handleClick={handleClick}
        requestedAccess={requestReceived}
      />
    </>
  )
}

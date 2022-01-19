import { gql, useMutation } from '@apollo/client'
import { ReactElement, useState } from 'react'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { UserJourneyRequest } from '../../../__generated__/UserJourneyRequest'

const USER_JOURNEY_REQUEST = gql`
  mutation UserJourneyRequest($id: ID!) {
    userJourneyRequest(id: $id, idType: slug) {
      userId
      journeyId
      role
    }
  }
`

interface JourneyInviteProps {
  journeySlug: string
  requestReceived?: boolean
}

export function JourneyInvite({
  journeySlug,
  requestReceived: initialRequestReceived
}: JourneyInviteProps): ReactElement {
  const [userJourneyRequest] =
    useMutation<UserJourneyRequest>(USER_JOURNEY_REQUEST)
  const [requestReceived, setRequestReceived] = useState(
    Boolean(initialRequestReceived)
  )

  const handleClick = async (): Promise<void> => {
    await userJourneyRequest({
      variables: { id: journeySlug }
    })
    setRequestReceived(false)
  }

  return (
    <>
      {requestReceived && (
        <>
          <Typography variant="h6">You need access for</Typography>
          <Button variant="contained" onClick={handleClick}>
            Request Access
          </Button>
        </>
      )}
      {!requestReceived && (
        <>
          <Typography variant="h6">You need access for</Typography>
          <Button variant="contained" onClick={handleClick}>
            Request Access
          </Button>
        </>
      )}
    </>
  )
}

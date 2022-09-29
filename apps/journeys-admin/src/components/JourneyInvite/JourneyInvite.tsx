import { gql, useMutation } from '@apollo/client'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('apps-journeys-admin')
  const [userJourneyRequest] =
    useMutation<UserJourneyRequest>(USER_JOURNEY_REQUEST)
  const [requestReceived, setRequestReceived] = useState(
    Boolean(initialRequestReceived)
  )

  const handleClick = async (): Promise<void> => {
    await userJourneyRequest({
      variables: { journeyId: journeyId }
    })
    setRequestReceived(true)
  }
  return (
    <>
      {!requestReceived && (
        <AccessDenied
          title={t('You need access')}
          description={t(
            'Ask for access, or switch to an account with access to this journey.'
          )}
          onClick={handleClick}
        />
      )}
      {requestReceived && (
        <AccessDenied
          title={t('Request sent')}
          description={t(
            'The owner will let you know when the journey has been shared with you.'
          )}
        />
      )}
    </>
  )
}

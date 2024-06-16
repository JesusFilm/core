import {
  MutationHookOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'

import {
  JourneyNotificationUpdate,
  JourneyNotificationUpdateVariables
} from '../../../__generated__/JourneyNotificationUpdate'

export const JOURNEY_NOTIFICATION_UPDATE = gql`
  mutation JourneyNotificationUpdate($input: JourneyNotificationUpdateInput!) {
    journeyNotificationUpdate(input: $input) {
      id
      journeyId
      userId
      userTeamId
      userJourneyId
      visitorInteractionEmail
    }
  }
`

export function useJourneyNotificationUpdate(
  options?: MutationHookOptions<
    JourneyNotificationUpdate,
    JourneyNotificationUpdateVariables
  >
): MutationTuple<
  JourneyNotificationUpdate,
  JourneyNotificationUpdateVariables
> {
  const mutation = useMutation<
    JourneyNotificationUpdate,
    JourneyNotificationUpdateVariables
  >(JOURNEY_NOTIFICATION_UPDATE, options)

  return mutation
}

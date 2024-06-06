import {
  MutationHookOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'

import {
  EventEmailNotificationsUpdate,
  EventEmailNotificationsUpdateVariables
} from '../../../__generated__/EventEmailNotificationsUpdate'

export const EVENT_EMAIL_NOTIFICATIONS_UPDATE = gql`
  mutation EventEmailNotificationsUpdate(
    $id: ID
    $input: EventEmailNotificationsUpdateInput!
  ) {
    eventEmailNotificationsUpdate(id: $id, input: $input) {
      id
      journeyId
      userId
      value
    }
  }
`

export function useEventEmailNotificationsUpdate(
  options?: MutationHookOptions<
    EventEmailNotificationsUpdate,
    EventEmailNotificationsUpdateVariables
  >
): MutationTuple<
  EventEmailNotificationsUpdate,
  EventEmailNotificationsUpdateVariables
> {
  const mutation = useMutation<
    EventEmailNotificationsUpdate,
    EventEmailNotificationsUpdateVariables
  >(EVENT_EMAIL_NOTIFICATIONS_UPDATE, options)

  return mutation
}

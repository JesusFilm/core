import { gql } from '@apollo/client';
import { useMutation } from "@apollo/client/react";

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
  options?: useMutation.Options<
    JourneyNotificationUpdate,
    JourneyNotificationUpdateVariables
  >
): useMutation.ResultTuple<
  JourneyNotificationUpdate,
  JourneyNotificationUpdateVariables
> {
  const mutation = useMutation<
    JourneyNotificationUpdate,
    JourneyNotificationUpdateVariables
  >(JOURNEY_NOTIFICATION_UPDATE, options)

  return mutation
}

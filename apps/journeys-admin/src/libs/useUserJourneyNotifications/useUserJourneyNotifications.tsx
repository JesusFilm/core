import { gql } from '@apollo/client'

export const GET_USER_JOURNEY_NOTIFICATIONS = gql`
  query GetUserJourneyNotifications($journeyId: String!) {
    userJourneyNotificationsByJourney(journeyId: $journeyId) {
      id
      journeyId
      userId
      value
    }
  }
`

// const useUserJourneyNotificationsQueryf(): Promise<>{

// }

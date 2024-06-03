/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: UserJourneyNotificationsByJourney
// ====================================================

export interface UserJourneyNotificationsByJourney_userJourneyNotificationsByJourney {
  __typename: "UserJourneyNotification";
  id: string;
  journeyId: string;
  userId: string;
  value: boolean;
}

export interface UserJourneyNotificationsByJourney {
  userJourneyNotificationsByJourney: UserJourneyNotificationsByJourney_userJourneyNotificationsByJourney[];
}

export interface UserJourneyNotificationsByJourneyVariables {
  journeyId: string;
}

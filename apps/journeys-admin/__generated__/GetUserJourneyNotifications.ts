/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetUserJourneyNotifications
// ====================================================

export interface GetUserJourneyNotifications_userJourneyNotificationsByJourney {
  __typename: "UserJourneyNotification";
  id: string;
  journeyId: string;
  userId: string;
  value: boolean;
}

export interface GetUserJourneyNotifications {
  userJourneyNotificationsByJourney: GetUserJourneyNotifications_userJourneyNotificationsByJourney[];
}

export interface GetUserJourneyNotificationsVariables {
  journeyId: string;
}

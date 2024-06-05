/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetEventEmailNotifications
// ====================================================

export interface GetEventEmailNotifications_eventEmailNotificationsByJourney {
  __typename: "EventEmailNotifications";
  id: string;
  journeyId: string;
  userId: string;
  value: boolean;
}

export interface GetEventEmailNotifications {
  eventEmailNotificationsByJourney: GetEventEmailNotifications_eventEmailNotificationsByJourney[];
}

export interface GetEventEmailNotificationsVariables {
  journeyId: string;
}

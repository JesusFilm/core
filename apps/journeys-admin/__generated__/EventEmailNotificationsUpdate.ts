/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { EventEmailNotificationsUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: EventEmailNotificationsUpdate
// ====================================================

export interface EventEmailNotificationsUpdate_eventEmailNotificationsUpdate {
  __typename: "EventEmailNotifications";
  id: string;
  journeyId: string;
  userId: string;
  value: boolean;
}

export interface EventEmailNotificationsUpdate {
  eventEmailNotificationsUpdate: EventEmailNotificationsUpdate_eventEmailNotificationsUpdate;
}

export interface EventEmailNotificationsUpdateVariables {
  id?: string | null;
  input: EventEmailNotificationsUpdateInput;
}

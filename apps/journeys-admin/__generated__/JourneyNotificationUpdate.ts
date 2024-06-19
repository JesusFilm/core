/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyNotificationUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: JourneyNotificationUpdate
// ====================================================

export interface JourneyNotificationUpdate_journeyNotificationUpdate {
  __typename: "JourneyNotification";
  id: string;
  journeyId: string;
  userId: string;
  userTeamId: string | null;
  userJourneyId: string | null;
  visitorInteractionEmail: boolean;
}

export interface JourneyNotificationUpdate {
  journeyNotificationUpdate: JourneyNotificationUpdate_journeyNotificationUpdate;
}

export interface JourneyNotificationUpdateVariables {
  input: JourneyNotificationUpdateInput;
}

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
  id: string | null;
  journeyId: string | null;
  userId: string | null;
  userTeamId: string | null;
  userJourneyId: string | null;
  visitorInteractionEmail: boolean | null;
}

export interface JourneyNotificationUpdate {
  journeyNotificationUpdate: JourneyNotificationUpdate_journeyNotificationUpdate | null;
}

export interface JourneyNotificationUpdateVariables {
  input: JourneyNotificationUpdateInput;
}

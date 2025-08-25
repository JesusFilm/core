/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserJourneyRole } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UserJourneyApprove
// ====================================================

export interface UserJourneyApprove_userJourneyApprove {
  __typename: "UserJourney";
  id: string | null;
  role: UserJourneyRole | null;
}

export interface UserJourneyApprove {
  userJourneyApprove: UserJourneyApprove_userJourneyApprove | null;
}

export interface UserJourneyApproveVariables {
  id: string;
}

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
  id: string;
  role: UserJourneyRole;
}

export interface UserJourneyApprove {
  userJourneyApprove: UserJourneyApprove_userJourneyApprove;
}

export interface UserJourneyApproveVariables {
  id: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserJourneyUpdateInput, UserJourneyRole } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UserJourneyUpdate
// ====================================================

export interface UserJourneyUpdate_userJourneyApprove {
  __typename: "UserJourney";
  id: string;
  role: UserJourneyRole;
}

export interface UserJourneyUpdate {
  userJourneyApprove: UserJourneyUpdate_userJourneyApprove;
}

export interface UserJourneyUpdateVariables {
  input: UserJourneyUpdateInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyProfileUpdateInput } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateLastActiveTeamId
// ====================================================

export interface UpdateLastActiveTeamId_journeyProfileUpdate {
  __typename: "JourneyProfile";
  id: string | null;
}

export interface UpdateLastActiveTeamId {
  journeyProfileUpdate: UpdateLastActiveTeamId_journeyProfileUpdate;
}

export interface UpdateLastActiveTeamIdVariables {
  input: JourneyProfileUpdateInput;
}

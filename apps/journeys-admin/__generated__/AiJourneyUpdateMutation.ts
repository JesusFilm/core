/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: AiJourneyUpdateMutation
// ====================================================

export interface AiJourneyUpdateMutation_journeyUpdate {
  __typename: "Journey";
  id: string;
}

export interface AiJourneyUpdateMutation {
  journeyUpdate: AiJourneyUpdateMutation_journeyUpdate;
}

export interface AiJourneyUpdateMutationVariables {
  id: string;
  input: JourneyUpdateInput;
}

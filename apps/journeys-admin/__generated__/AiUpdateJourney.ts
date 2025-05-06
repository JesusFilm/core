/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: AiUpdateJourney
// ====================================================

export interface AiUpdateJourney_journeyUpdate {
  __typename: "Journey";
  id: string;
}

export interface AiUpdateJourney {
  journeyUpdate: AiUpdateJourney_journeyUpdate;
}

export interface AiUpdateJourneyVariables {
  id: string;
  input: JourneyUpdateInput;
}

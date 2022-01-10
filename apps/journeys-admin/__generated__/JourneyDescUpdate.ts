/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: JourneyDescUpdate
// ====================================================

export interface JourneyDescUpdate_journeyUpdate {
  __typename: "Journey";
  id: string;
  description: string | null;
}

export interface JourneyDescUpdate {
  journeyUpdate: JourneyDescUpdate_journeyUpdate;
}

export interface JourneyDescUpdateVariables {
  input: JourneyUpdateInput;
}

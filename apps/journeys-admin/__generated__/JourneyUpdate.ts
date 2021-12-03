/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: JourneyUpdate
// ====================================================

export interface JourneyUpdate_journeyUpdate {
  __typename: "Journey";
  title: string;
  description: string | null;
}

export interface JourneyUpdate {
  journeyUpdate: JourneyUpdate_journeyUpdate;
}

export interface JourneyUpdateVariables {
  input: JourneyUpdateInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyUpdateInput, JourneyStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: JourneyUpdate
// ====================================================

export interface JourneyUpdate_journeyUpdate {
  __typename: "Journey";
  id: string;
  title: string;
  description: string | null;
  status: JourneyStatus;
}

export interface JourneyUpdate {
  journeyUpdate: JourneyUpdate_journeyUpdate;
}

export interface JourneyUpdateVariables {
  input: JourneyUpdateInput;
}

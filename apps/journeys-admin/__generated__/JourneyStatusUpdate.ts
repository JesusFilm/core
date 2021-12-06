/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyUpdateInput, JourneyStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: JourneyStatusUpdate
// ====================================================

export interface JourneyStatusUpdate_journeyUpdate {
  __typename: "Journey";
  id: string;
  status: JourneyStatus;
}

export interface JourneyStatusUpdate {
  journeyUpdate: JourneyStatusUpdate_journeyUpdate;
}

export interface JourneyStatusUpdateVariables {
  input: JourneyUpdateInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: JourneyDelete
// ====================================================

export interface JourneyDelete_journeysDelete {
  __typename: "Journey";
  id: string;
  status: JourneyStatus;
}

export interface JourneyDelete {
  /**
   * Sets journeys statuses to deleted
   */
  journeysDelete: (JourneyDelete_journeysDelete | null)[] | null;
}

export interface JourneyDeleteVariables {
  ids: string[];
}

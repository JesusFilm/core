/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: JourneyUnarchive
// ====================================================

export interface JourneyUnarchive_journeysRestore {
  __typename: "Journey";
  id: string;
  status: JourneyStatus;
}

export interface JourneyUnarchive {
  /**
   * Sets journeys statuses to last active status
   */
  journeysRestore: (JourneyUnarchive_journeysRestore | null)[] | null;
}

export interface JourneyUnarchiveVariables {
  ids: string[];
}

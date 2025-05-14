/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: JourneyRestore
// ====================================================

export interface JourneyRestore_journeysRestore {
  __typename: "Journey";
  id: string | null;
  status: JourneyStatus | null;
}

export interface JourneyRestore {
  /**
   * Sets journeys statuses to last active status
   */
  journeysRestore: (JourneyRestore_journeysRestore | null)[] | null;
}

export interface JourneyRestoreVariables {
  ids: string[];
}

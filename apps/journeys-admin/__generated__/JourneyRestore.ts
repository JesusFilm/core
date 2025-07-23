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
  id: string;
  status: JourneyStatus;
}

export interface JourneyRestore {
  journeysRestore: JourneyRestore_journeysRestore[];
}

export interface JourneyRestoreVariables {
  ids: string[];
}

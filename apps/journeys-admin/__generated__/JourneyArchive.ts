/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: JourneyArchive
// ====================================================

export interface JourneyArchive_journeysArchive {
  __typename: "Journey";
  id: string | null;
  status: JourneyStatus | null;
}

export interface JourneyArchive {
  /**
   * Sets journeys statuses to archived
   */
  journeysArchive: (JourneyArchive_journeysArchive | null)[] | null;
}

export interface JourneyArchiveVariables {
  ids: string[];
}

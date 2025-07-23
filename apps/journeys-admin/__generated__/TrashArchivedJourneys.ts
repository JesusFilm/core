/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TrashArchivedJourneys
// ====================================================

export interface TrashArchivedJourneys_journeysTrash {
  __typename: "Journey";
  id: string;
  status: JourneyStatus;
}

export interface TrashArchivedJourneys {
  journeysTrash: TrashArchivedJourneys_journeysTrash[];
}

export interface TrashArchivedJourneysVariables {
  ids: string[];
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TrashActiveJourneys
// ====================================================

export interface TrashActiveJourneys_journeysTrash {
  __typename: "Journey";
  id: string;
  status: JourneyStatus;
  fromTemplateId: string | null;
}

export interface TrashActiveJourneys {
  journeysTrash: (TrashActiveJourneys_journeysTrash | null)[];
}

export interface TrashActiveJourneysVariables {
  ids: string[];
}

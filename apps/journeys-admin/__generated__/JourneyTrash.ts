/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: JourneyTrash
// ====================================================

export interface JourneyTrash_journeysTrash {
  __typename: "Journey";
  id: string;
  status: JourneyStatus;
}

export interface JourneyTrash {
  journeysTrash: JourneyTrash_journeysTrash[];
}

export interface JourneyTrashVariables {
  ids: string[];
}

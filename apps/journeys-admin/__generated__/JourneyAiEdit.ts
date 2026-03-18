/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyAiEditInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: JourneyAiEdit
// ====================================================

export interface JourneyAiEdit_journeyAiEdit {
  __typename: "JourneyAiEditResult";
  reply: string | null;
  proposedJourney: any | null;
}

export interface JourneyAiEdit {
  journeyAiEdit: JourneyAiEdit_journeyAiEdit;
}

export interface JourneyAiEditVariables {
  input: JourneyAiEditInput;
}

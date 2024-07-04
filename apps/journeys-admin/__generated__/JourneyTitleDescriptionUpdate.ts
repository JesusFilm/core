/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: JourneyTitleDescriptionUpdate
// ====================================================

export interface JourneyTitleDescriptionUpdate_journeyUpdate {
  __typename: "Journey";
  id: string;
  title: string;
  description: string | null;
}

export interface JourneyTitleDescriptionUpdate {
  journeyUpdate: JourneyTitleDescriptionUpdate_journeyUpdate;
}

export interface JourneyTitleDescriptionUpdateVariables {
  id: string;
  input: JourneyUpdateInput;
}

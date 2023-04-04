/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: JourneyTitleUpdate
// ====================================================

export interface JourneyTitleUpdate_journeyUpdate {
  __typename: "Journey";
  id: string;
  title: string;
}

export interface JourneyTitleUpdate {
  journeyUpdate: JourneyTitleUpdate_journeyUpdate;
}

export interface JourneyTitleUpdateVariables {
  id: string;
  input: JourneyUpdateInput;
}

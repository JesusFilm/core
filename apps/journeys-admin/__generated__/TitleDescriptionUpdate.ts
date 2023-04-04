/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TitleDescriptionUpdate
// ====================================================

export interface TitleDescriptionUpdate_journeyUpdate {
  __typename: "Journey";
  id: string;
  title: string;
  description: string | null;
}

export interface TitleDescriptionUpdate {
  journeyUpdate: TitleDescriptionUpdate_journeyUpdate;
}

export interface TitleDescriptionUpdateVariables {
  id: string;
  input: JourneyUpdateInput;
}

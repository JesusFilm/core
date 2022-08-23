/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TemplateTitleDescriptionUpdate
// ====================================================

export interface TemplateTitleDescriptionUpdate_journeyUpdate {
  __typename: "Journey";
  id: string;
  title: string;
  description: string | null;
}

export interface TemplateTitleDescriptionUpdate {
  journeyUpdate: TemplateTitleDescriptionUpdate_journeyUpdate;
}

export interface TemplateTitleDescriptionUpdateVariables {
  id: string;
  input: JourneyUpdateInput;
}

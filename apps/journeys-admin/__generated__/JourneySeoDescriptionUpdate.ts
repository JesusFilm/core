/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: JourneySeoDescriptionUpdate
// ====================================================

export interface JourneySeoDescriptionUpdate_journeyUpdate {
  __typename: "Journey";
  id: string;
  seoDescription: string | null;
}

export interface JourneySeoDescriptionUpdate {
  journeyUpdate: JourneySeoDescriptionUpdate_journeyUpdate;
}

export interface JourneySeoDescriptionUpdateVariables {
  id: string;
  input: JourneyUpdateInput;
}

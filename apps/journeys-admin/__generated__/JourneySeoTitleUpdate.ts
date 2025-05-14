/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: JourneySeoTitleUpdate
// ====================================================

export interface JourneySeoTitleUpdate_journeyUpdate {
  __typename: "Journey";
  id: string;
  /**
   * title for seo and sharing
   */
  seoTitle: string | null;
}

export interface JourneySeoTitleUpdate {
  journeyUpdate: JourneySeoTitleUpdate_journeyUpdate;
}

export interface JourneySeoTitleUpdateVariables {
  id: string;
  input: JourneyUpdateInput;
}

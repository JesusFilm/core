/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: JourneySlugUpdate
// ====================================================

export interface JourneySlugUpdate_journeyUpdate {
  __typename: "Journey";
  id: string;
  slug: string;
}

export interface JourneySlugUpdate {
  journeyUpdate: JourneySlugUpdate_journeyUpdate;
}

export interface JourneySlugUpdateVariables {
  id: string;
  input: JourneyUpdateInput;
}

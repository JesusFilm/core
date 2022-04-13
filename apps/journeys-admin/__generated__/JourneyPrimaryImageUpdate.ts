/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: JourneyPrimaryImageUpdate
// ====================================================

export interface JourneyPrimaryImageUpdate_journeyUpdate_primaryImageBlock {
  __typename: "ImageBlock";
  id: string;
}

export interface JourneyPrimaryImageUpdate_journeyUpdate {
  __typename: "Journey";
  id: string;
  primaryImageBlock: JourneyPrimaryImageUpdate_journeyUpdate_primaryImageBlock | null;
}

export interface JourneyPrimaryImageUpdate {
  journeyUpdate: JourneyPrimaryImageUpdate_journeyUpdate;
}

export interface JourneyPrimaryImageUpdateVariables {
  id: string;
  input: JourneyUpdateInput;
}

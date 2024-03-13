/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyCollectionUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateJourneyCollection
// ====================================================

export interface UpdateJourneyCollection_journeyCollectionUpdate {
  __typename: "JourneyCollection";
  id: string;
  journeyIds: string[];
}

export interface UpdateJourneyCollection {
  journeyCollectionUpdate: UpdateJourneyCollection_journeyCollectionUpdate;
}

export interface UpdateJourneyCollectionVariables {
  input: JourneyCollectionUpdateInput;
}

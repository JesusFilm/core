/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyCollectionUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateJourneyCollection
// ====================================================

export interface UpdateJourneyCollection_journeyCollectionUpdate_journeys {
  __typename: "Journey";
  id: string;
}

export interface UpdateJourneyCollection_journeyCollectionUpdate {
  __typename: "JourneyCollection";
  id: string | null;
  journeys: UpdateJourneyCollection_journeyCollectionUpdate_journeys[] | null;
}

export interface UpdateJourneyCollection {
  journeyCollectionUpdate: UpdateJourneyCollection_journeyCollectionUpdate;
}

export interface UpdateJourneyCollectionVariables {
  id: string;
  input: JourneyCollectionUpdateInput;
}

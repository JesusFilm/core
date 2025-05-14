/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneysQueryOptions } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJourneysSummary
// ====================================================

export interface GetJourneysSummary_journeys {
  __typename: "Journey";
  id: string | null;
  /**
   * private title for creators
   */
  title: string | null;
  slug: string | null;
}

export interface GetJourneysSummary {
  journeys: GetJourneysSummary_journeys[];
}

export interface GetJourneysSummaryVariables {
  featured?: boolean | null;
  options?: JourneysQueryOptions | null;
}

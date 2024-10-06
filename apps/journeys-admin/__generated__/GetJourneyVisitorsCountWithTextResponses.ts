/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyVisitorFilter } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJourneyVisitorsCountWithTextResponses
// ====================================================

export interface GetJourneyVisitorsCountWithTextResponses {
  /**
   * Get a JourneyVisitor count by JourneyVisitorFilter
   */
  journeyVisitorCount: number;
}

export interface GetJourneyVisitorsCountWithTextResponsesVariables {
  filter: JourneyVisitorFilter;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyVisitorFilter } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJourneyVisitorsCount
// ====================================================

export interface GetJourneyVisitorsCount {
  /**
   * Get a JourneyVisitor count by JourneyVisitorFilter
   */
  journeyVisitorCount: number | null;
}

export interface GetJourneyVisitorsCountVariables {
  filter: JourneyVisitorFilter;
}

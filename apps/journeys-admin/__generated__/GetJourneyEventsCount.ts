/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyEventsFilter } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJourneyEventsCount
// ====================================================

export interface GetJourneyEventsCount {
  journeyEventsCount: number;
}

export interface GetJourneyEventsCountVariables {
  journeyId: string;
  filter?: JourneyEventsFilter | null;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyProfileUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UpdatePlausibleDashboardViewed
// ====================================================

export interface UpdatePlausibleDashboardViewed_journeyProfileUpdate {
  __typename: "JourneyProfile";
  id: string | null;
  plausibleDashboardViewed: boolean | null;
}

export interface UpdatePlausibleDashboardViewed {
  journeyProfileUpdate: UpdatePlausibleDashboardViewed_journeyProfileUpdate;
}

export interface UpdatePlausibleDashboardViewedVariables {
  input: JourneyProfileUpdateInput;
}

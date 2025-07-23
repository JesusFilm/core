/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyProfileUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UpdatePlausibleJourneyFlowViewed
// ====================================================

export interface UpdatePlausibleJourneyFlowViewed_journeyProfileUpdate {
  __typename: "JourneyProfile";
  id: string | null;
  plausibleJourneyFlowViewed: boolean | null;
}

export interface UpdatePlausibleJourneyFlowViewed {
  journeyProfileUpdate: UpdatePlausibleJourneyFlowViewed_journeyProfileUpdate;
}

export interface UpdatePlausibleJourneyFlowViewedVariables {
  input: JourneyProfileUpdateInput;
}

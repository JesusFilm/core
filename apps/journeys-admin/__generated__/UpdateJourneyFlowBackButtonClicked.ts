/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyProfileUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateJourneyFlowBackButtonClicked
// ====================================================

export interface UpdateJourneyFlowBackButtonClicked_journeyProfileUpdate {
  __typename: "JourneyProfile";
  id: string | null;
  journeyFlowBackButtonClicked: boolean | null;
}

export interface UpdateJourneyFlowBackButtonClicked {
  journeyProfileUpdate: UpdateJourneyFlowBackButtonClicked_journeyProfileUpdate;
}

export interface UpdateJourneyFlowBackButtonClickedVariables {
  input: JourneyProfileUpdateInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { NavigateToJourneyActionInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: NavigateToJourneyActionUpdate
// ====================================================

export interface NavigateToJourneyActionUpdate_blockUpdateNavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
}

export interface NavigateToJourneyActionUpdate {
  blockUpdateNavigateToJourneyAction: NavigateToJourneyActionUpdate_blockUpdateNavigateToJourneyAction;
}

export interface NavigateToJourneyActionUpdateVariables {
  id: string;
  journeyId: string;
  input: NavigateToJourneyActionInput;
}

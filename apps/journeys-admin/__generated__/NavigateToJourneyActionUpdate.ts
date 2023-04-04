/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { NavigateToJourneyActionInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: NavigateToJourneyActionUpdate
// ====================================================

export interface NavigateToJourneyActionUpdate_blockUpdateNavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
}

export interface NavigateToJourneyActionUpdate_blockUpdateNavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  gtmEventName: string | null;
  journey: NavigateToJourneyActionUpdate_blockUpdateNavigateToJourneyAction_journey | null;
}

export interface NavigateToJourneyActionUpdate {
  blockUpdateNavigateToJourneyAction: NavigateToJourneyActionUpdate_blockUpdateNavigateToJourneyAction;
}

export interface NavigateToJourneyActionUpdateVariables {
  id: string;
  journeyId: string;
  input: NavigateToJourneyActionInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { NavigateToBlockActionInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateVideoBlockNextStep
// ====================================================

export interface UpdateVideoBlockNextStep_blockUpdateNavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  gtmEventName: string | null;
  blockId: string;
  parentBlockId: string;
}

export interface UpdateVideoBlockNextStep {
  blockUpdateNavigateToBlockAction: UpdateVideoBlockNextStep_blockUpdateNavigateToBlockAction;
}

export interface UpdateVideoBlockNextStepVariables {
  id: string;
  journeyId: string;
  input: NavigateToBlockActionInput;
}

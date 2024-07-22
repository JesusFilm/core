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
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface UpdateVideoBlockNextStep {
  blockUpdateNavigateToBlockAction: UpdateVideoBlockNextStep_blockUpdateNavigateToBlockAction;
}

export interface UpdateVideoBlockNextStepVariables {
  id: string;
  input: NavigateToBlockActionInput;
}

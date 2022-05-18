/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { NavigateToBlockActionInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: VideoBlockSetDefaultAction
// ====================================================

export interface VideoBlockSetDefaultAction_blockUpdateNavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  gtmEventName: string | null;
  blockId: string;
}

export interface VideoBlockSetDefaultAction {
  blockUpdateNavigateToBlockAction: VideoBlockSetDefaultAction_blockUpdateNavigateToBlockAction;
}

export interface VideoBlockSetDefaultActionVariables {
  id: string;
  journeyId: string;
  input: NavigateToBlockActionInput;
}

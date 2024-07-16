/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { NavigateToBlockActionInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: NavigateToBlockActionUpdate
// ====================================================

export interface NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface NavigateToBlockActionUpdate {
  blockUpdateNavigateToBlockAction: NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction;
}

export interface NavigateToBlockActionUpdateVariables {
  id: string;
  input: NavigateToBlockActionInput;
}

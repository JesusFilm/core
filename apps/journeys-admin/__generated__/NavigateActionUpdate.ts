/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { NavigateActionInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: NavigateActionUpdate
// ====================================================

export interface NavigateActionUpdate_blockUpdateNavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
}

export interface NavigateActionUpdate {
  blockUpdateNavigateAction: NavigateActionUpdate_blockUpdateNavigateAction;
}

export interface NavigateActionUpdateVariables {
  id: string;
  journeyId: string;
  input: NavigateActionInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: BlockActionNavigateToBlockUpdate
// ====================================================

export interface BlockActionNavigateToBlockUpdate_blockUpdateNavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface BlockActionNavigateToBlockUpdate {
  blockUpdateNavigateToBlockAction: BlockActionNavigateToBlockUpdate_blockUpdateNavigateToBlockAction;
}

export interface BlockActionNavigateToBlockUpdateVariables {
  id: string;
  blockId: string;
}

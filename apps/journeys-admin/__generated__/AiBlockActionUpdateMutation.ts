/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { BlockUpdateActionInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: AiBlockActionUpdateMutation
// ====================================================

export interface AiBlockActionUpdateMutation_blockUpdateAction {
  __typename: "NavigateToBlockAction" | "LinkAction" | "EmailAction";
  parentBlockId: string;
}

export interface AiBlockActionUpdateMutation {
  blockUpdateAction: AiBlockActionUpdateMutation_blockUpdateAction;
}

export interface AiBlockActionUpdateMutationVariables {
  id: string;
  input: BlockUpdateActionInput;
}

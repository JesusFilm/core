/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { RadioOptionBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: AiBlockRadioOptionMutation
// ====================================================

export interface AiBlockRadioOptionMutation_radioOptionBlockUpdate_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface AiBlockRadioOptionMutation_radioOptionBlockUpdate_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface AiBlockRadioOptionMutation_radioOptionBlockUpdate_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type AiBlockRadioOptionMutation_radioOptionBlockUpdate_action = AiBlockRadioOptionMutation_radioOptionBlockUpdate_action_NavigateToBlockAction | AiBlockRadioOptionMutation_radioOptionBlockUpdate_action_LinkAction | AiBlockRadioOptionMutation_radioOptionBlockUpdate_action_EmailAction;

export interface AiBlockRadioOptionMutation_radioOptionBlockUpdate {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: AiBlockRadioOptionMutation_radioOptionBlockUpdate_action | null;
}

export interface AiBlockRadioOptionMutation {
  radioOptionBlockUpdate: AiBlockRadioOptionMutation_radioOptionBlockUpdate;
}

export interface AiBlockRadioOptionMutationVariables {
  id: string;
  input: RadioOptionBlockUpdateInput;
}

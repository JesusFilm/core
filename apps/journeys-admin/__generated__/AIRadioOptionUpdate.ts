/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { RadioOptionBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: AIRadioOptionUpdate
// ====================================================

export interface AIRadioOptionUpdate_radioOptionBlockUpdate_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface AIRadioOptionUpdate_radioOptionBlockUpdate_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface AIRadioOptionUpdate_radioOptionBlockUpdate_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type AIRadioOptionUpdate_radioOptionBlockUpdate_action = AIRadioOptionUpdate_radioOptionBlockUpdate_action_NavigateToBlockAction | AIRadioOptionUpdate_radioOptionBlockUpdate_action_LinkAction | AIRadioOptionUpdate_radioOptionBlockUpdate_action_EmailAction;

export interface AIRadioOptionUpdate_radioOptionBlockUpdate {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: AIRadioOptionUpdate_radioOptionBlockUpdate_action | null;
}

export interface AIRadioOptionUpdate {
  radioOptionBlockUpdate: AIRadioOptionUpdate_radioOptionBlockUpdate;
}

export interface AIRadioOptionUpdateVariables {
  id: string;
  input: RadioOptionBlockUpdateInput;
}

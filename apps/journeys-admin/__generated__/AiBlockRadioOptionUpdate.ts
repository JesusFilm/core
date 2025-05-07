/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { RadioOptionBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: AiBlockRadioOptionUpdate
// ====================================================

export interface AiBlockRadioOptionUpdate_radioOptionBlockUpdate_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface AiBlockRadioOptionUpdate_radioOptionBlockUpdate_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface AiBlockRadioOptionUpdate_radioOptionBlockUpdate_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type AiBlockRadioOptionUpdate_radioOptionBlockUpdate_action = AiBlockRadioOptionUpdate_radioOptionBlockUpdate_action_NavigateToBlockAction | AiBlockRadioOptionUpdate_radioOptionBlockUpdate_action_LinkAction | AiBlockRadioOptionUpdate_radioOptionBlockUpdate_action_EmailAction;

export interface AiBlockRadioOptionUpdate_radioOptionBlockUpdate {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: AiBlockRadioOptionUpdate_radioOptionBlockUpdate_action | null;
}

export interface AiBlockRadioOptionUpdate {
  radioOptionBlockUpdate: AiBlockRadioOptionUpdate_radioOptionBlockUpdate;
}

export interface AiBlockRadioOptionUpdateVariables {
  id: string;
  input: RadioOptionBlockUpdateInput;
}

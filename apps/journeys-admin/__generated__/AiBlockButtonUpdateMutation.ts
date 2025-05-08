/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ButtonBlockUpdateInput, ButtonVariant, ButtonColor, ButtonSize } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: AiBlockButtonUpdateMutation
// ====================================================

export interface AiBlockButtonUpdateMutation_buttonBlockUpdate_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface AiBlockButtonUpdateMutation_buttonBlockUpdate_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface AiBlockButtonUpdateMutation_buttonBlockUpdate_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type AiBlockButtonUpdateMutation_buttonBlockUpdate_action = AiBlockButtonUpdateMutation_buttonBlockUpdate_action_NavigateToBlockAction | AiBlockButtonUpdateMutation_buttonBlockUpdate_action_LinkAction | AiBlockButtonUpdateMutation_buttonBlockUpdate_action_EmailAction;

export interface AiBlockButtonUpdateMutation_buttonBlockUpdate {
  __typename: "ButtonBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  buttonVariant: ButtonVariant | null;
  buttonColor: ButtonColor | null;
  size: ButtonSize | null;
  startIconId: string | null;
  endIconId: string | null;
  submitEnabled: boolean | null;
  action: AiBlockButtonUpdateMutation_buttonBlockUpdate_action | null;
}

export interface AiBlockButtonUpdateMutation {
  buttonBlockUpdate: AiBlockButtonUpdateMutation_buttonBlockUpdate | null;
}

export interface AiBlockButtonUpdateMutationVariables {
  id: string;
  input: ButtonBlockUpdateInput;
}

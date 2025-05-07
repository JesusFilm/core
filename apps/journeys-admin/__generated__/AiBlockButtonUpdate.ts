/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ButtonBlockUpdateInput, ButtonVariant, ButtonColor, ButtonSize } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: AiBlockButtonUpdate
// ====================================================

export interface AiBlockButtonUpdate_buttonBlockUpdate_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface AiBlockButtonUpdate_buttonBlockUpdate_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface AiBlockButtonUpdate_buttonBlockUpdate_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type AiBlockButtonUpdate_buttonBlockUpdate_action = AiBlockButtonUpdate_buttonBlockUpdate_action_NavigateToBlockAction | AiBlockButtonUpdate_buttonBlockUpdate_action_LinkAction | AiBlockButtonUpdate_buttonBlockUpdate_action_EmailAction;

export interface AiBlockButtonUpdate_buttonBlockUpdate {
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
  action: AiBlockButtonUpdate_buttonBlockUpdate_action | null;
}

export interface AiBlockButtonUpdate {
  buttonBlockUpdate: AiBlockButtonUpdate_buttonBlockUpdate | null;
}

export interface AiBlockButtonUpdateVariables {
  id: string;
  input: ButtonBlockUpdateInput;
}

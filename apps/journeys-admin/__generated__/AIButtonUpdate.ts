/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ButtonBlockUpdateInput, ButtonVariant, ButtonColor, ButtonSize } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: AIButtonUpdate
// ====================================================

export interface AIButtonUpdate_buttonBlockUpdate_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface AIButtonUpdate_buttonBlockUpdate_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface AIButtonUpdate_buttonBlockUpdate_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type AIButtonUpdate_buttonBlockUpdate_action = AIButtonUpdate_buttonBlockUpdate_action_NavigateToBlockAction | AIButtonUpdate_buttonBlockUpdate_action_LinkAction | AIButtonUpdate_buttonBlockUpdate_action_EmailAction;

export interface AIButtonUpdate_buttonBlockUpdate {
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
  action: AIButtonUpdate_buttonBlockUpdate_action | null;
}

export interface AIButtonUpdate {
  buttonBlockUpdate: AIButtonUpdate_buttonBlockUpdate | null;
}

export interface AIButtonUpdateVariables {
  id: string;
  input: ButtonBlockUpdateInput;
}

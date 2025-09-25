/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ButtonBlockCreateInput, IconBlockCreateInput, ButtonBlockUpdateInput, ButtonVariant, ButtonColor, ButtonSize, ButtonAlignment, IconName, IconSize, IconColor } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: ButtonBlockCreate
// ====================================================

export interface ButtonBlockCreate_buttonBlockCreate_action_ChatAction {
  __typename: "ChatAction" | "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface ButtonBlockCreate_buttonBlockCreate_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface ButtonBlockCreate_buttonBlockCreate_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface ButtonBlockCreate_buttonBlockCreate_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type ButtonBlockCreate_buttonBlockCreate_action = ButtonBlockCreate_buttonBlockCreate_action_ChatAction | ButtonBlockCreate_buttonBlockCreate_action_NavigateToBlockAction | ButtonBlockCreate_buttonBlockCreate_action_LinkAction | ButtonBlockCreate_buttonBlockCreate_action_EmailAction;

export interface ButtonBlockCreate_buttonBlockCreate_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface ButtonBlockCreate_buttonBlockCreate {
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
  action: ButtonBlockCreate_buttonBlockCreate_action | null;
  settings: ButtonBlockCreate_buttonBlockCreate_settings | null;
}

export interface ButtonBlockCreate_startIcon {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface ButtonBlockCreate_endIcon {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface ButtonBlockCreate_buttonBlockUpdate_action_ChatAction {
  __typename: "ChatAction" | "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface ButtonBlockCreate_buttonBlockUpdate_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface ButtonBlockCreate_buttonBlockUpdate_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface ButtonBlockCreate_buttonBlockUpdate_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type ButtonBlockCreate_buttonBlockUpdate_action = ButtonBlockCreate_buttonBlockUpdate_action_ChatAction | ButtonBlockCreate_buttonBlockUpdate_action_NavigateToBlockAction | ButtonBlockCreate_buttonBlockUpdate_action_LinkAction | ButtonBlockCreate_buttonBlockUpdate_action_EmailAction;

export interface ButtonBlockCreate_buttonBlockUpdate_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface ButtonBlockCreate_buttonBlockUpdate {
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
  action: ButtonBlockCreate_buttonBlockUpdate_action | null;
  settings: ButtonBlockCreate_buttonBlockUpdate_settings | null;
}

export interface ButtonBlockCreate {
  buttonBlockCreate: ButtonBlockCreate_buttonBlockCreate;
  startIcon: ButtonBlockCreate_startIcon;
  endIcon: ButtonBlockCreate_endIcon;
  buttonBlockUpdate: ButtonBlockCreate_buttonBlockUpdate | null;
}

export interface ButtonBlockCreateVariables {
  input: ButtonBlockCreateInput;
  iconBlockCreateInput1: IconBlockCreateInput;
  iconBlockCreateInput2: IconBlockCreateInput;
  id: string;
  journeyId: string;
  updateInput: ButtonBlockUpdateInput;
}

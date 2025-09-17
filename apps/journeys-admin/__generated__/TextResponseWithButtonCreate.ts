/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TextResponseBlockCreateInput, ButtonBlockCreateInput, IconBlockCreateInput, ButtonBlockUpdateInput, TextResponseType, ButtonVariant, ButtonColor, ButtonSize, ButtonAlignment, IconName, IconSize, IconColor } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TextResponseWithButtonCreate
// ====================================================

export interface TextResponseWithButtonCreate_textResponse {
  __typename: "TextResponseBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  required: boolean | null;
  label: string;
  placeholder: string | null;
  hint: string | null;
  minRows: number | null;
  type: TextResponseType | null;
  routeId: string | null;
  integrationId: string | null;
}

export interface TextResponseWithButtonCreate_button_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface TextResponseWithButtonCreate_button_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface TextResponseWithButtonCreate_button_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface TextResponseWithButtonCreate_button_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
  phone: string;
  countryCode: string;
}

export type TextResponseWithButtonCreate_button_action = TextResponseWithButtonCreate_button_action_NavigateToBlockAction | TextResponseWithButtonCreate_button_action_LinkAction | TextResponseWithButtonCreate_button_action_EmailAction | TextResponseWithButtonCreate_button_action_PhoneAction;

export interface TextResponseWithButtonCreate_button_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface TextResponseWithButtonCreate_button {
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
  action: TextResponseWithButtonCreate_button_action | null;
  settings: TextResponseWithButtonCreate_button_settings | null;
}

export interface TextResponseWithButtonCreate_startIcon {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface TextResponseWithButtonCreate_endIcon {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface TextResponseWithButtonCreate_buttonUpdate_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface TextResponseWithButtonCreate_buttonUpdate_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface TextResponseWithButtonCreate_buttonUpdate_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface TextResponseWithButtonCreate_buttonUpdate_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
  phone: string;
  countryCode: string;
}

export type TextResponseWithButtonCreate_buttonUpdate_action = TextResponseWithButtonCreate_buttonUpdate_action_NavigateToBlockAction | TextResponseWithButtonCreate_buttonUpdate_action_LinkAction | TextResponseWithButtonCreate_buttonUpdate_action_EmailAction | TextResponseWithButtonCreate_buttonUpdate_action_PhoneAction;

export interface TextResponseWithButtonCreate_buttonUpdate_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface TextResponseWithButtonCreate_buttonUpdate {
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
  action: TextResponseWithButtonCreate_buttonUpdate_action | null;
  settings: TextResponseWithButtonCreate_buttonUpdate_settings | null;
}

export interface TextResponseWithButtonCreate {
  textResponse: TextResponseWithButtonCreate_textResponse;
  button: TextResponseWithButtonCreate_button;
  startIcon: TextResponseWithButtonCreate_startIcon;
  endIcon: TextResponseWithButtonCreate_endIcon;
  buttonUpdate: TextResponseWithButtonCreate_buttonUpdate | null;
}

export interface TextResponseWithButtonCreateVariables {
  textResponseInput: TextResponseBlockCreateInput;
  buttonInput: ButtonBlockCreateInput;
  iconInput1: IconBlockCreateInput;
  iconInput2: IconBlockCreateInput;
  buttonId: string;
  journeyId: string;
  buttonUpdateInput: ButtonBlockUpdateInput;
}

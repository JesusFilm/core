/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TextResponseBlockCreateInput, ButtonBlockCreateInput, IconBlockCreateInput, ButtonBlockUpdateInput, TextResponseType, ButtonVariant, ButtonColor, ButtonSize, IconName, IconSize, IconColor } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TextResponseWithButtonCreate
// ====================================================

export interface TextResponseWithButtonCreate_textResponse {
  __typename: "TextResponseBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
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
}

export interface TextResponseWithButtonCreate_button_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type TextResponseWithButtonCreate_button_action = TextResponseWithButtonCreate_button_action_NavigateToBlockAction | TextResponseWithButtonCreate_button_action_LinkAction | TextResponseWithButtonCreate_button_action_EmailAction;

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
}

export interface TextResponseWithButtonCreate_buttonUpdate_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type TextResponseWithButtonCreate_buttonUpdate_action = TextResponseWithButtonCreate_buttonUpdate_action_NavigateToBlockAction | TextResponseWithButtonCreate_buttonUpdate_action_LinkAction | TextResponseWithButtonCreate_buttonUpdate_action_EmailAction;

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

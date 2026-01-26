/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MultiselectBlockCreateInput, MultiselectOptionBlockCreateInput, ButtonBlockCreateInput, IconBlockCreateInput, ButtonBlockUpdateInput, ButtonVariant, ButtonColor, ButtonSize, ContactActionType, ButtonAlignment, BlockEventLabel, IconName, IconSize, IconColor } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: MultiselectWithButtonCreate
// ====================================================

export interface MultiselectWithButtonCreate_multiselectBlockCreate {
  __typename: "MultiselectBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  min: number | null;
  max: number | null;
}

export interface MultiselectWithButtonCreate_multiselectOption1 {
  __typename: "MultiselectOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
}

export interface MultiselectWithButtonCreate_multiselectOption2 {
  __typename: "MultiselectOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
}

export interface MultiselectWithButtonCreate_button_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface MultiselectWithButtonCreate_button_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface MultiselectWithButtonCreate_button_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface MultiselectWithButtonCreate_button_action_ChatAction {
  __typename: "ChatAction";
  parentBlockId: string;
  gtmEventName: string | null;
  chatUrl: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface MultiselectWithButtonCreate_button_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
  phone: string;
  countryCode: string;
  contactAction: ContactActionType;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type MultiselectWithButtonCreate_button_action = MultiselectWithButtonCreate_button_action_NavigateToBlockAction | MultiselectWithButtonCreate_button_action_LinkAction | MultiselectWithButtonCreate_button_action_EmailAction | MultiselectWithButtonCreate_button_action_ChatAction | MultiselectWithButtonCreate_button_action_PhoneAction;

export interface MultiselectWithButtonCreate_button_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface MultiselectWithButtonCreate_button {
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
  action: MultiselectWithButtonCreate_button_action | null;
  settings: MultiselectWithButtonCreate_button_settings | null;
  eventLabel: BlockEventLabel | null;
}

export interface MultiselectWithButtonCreate_startIcon {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface MultiselectWithButtonCreate_endIcon {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface MultiselectWithButtonCreate_buttonUpdate_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface MultiselectWithButtonCreate_buttonUpdate_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface MultiselectWithButtonCreate_buttonUpdate_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface MultiselectWithButtonCreate_buttonUpdate_action_ChatAction {
  __typename: "ChatAction";
  parentBlockId: string;
  gtmEventName: string | null;
  chatUrl: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface MultiselectWithButtonCreate_buttonUpdate_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
  phone: string;
  countryCode: string;
  contactAction: ContactActionType;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type MultiselectWithButtonCreate_buttonUpdate_action = MultiselectWithButtonCreate_buttonUpdate_action_NavigateToBlockAction | MultiselectWithButtonCreate_buttonUpdate_action_LinkAction | MultiselectWithButtonCreate_buttonUpdate_action_EmailAction | MultiselectWithButtonCreate_buttonUpdate_action_ChatAction | MultiselectWithButtonCreate_buttonUpdate_action_PhoneAction;

export interface MultiselectWithButtonCreate_buttonUpdate_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface MultiselectWithButtonCreate_buttonUpdate {
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
  action: MultiselectWithButtonCreate_buttonUpdate_action | null;
  settings: MultiselectWithButtonCreate_buttonUpdate_settings | null;
  eventLabel: BlockEventLabel | null;
}

export interface MultiselectWithButtonCreate {
  multiselectBlockCreate: MultiselectWithButtonCreate_multiselectBlockCreate;
  multiselectOption1: MultiselectWithButtonCreate_multiselectOption1;
  multiselectOption2: MultiselectWithButtonCreate_multiselectOption2;
  button: MultiselectWithButtonCreate_button;
  startIcon: MultiselectWithButtonCreate_startIcon;
  endIcon: MultiselectWithButtonCreate_endIcon;
  buttonUpdate: MultiselectWithButtonCreate_buttonUpdate | null;
}

export interface MultiselectWithButtonCreateVariables {
  multiselectInput: MultiselectBlockCreateInput;
  optionInput1: MultiselectOptionBlockCreateInput;
  optionInput2: MultiselectOptionBlockCreateInput;
  buttonInput: ButtonBlockCreateInput;
  iconInput1: IconBlockCreateInput;
  iconInput2: IconBlockCreateInput;
  buttonId: string;
  journeyId: string;
  buttonUpdateInput: ButtonBlockUpdateInput;
}

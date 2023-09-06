/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ButtonBlockCreateInput, IconBlockCreateInput, ButtonBlockUpdateInput, IconName, IconSize, IconColor, ButtonVariant, ButtonColor, ButtonSize } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: ButtonBlockCreate
// ====================================================

export interface ButtonBlockCreate_buttonBlockCreate {
  __typename: "ButtonBlock";
  id: string;
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

export interface ButtonBlockCreate_buttonBlockUpdate_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface ButtonBlockCreate_buttonBlockUpdate_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface ButtonBlockCreate_buttonBlockUpdate_action_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface ButtonBlockCreate_buttonBlockUpdate_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: ButtonBlockCreate_buttonBlockUpdate_action_NavigateToJourneyAction_journey_language;
}

export interface ButtonBlockCreate_buttonBlockUpdate_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: ButtonBlockCreate_buttonBlockUpdate_action_NavigateToJourneyAction_journey | null;
}

export interface ButtonBlockCreate_buttonBlockUpdate_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface ButtonBlockCreate_buttonBlockUpdate_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type ButtonBlockCreate_buttonBlockUpdate_action = ButtonBlockCreate_buttonBlockUpdate_action_NavigateAction | ButtonBlockCreate_buttonBlockUpdate_action_NavigateToBlockAction | ButtonBlockCreate_buttonBlockUpdate_action_NavigateToJourneyAction | ButtonBlockCreate_buttonBlockUpdate_action_LinkAction | ButtonBlockCreate_buttonBlockUpdate_action_EmailAction;

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
  action: ButtonBlockCreate_buttonBlockUpdate_action | null;
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

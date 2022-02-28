/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ButtonBlockCreateInput, IconBlockCreateInput, ButtonVariant, ButtonColor, ButtonSize, IconName, IconSize, IconColor } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: ButtonBlockCreate
// ====================================================

export interface ButtonBlockCreate_buttonBlockCreate_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface ButtonBlockCreate_buttonBlockCreate_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface ButtonBlockCreate_buttonBlockCreate_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
}

export interface ButtonBlockCreate_buttonBlockCreate_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: ButtonBlockCreate_buttonBlockCreate_action_NavigateToJourneyAction_journey | null;
}

export interface ButtonBlockCreate_buttonBlockCreate_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export type ButtonBlockCreate_buttonBlockCreate_action = ButtonBlockCreate_buttonBlockCreate_action_NavigateAction | ButtonBlockCreate_buttonBlockCreate_action_NavigateToBlockAction | ButtonBlockCreate_buttonBlockCreate_action_NavigateToJourneyAction | ButtonBlockCreate_buttonBlockCreate_action_LinkAction;

export interface ButtonBlockCreate_buttonBlockCreate {
  __typename: "ButtonBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  buttonVariant: ButtonVariant | null;
  buttonColor: ButtonColor | null;
  size: ButtonSize | null;
  startIconId: string;
  endIconId: string;
  action: ButtonBlockCreate_buttonBlockCreate_action | null;
}

export interface ButtonBlockCreate_startIcon {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface ButtonBlockCreate_endIcon {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface ButtonBlockCreate {
  buttonBlockCreate: ButtonBlockCreate_buttonBlockCreate;
  startIcon: ButtonBlockCreate_startIcon;
  endIcon: ButtonBlockCreate_endIcon;
}

export interface ButtonBlockCreateVariables {
  input: ButtonBlockCreateInput;
  iconBlockCreateInput1: IconBlockCreateInput;
  iconBlockCreateInput2: IconBlockCreateInput;
}

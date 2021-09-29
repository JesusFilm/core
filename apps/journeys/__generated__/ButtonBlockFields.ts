/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {
  ButtonVariant,
  ButtonColor,
  ButtonSize,
  IconName,
  IconColor,
  IconSize
} from "./globalTypes";

// ====================================================
// GraphQL fragment: ButtonBlockFields
// ====================================================

export interface ButtonBlockFields_startIcon {
  __typename: "Icon";
  name: IconName;
  color: IconColor | null;
  size: IconSize | null;
}

export interface ButtonBlockFields_endIcon {
  __typename: "Icon";
  name: IconName;
  color: IconColor | null;
  size: IconSize | null;
}

export interface ButtonBlockFields_action_NavigateAction {
  __typename: "NavigateAction";
  gtmEventName: string | null;
}

export interface ButtonBlockFields_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  gtmEventName: string | null;
  blockId: string;
}

export interface ButtonBlockFields_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  gtmEventName: string | null;
  journeyId: string;
}

export interface ButtonBlockFields_action_LinkAction {
  __typename: "LinkAction";
  gtmEventName: string | null;
  url: string;
}

export type ButtonBlockFields_action =
  | ButtonBlockFields_action_NavigateAction
  | ButtonBlockFields_action_NavigateToBlockAction
  | ButtonBlockFields_action_NavigateToJourneyAction
  | ButtonBlockFields_action_LinkAction;

export interface ButtonBlockFields {
  __typename: "ButtonBlock";
  id: string;
  parentBlockId: string | null;
  label: string;
  variant: ButtonVariant | null;
  color: ButtonColor | null;
  size: ButtonSize | null;
  startIcon: ButtonBlockFields_startIcon | null;
  endIcon: ButtonBlockFields_endIcon | null;
  action: ButtonBlockFields_action | null;
}

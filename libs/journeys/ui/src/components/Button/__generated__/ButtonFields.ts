/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ButtonVariant, ButtonColor, ButtonSize, IconName, IconColor, IconSize } from "../../../../__generated__/globalTypes";

// ====================================================
// GraphQL fragment: ButtonFields
// ====================================================

export interface ButtonFields_startIcon {
  __typename: "Icon";
  name: IconName;
  color: IconColor | null;
  size: IconSize | null;
}

export interface ButtonFields_endIcon {
  __typename: "Icon";
  name: IconName;
  color: IconColor | null;
  size: IconSize | null;
}

export interface ButtonFields_action_NavigateAction {
  __typename: "NavigateAction";
  gtmEventName: string | null;
}

export interface ButtonFields_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  gtmEventName: string | null;
  blockId: string;
}

export interface ButtonFields_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
}

export interface ButtonFields_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  gtmEventName: string | null;
  journey: ButtonFields_action_NavigateToJourneyAction_journey | null;
}

export interface ButtonFields_action_LinkAction {
  __typename: "LinkAction";
  gtmEventName: string | null;
  url: string;
}

export type ButtonFields_action = ButtonFields_action_NavigateAction | ButtonFields_action_NavigateToBlockAction | ButtonFields_action_NavigateToJourneyAction | ButtonFields_action_LinkAction;

export interface ButtonFields {
  __typename: "ButtonBlock";
  id: string;
  parentBlockId: string | null;
  label: string;
  buttonVariant: ButtonVariant | null;
  buttonColor: ButtonColor | null;
  size: ButtonSize | null;
  startIcon: ButtonFields_startIcon | null;
  endIcon: ButtonFields_endIcon | null;
  action: ButtonFields_action | null;
}

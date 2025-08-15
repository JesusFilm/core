/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ButtonVariant, ButtonColor, ButtonSize, ButtonAlignment } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL fragment: ButtonFields
// ====================================================

export interface ButtonFields_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface ButtonFields_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface ButtonFields_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type ButtonFields_action = ButtonFields_action_NavigateToBlockAction | ButtonFields_action_LinkAction | ButtonFields_action_EmailAction;

export interface ButtonFields_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface ButtonFields {
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
  action: ButtonFields_action | null;
  settings: ButtonFields_settings | null;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { RadioOptionBlockCreateInput, ButtonVariant, ButtonColor, ButtonSize, ButtonAlignment, ThemeMode, ThemeName, IconName, IconSize, IconColor, TextResponseType, TypographyAlign, TypographyColor, TypographyVariant, VideoBlockSource, VideoBlockObjectFit } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: RadioOptionBlockCreate
// ====================================================

export interface RadioOptionBlockCreate_radioOptionBlockCreate_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  blockId: string;
}

export interface RadioOptionBlockCreate_radioOptionBlockCreate_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  url: string;
}

export interface RadioOptionBlockCreate_radioOptionBlockCreate_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  email: string;
}

export type RadioOptionBlockCreate_radioOptionBlockCreate_action = RadioOptionBlockCreate_radioOptionBlockCreate_action_NavigateToBlockAction | RadioOptionBlockCreate_radioOptionBlockCreate_action_LinkAction | RadioOptionBlockCreate_radioOptionBlockCreate_action_EmailAction;

export interface RadioOptionBlockCreate_radioOptionBlockCreate {
  __typename: "RadioOptionBlock";
  id: string;
  label: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  action: RadioOptionBlockCreate_radioOptionBlockCreate_action | null;
}

export interface RadioOptionBlockCreate {
  radioOptionBlockCreate: RadioOptionBlockCreate_radioOptionBlockCreate;
}

export interface RadioOptionBlockCreateVariables {
  input: RadioOptionBlockCreateInput;
}

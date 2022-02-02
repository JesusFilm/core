/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ButtonBlockUpdateInput, IconName } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: ButtonBlockStartIconUpdate
// ====================================================

export interface ButtonBlockStartIconUpdate_buttonBlockUpdate_startIcon {
  __typename: "Icon";
  name: IconName;
}

export interface ButtonBlockStartIconUpdate_buttonBlockUpdate {
  __typename: "ButtonBlock";
  id: string;
  startIcon: ButtonBlockStartIconUpdate_buttonBlockUpdate_startIcon | null;
}

export interface ButtonBlockStartIconUpdate {
  buttonBlockUpdate: ButtonBlockStartIconUpdate_buttonBlockUpdate | null;
}

export interface ButtonBlockStartIconUpdateVariables {
  id: string;
  journeyId: string;
  input: ButtonBlockUpdateInput;
}

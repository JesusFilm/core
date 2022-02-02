/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ButtonBlockUpdateInput, IconColor } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: ButtonBlockStartIconColorUpdate
// ====================================================

export interface ButtonBlockStartIconColorUpdate_buttonBlockUpdate_startIcon {
  __typename: "Icon";
  color: IconColor | null;
}

export interface ButtonBlockStartIconColorUpdate_buttonBlockUpdate {
  __typename: "ButtonBlock";
  id: string;
  startIcon: ButtonBlockStartIconColorUpdate_buttonBlockUpdate_startIcon | null;
}

export interface ButtonBlockStartIconColorUpdate {
  buttonBlockUpdate: ButtonBlockStartIconColorUpdate_buttonBlockUpdate | null;
}

export interface ButtonBlockStartIconColorUpdateVariables {
  id: string;
  journeyId: string;
  input: ButtonBlockUpdateInput;
}

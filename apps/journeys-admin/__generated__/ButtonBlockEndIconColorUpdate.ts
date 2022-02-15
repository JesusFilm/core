/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ButtonBlockUpdateInput, IconColor } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: ButtonBlockEndIconColorUpdate
// ====================================================

export interface ButtonBlockEndIconColorUpdate_buttonBlockUpdate_endIcon {
  __typename: "Icon";
  color: IconColor | null;
}

export interface ButtonBlockEndIconColorUpdate_buttonBlockUpdate {
  __typename: "ButtonBlock";
  id: string;
  endIcon: ButtonBlockEndIconColorUpdate_buttonBlockUpdate_endIcon | null;
}

export interface ButtonBlockEndIconColorUpdate {
  buttonBlockUpdate: ButtonBlockEndIconColorUpdate_buttonBlockUpdate | null;
}

export interface ButtonBlockEndIconColorUpdateVariables {
  id: string;
  journeyId: string;
  input: ButtonBlockUpdateInput;
}

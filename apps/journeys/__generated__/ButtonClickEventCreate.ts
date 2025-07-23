/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ButtonClickEventCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: ButtonClickEventCreate
// ====================================================

export interface ButtonClickEventCreate_buttonClickEventCreate {
  __typename: "ButtonClickEvent";
  id: string | null;
}

export interface ButtonClickEventCreate {
  buttonClickEventCreate: ButtonClickEventCreate_buttonClickEventCreate | null;
}

export interface ButtonClickEventCreateVariables {
  input: ButtonClickEventCreateInput;
}

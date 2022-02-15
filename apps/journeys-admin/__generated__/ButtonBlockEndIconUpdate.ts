/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ButtonBlockUpdateInput, IconName } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: ButtonBlockEndIconUpdate
// ====================================================

export interface ButtonBlockEndIconUpdate_buttonBlockUpdate_endIcon {
  __typename: "Icon";
  name: IconName;
}

export interface ButtonBlockEndIconUpdate_buttonBlockUpdate {
  __typename: "ButtonBlock";
  id: string;
  endIcon: ButtonBlockEndIconUpdate_buttonBlockUpdate_endIcon | null;
}

export interface ButtonBlockEndIconUpdate {
  buttonBlockUpdate: ButtonBlockEndIconUpdate_buttonBlockUpdate | null;
}

export interface ButtonBlockEndIconUpdateVariables {
  id: string;
  journeyId: string;
  input: ButtonBlockUpdateInput;
}

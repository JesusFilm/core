/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ButtonBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: ButtonBlockIconUpdate
// ====================================================

export interface ButtonBlockIconUpdate_buttonBlockUpdate {
  __typename: "ButtonBlock";
  id: string;
  startIconId: string | null;
  endIconId: string | null;
}

export interface ButtonBlockIconUpdate {
  buttonBlockUpdate: ButtonBlockIconUpdate_buttonBlockUpdate | null;
}

export interface ButtonBlockIconUpdateVariables {
  id: string;
  journeyId: string;
  input: ButtonBlockUpdateInput;
}

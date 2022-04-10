/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { RadioOptionBlockCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: RadioOptionBlockCreate
// ====================================================

export interface RadioOptionBlockCreate_radioOptionBlockCreate {
  __typename: "RadioOptionBlock";
  id: string;
  label: string;
}

export interface RadioOptionBlockCreate {
  radioOptionBlockCreate: RadioOptionBlockCreate_radioOptionBlockCreate;
}

export interface RadioOptionBlockCreateVariables {
  input: RadioOptionBlockCreateInput;
}

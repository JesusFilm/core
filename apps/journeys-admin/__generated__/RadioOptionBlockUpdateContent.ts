/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { RadioOptionBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: RadioOptionBlockUpdateContent
// ====================================================

export interface RadioOptionBlockUpdateContent_radioOptionBlockUpdate {
  __typename: "RadioOptionBlock";
  id: string;
  label: string;
}

export interface RadioOptionBlockUpdateContent {
  radioOptionBlockUpdate: RadioOptionBlockUpdateContent_radioOptionBlockUpdate;
}

export interface RadioOptionBlockUpdateContentVariables {
  id: string;
  input: RadioOptionBlockUpdateInput;
}

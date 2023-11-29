/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { FormBlockCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: FormBlockCreate
// ====================================================

export interface FormBlockCreate_formBlockCreate {
  __typename: "FormBlock";
  id: string;
}

export interface FormBlockCreate {
  formBlockCreate: FormBlockCreate_formBlockCreate;
}

export interface FormBlockCreateVariables {
  input: FormBlockCreateInput;
}

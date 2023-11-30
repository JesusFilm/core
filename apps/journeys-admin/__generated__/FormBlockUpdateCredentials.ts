/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { FormBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: FormBlockUpdateCredentials
// ====================================================

export interface FormBlockUpdateCredentials_formBlockUpdate {
  __typename: "FormBlock";
  id: string;
  projectId: string | null;
  apiToken: string | null;
  formSlug: string | null;
}

export interface FormBlockUpdateCredentials {
  formBlockUpdate: FormBlockUpdateCredentials_formBlockUpdate | null;
}

export interface FormBlockUpdateCredentialsVariables {
  id: string;
  journeyId: string;
  input: FormBlockUpdateInput;
}

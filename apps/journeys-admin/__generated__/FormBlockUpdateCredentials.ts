/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { FormBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: FormBlockUpdateCredentials
// ====================================================

export interface FormBlockUpdateCredentials_formBlockUpdate_projects {
  __typename: "FormiumProject";
  /**
   * The projectId of the project
   */
  id: string;
  /**
   * The name of the project
   */
  name: string;
}

export interface FormBlockUpdateCredentials_formBlockUpdate_forms {
  __typename: "FormiumForm";
  /**
   * The formSlug of the form
   */
  slug: string;
  /**
   * The name of the form
   */
  name: string;
}

export interface FormBlockUpdateCredentials_formBlockUpdate {
  __typename: "FormBlock";
  id: string;
  form: any | null;
  projects: FormBlockUpdateCredentials_formBlockUpdate_projects[];
  forms: FormBlockUpdateCredentials_formBlockUpdate_forms[];
  projectId: string | null;
  formSlug: string | null;
  apiTokenExists: boolean | null;
}

export interface FormBlockUpdateCredentials {
  formBlockUpdate: FormBlockUpdateCredentials_formBlockUpdate | null;
}

export interface FormBlockUpdateCredentialsVariables {
  id: string;
  input: FormBlockUpdateInput;
}

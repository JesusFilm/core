/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetCurrentLanguge
// ====================================================

export interface GetCurrentLanguge_language_name {
  __typename: "Translation";
  value: string;
  primary: boolean;
}

export interface GetCurrentLanguge_language {
  __typename: "Language";
  id: string;
  name: GetCurrentLanguge_language_name[];
  bcp47: string | null;
  iso3: string | null;
}

export interface GetCurrentLanguge {
  language: GetCurrentLanguge_language | null;
}

export interface GetCurrentLangugeVariables {
  id: string;
}

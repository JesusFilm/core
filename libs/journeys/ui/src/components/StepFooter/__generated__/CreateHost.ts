/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CreateHost
// ====================================================

export interface CreateHost_hostCreate {
  __typename: "Host";
  id: string;
  title: string;
  location: string | null;
  src1: string | null;
  src2: string | null;
}

export interface CreateHost {
  hostCreate: CreateHost_hostCreate;
}

export interface CreateHostVariables {
  title: string;
  location: string;
  src1: string;
  src2: string;
}

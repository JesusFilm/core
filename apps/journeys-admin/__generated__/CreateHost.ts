/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { HostCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CreateHost
// ====================================================

export interface CreateHost_hostCreate {
  __typename: "Host";
  id: string;
  title: string;
}

export interface CreateHost {
  hostCreate: CreateHost_hostCreate;
}

export interface CreateHostVariables {
  teamId: string;
  input: HostCreateInput;
}

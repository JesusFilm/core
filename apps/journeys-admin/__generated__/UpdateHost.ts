/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { HostUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateHost
// ====================================================

export interface UpdateHost_hostUpdate {
  __typename: "Host";
  id: string | null;
  title: string | null;
  location: string | null;
  src1: string | null;
  src2: string | null;
}

export interface UpdateHost {
  hostUpdate: UpdateHost_hostUpdate | null;
}

export interface UpdateHostVariables {
  id: string;
  teamId: string;
  input?: HostUpdateInput | null;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { NexusCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: NexusCreate
// ====================================================

export interface NexusCreate_nexusCreate {
  __typename: "Nexus";
  id: string;
  name: string;
  description: string | null;
}

export interface NexusCreate {
  nexusCreate: NexusCreate_nexusCreate;
}

export interface NexusCreateVariables {
  input: NexusCreateInput;
}

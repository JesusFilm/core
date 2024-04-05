/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { NexusFilter } from "./globalTypes";

// ====================================================
// GraphQL query operation: Nexuses
// ====================================================

export interface Nexuses_nexuses {
  __typename: "Nexus";
  id: string;
  name: string;
}

export interface Nexuses {
  nexuses: Nexuses_nexuses[];
}

export interface NexusesVariables {
  where?: NexusFilter | null;
}

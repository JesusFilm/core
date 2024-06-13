/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ResourceUpdateInput, ResourceStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: ResourceUpdate
// ====================================================

export interface ResourceUpdate_resourceUpdate_resourceLocalizations {
  __typename: "ResourceLocalization";
  id: string;
  keywords: string | null;
  language: string | null;
  resourceId: string | null;
  title: string | null;
  description: string | null;
}

export interface ResourceUpdate_resourceUpdate {
  __typename: "Resource";
  id: string;
  name: string;
  resourceLocalizations: (ResourceUpdate_resourceUpdate_resourceLocalizations | null)[] | null;
  status: ResourceStatus | null;
}

export interface ResourceUpdate {
  resourceUpdate: ResourceUpdate_resourceUpdate;
}

export interface ResourceUpdateVariables {
  resourceId: string;
  input: ResourceUpdateInput;
}

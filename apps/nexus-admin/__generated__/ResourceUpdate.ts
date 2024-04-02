/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ResourceUpdateInput, ResourceStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: ResourceUpdate
// ====================================================

export interface ResourceUpdate_resourceUpdate_localizations {
  __typename: "ResourceLocalization";
  id: string;
  keywords: string;
  language: string;
  resourceId: string;
  title: string;
  description: string;
}

export interface ResourceUpdate_resourceUpdate {
  __typename: "Resource";
  id: string;
  name: string;
  localizations: (ResourceUpdate_resourceUpdate_localizations | null)[];
  status: ResourceStatus;
}

export interface ResourceUpdate {
  resourceUpdate: ResourceUpdate_resourceUpdate;
}

export interface ResourceUpdateVariables {
  resourceId: string;
  input: ResourceUpdateInput;
}

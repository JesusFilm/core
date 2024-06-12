/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ResourceStatus } from "./globalTypes";

// ====================================================
// GraphQL query operation: Resource
// ====================================================

export interface Resource_resource_resourceLocalizations {
  __typename: "ResourceLocalization";
  id: string;
  keywords: string | null;
  language: string | null;
  resourceId: string | null;
  title: string | null;
  description: string | null;
}

export interface Resource_resource {
  __typename: "Resource";
  id: string;
  name: string;
  customThumbnail: string | null;
  resourceLocalizations: (Resource_resource_resourceLocalizations | null)[] | null;
  status: ResourceStatus | null;
}

export interface Resource {
  resource: Resource_resource;
}

export interface ResourceVariables {
  id: string;
}

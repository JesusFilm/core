/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ResourceStatus } from "./globalTypes";

// ====================================================
// GraphQL query operation: Resource
// ====================================================

export interface Resource_resource_localizations {
  __typename: "ResourceLocalization";
  id: string;
  keywords: string;
  language: string;
  resourceId: string;
  title: string;
  description: string;
}

export interface Resource_resource {
  __typename: "Resource";
  id: string;
  name: string;
  localizations: (Resource_resource_localizations | null)[];
  status: ResourceStatus;
}

export interface Resource {
  resource: Resource_resource;
}

export interface ResourceVariables {
  resourceId: string;
}

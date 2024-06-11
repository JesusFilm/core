/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ResourceFilter, ResourceStatus } from "./globalTypes";

// ====================================================
// GraphQL query operation: Resources
// ====================================================

export interface Resources_resources_resourceLocalizations {
  __typename: "ResourceLocalization";
  id: string;
  keywords: string | null;
  language: string | null;
  resourceId: string | null;
  title: string | null;
  description: string | null;
}

export interface Resources_resources {
  __typename: "Resource";
  id: string;
  name: string;
  resourceLocalizations: (Resources_resources_resourceLocalizations | null)[] | null;
  status: ResourceStatus | null;
}

export interface Resources {
  resources: Resources_resources[] | null;
}

export interface ResourcesVariables {
  where?: ResourceFilter | null;
}

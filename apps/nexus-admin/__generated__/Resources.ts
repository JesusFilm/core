/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ResourceFilter, ResourceStatus } from "./globalTypes";

// ====================================================
// GraphQL query operation: Resources
// ====================================================

export interface Resources_resources_localizations {
  __typename: "ResourceLocalization";
  id: string;
  keywords: string;
  language: string;
  resourceId: string;
  title: string;
  description: string;
}

export interface Resources_resources {
  __typename: "Resource";
  id: string;
  name: string;
  localizations: (Resources_resources_localizations | null)[];
  status: ResourceStatus;
}

export interface Resources {
  resources: Resources_resources[] | null;
}

export interface ResourcesVariables {
  where?: ResourceFilter | null;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ResourceStatus } from "./globalTypes";

// ====================================================
// GraphQL query operation: Resource
// ====================================================

export interface Resource_resource_googleDrive {
  __typename: "GoogleDriveResource";
  title: string;
  driveId: string;
}

export interface Resource_resource {
  __typename: "Resource";
  id: string;
  name: string;
  googleDrive: Resource_resource_googleDrive | null;
  status: ResourceStatus;
}

export interface Resource {
  resource: Resource_resource;
}

export interface ResourceVariables {
  resourceId: string;
}

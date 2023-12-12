/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ResourceFilter, ResourceStatus } from "./globalTypes";

// ====================================================
// GraphQL query operation: Resources
// ====================================================

export interface Resources_resources_googleDrive {
  __typename: "GoogleDriveResource";
  title: string;
  driveId: string;
}

export interface Resources_resources {
  __typename: "Resource";
  id: string;
  name: string;
  googleDrive: Resources_resources_googleDrive | null;
  status: ResourceStatus;
}

export interface Resources {
  resources: Resources_resources[] | null;
}

export interface ResourcesVariables {
  where?: ResourceFilter | null;
}

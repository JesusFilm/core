/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ResourceStatus, ResourceUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: ResourceUpdate
// ====================================================

export interface ResourceUpdate_resourceUpdate_googleDrive {
  __typename: "GoogleDriveResource";
  title: string;
  driveId: string;
}

export interface ResourceUpdate_resourceUpdate {
  __typename: "Resource";
  id: string;
  name: string;
  googleDrive: ResourceUpdate_resourceUpdate_googleDrive | null;
  status: ResourceStatus;
}

export interface ResourceUpdate {
  resourceUpdate: ResourceUpdate_resourceUpdate;
}

export interface ResourceUpdateVariables {
  resourceId: string;
  input: ResourceUpdateInput;
}

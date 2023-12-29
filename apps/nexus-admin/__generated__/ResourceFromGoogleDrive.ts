/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ResourceFromGoogleDriveInput, ResourceStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: ResourceFromGoogleDrive
// ====================================================

export interface ResourceFromGoogleDrive_resourceFromGoogleDrive_googleDrive {
  __typename: "GoogleDriveResource";
  title: string;
  driveId: string;
}

export interface ResourceFromGoogleDrive_resourceFromGoogleDrive {
  __typename: "Resource";
  id: string;
  name: string;
  googleDrive: ResourceFromGoogleDrive_resourceFromGoogleDrive_googleDrive | null;
  status: ResourceStatus;
}

export interface ResourceFromGoogleDrive {
  resourceFromGoogleDrive: ResourceFromGoogleDrive_resourceFromGoogleDrive[] | null;
}

export interface ResourceFromGoogleDriveVariables {
  input: ResourceFromGoogleDriveInput;
}

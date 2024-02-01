/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ResourceFromGoogleDriveInput, ResourceStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: ResourceFromGoogleDrive
// ====================================================

export interface ResourceFromGoogleDrive_resourceFromGoogleDrive_localizations {
  __typename: "ResourceLocalization";
  id: string;
  keywords: string;
  language: string;
  resourceId: string;
  title: string;
  description: string;
}

export interface ResourceFromGoogleDrive_resourceFromGoogleDrive {
  __typename: "Resource";
  id: string;
  name: string;
  localizations: (ResourceFromGoogleDrive_resourceFromGoogleDrive_localizations | null)[];
  status: ResourceStatus;
}

export interface ResourceFromGoogleDrive {
  resourceFromGoogleDrive: ResourceFromGoogleDrive_resourceFromGoogleDrive[] | null;
}

export interface ResourceFromGoogleDriveVariables {
  input: ResourceFromGoogleDriveInput;
}

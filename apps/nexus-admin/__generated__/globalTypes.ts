/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum ChannelStatus {
  deleted = "deleted",
  published = "published",
}

export enum ResourceStatus {
  deleted = "deleted",
  published = "published",
}

export interface ChannelCreateInput {
  nexusId: string;
  name: string;
  platform: string;
}

export interface ChannelUpdateInput {
  name?: string | null;
  nexusId?: string | null;
  platform?: string | null;
}

export interface ConnectYoutubeChannelInput {
  channelId: string;
  authCode: string;
  redirectUri: string;
}

export interface NexusCreateInput {
  name: string;
  description?: string | null;
}

export interface ResourceFromGoogleDriveInput {
  fileIds: string[];
  authCode: string;
  nexusId: string;
}

export interface ResourceUpdateInput {
  name?: string | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================

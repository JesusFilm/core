/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum BatchStatus {
  cancelled = "cancelled",
  completed = "completed",
  error = "error",
  failed = "failed",
  paused = "paused",
  pending = "pending",
  running = "running",
  scheduled = "scheduled",
  warning = "warning",
}

export enum ChannelStatus {
  deleted = "deleted",
  published = "published",
}

export enum PrivacyStatus {
  private = "private",
  public = "public",
  unlisted = "unlisted",
}

export enum ResourceStatus {
  deleted = "deleted",
  error = "error",
  processing = "processing",
  published = "published",
  uploaded = "uploaded",
}

export enum SourceType {
  archlight = "archlight",
  googleDrive = "googleDrive",
  other = "other",
  template = "template",
}

export interface BatchFilter {
  ids?: string[] | null;
  name?: string | null;
  nexusId?: string | null;
  status?: BatchStatus | null;
  limit?: number | null;
}

export interface ChannelCreateInput {
  nexusId: string;
  name: string;
  platform: string;
}

export interface ChannelFilter {
  ids?: string[] | null;
  name?: string | null;
  nexusId?: string | null;
  limit?: number | null;
  connected?: boolean | null;
  status?: ChannelStatus | null;
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

export interface GoogleAuthInput {
  authCode: string;
  url: string;
}

export interface NexusCreateInput {
  name: string;
  description?: string | null;
}

export interface ResourceFilter {
  ids?: string[] | null;
  name?: string | null;
  nexusId?: string | null;
  status?: ResourceStatus | null;
  limit?: number | null;
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

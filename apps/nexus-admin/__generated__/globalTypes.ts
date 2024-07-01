/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum BatchStatus {
  completed = "completed",
  error = "error",
  failed = "failed",
  pending = "pending",
  processing = "processing",
}

export enum BatchTaskStatus {
  completed = "completed",
  error = "error",
  failed = "failed",
  pending = "pending",
  processing = "processing",
}

export enum ChannelStatus {
  created = "created",
  deleted = "deleted",
  published = "published",
}

export enum ResourceStatus {
  created = "created",
  deleted = "deleted",
  done = "done",
  error = "error",
  processing = "processing",
  published = "published",
  uploaded = "uploaded",
}

export interface BatchFilter {
  ids?: string[] | null;
  name?: string | null;
  status?: BatchStatus | null;
  limit?: number | null;
}

export interface ChannelCreateInput {
  name: string;
  platform: string;
}

export interface ChannelFilter {
  ids?: string[] | null;
  name?: string | null;
  limit?: number | null;
  connected?: boolean | null;
  status?: ChannelStatus | null;
}

export interface ChannelUpdateInput {
  name?: string | null;
  platform?: string | null;
}

export interface ConnectYoutubeChannelInput {
  channelId: string;
  accessToken: string;
}

export interface ResourceFilter {
  ids?: string[] | null;
  name?: string | null;
  status?: ResourceStatus | null;
  limit?: number | null;
}

export interface ResourceFromArrayInput {
  accessToken: string;
  spreadsheetData: SpreadsheetRowInput[];
}

export interface ResourceFromTemplateInput {
  accessToken: string;
  spreadsheetId: string;
  drivefolderId: string;
}

export interface ResourceUpdateInput {
  name?: string | null;
}

export interface SpreadsheetRowInput {
  channel?: string | null;
  filename?: string | null;
  title?: string | null;
  description?: string | null;
  customThumbnail?: string | null;
  keywords?: string | null;
  category?: string | null;
  privacy?: string | null;
  spokenLanguage?: string | null;
  videoId?: string | null;
  captionFile?: string | null;
  audioTrackFile?: string | null;
  language?: string | null;
  captionLanguage?: string | null;
  notifySubscribers?: string | null;
  playlistId?: string | null;
  isMadeForKids?: string | null;
  mediaComponentId?: string | null;
  textLanguage?: string | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================

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

export enum BatchTaskType {
  caption_processing = "caption_processing",
  localization = "localization",
  video_upload = "video_upload",
}

export enum ButtonVariant {
  contained = "contained",
  text = "text",
}

export enum IconColor {
  action = "action",
  disabled = "disabled",
  error = "error",
  inherit = "inherit",
  primary = "primary",
  secondary = "secondary",
}

/**
 * IconName is equivalent to the icons found in @mui/icons-material
 */
export enum IconName {
  ArrowBackRounded = "ArrowBackRounded",
  ArrowForwardRounded = "ArrowForwardRounded",
  BeenhereRounded = "BeenhereRounded",
  ChatBubbleOutlineRounded = "ChatBubbleOutlineRounded",
  CheckCircleRounded = "CheckCircleRounded",
  ChevronLeftRounded = "ChevronLeftRounded",
  ChevronRightRounded = "ChevronRightRounded",
  ContactSupportRounded = "ContactSupportRounded",
  FormatQuoteRounded = "FormatQuoteRounded",
  LiveTvRounded = "LiveTvRounded",
  LockOpenRounded = "LockOpenRounded",
  MenuBookRounded = "MenuBookRounded",
  PlayArrowRounded = "PlayArrowRounded",
  RadioButtonUncheckedRounded = "RadioButtonUncheckedRounded",
  SendRounded = "SendRounded",
  SubscriptionsRounded = "SubscriptionsRounded",
  TranslateRounded = "TranslateRounded",
}

export enum IconSize {
  inherit = "inherit",
  lg = "lg",
  md = "md",
  sm = "sm",
  xl = "xl",
}

export enum JourneyStatus {
  archived = "archived",
  deleted = "deleted",
  published = "published",
}

export enum ResourceStatus {
  deleted = "deleted",
  error = "error",
  processing = "processing",
  published = "published",
  uploaded = "uploaded",
}

export enum TaskStatus {
  completed = "completed",
  failed = "failed",
  pending = "pending",
  processing = "processing",
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

export interface NexusFilter {
  ids?: string[] | null;
  name?: string | null;
  description?: string | null;
  createdAt?: any | null;
  limit?: number | null;
  orderByRecent?: boolean | null;
}

export interface ResourceFilter {
  ids?: string[] | null;
  name?: string | null;
  nexusId?: string | null;
  status?: ResourceStatus | null;
  limit?: number | null;
}

export interface ResourceUpdateInput {
  name?: string | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================

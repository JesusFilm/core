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

export enum ButtonAction {
  EmailAction = "EmailAction",
  LinkAction = "LinkAction",
  NavigateAction = "NavigateAction",
  NavigateToBlockAction = "NavigateToBlockAction",
  NavigateToJourneyAction = "NavigateToJourneyAction",
}

export enum ButtonColor {
  error = "error",
  inherit = "inherit",
  primary = "primary",
  secondary = "secondary",
}

export enum ButtonSize {
  large = "large",
  medium = "medium",
  small = "small",
}

export enum ButtonVariant {
  contained = "contained",
  text = "text",
}

export enum ChannelStatus {
  deleted = "deleted",
  published = "published",
}

export enum ChatPlatform {
  custom = "custom",
  facebook = "facebook",
  instagram = "instagram",
  line = "line",
  skype = "skype",
  snapchat = "snapchat",
  telegram = "telegram",
  tikTok = "tikTok",
  viber = "viber",
  vk = "vk",
  whatsApp = "whatsApp",
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
  draft = "draft",
  published = "published",
  trashed = "trashed",
}

export enum MessagePlatform {
  custom = "custom",
  facebook = "facebook",
  instagram = "instagram",
  line = "line",
  skype = "skype",
  snapchat = "snapchat",
  telegram = "telegram",
  tikTok = "tikTok",
  viber = "viber",
  vk = "vk",
  whatsApp = "whatsApp",
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

export enum ThemeMode {
  dark = "dark",
  light = "light",
}

export enum ThemeName {
  base = "base",
}

export enum TypographyAlign {
  center = "center",
  left = "left",
  right = "right",
}

export enum TypographyColor {
  error = "error",
  primary = "primary",
  secondary = "secondary",
}

export enum TypographyVariant {
  body1 = "body1",
  body2 = "body2",
  caption = "caption",
  h1 = "h1",
  h2 = "h2",
  h3 = "h3",
  h4 = "h4",
  h5 = "h5",
  h6 = "h6",
  overline = "overline",
  subtitle1 = "subtitle1",
  subtitle2 = "subtitle2",
}

export enum UserJourneyRole {
  editor = "editor",
  inviteRequested = "inviteRequested",
  owner = "owner",
}

export enum VideoBlockObjectFit {
  fill = "fill",
  fit = "fit",
  zoomed = "zoomed",
}

export enum VideoBlockSource {
  cloudflare = "cloudflare",
  internal = "internal",
  youTube = "youTube",
}

export interface BatchFilter {
  ids?: string[] | null;
  name?: string | null;
  nexusId?: string | null;
  status?: BatchStatus | null;
  limit?: number | null;
}

export interface ButtonClickEventCreateInput {
  id?: string | null;
  blockId: string;
  stepId?: string | null;
  label?: string | null;
  value?: string | null;
  action?: ButtonAction | null;
  actionValue?: string | null;
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

export interface ChatOpenEventCreateInput {
  id?: string | null;
  blockId: string;
  stepId?: string | null;
  value?: MessagePlatform | null;
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

export interface RadioQuestionSubmissionEventCreateInput {
  id?: string | null;
  blockId: string;
  radioOptionBlockId: string;
  stepId?: string | null;
  label?: string | null;
  value?: string | null;
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

export interface SignUpSubmissionEventCreateInput {
  id?: string | null;
  blockId: string;
  stepId?: string | null;
  name: string;
  email: string;
}

export interface StepNextEventCreateInput {
  id?: string | null;
  blockId: string;
  nextStepId: string;
  label?: string | null;
  value?: string | null;
}

export interface StepPreviousEventCreateInput {
  id?: string | null;
  blockId: string;
  previousStepId: string;
  label?: string | null;
  value?: string | null;
}

export interface StepViewEventCreateInput {
  id?: string | null;
  blockId: string;
  value?: string | null;
}

export interface TextResponseSubmissionEventCreateInput {
  id?: string | null;
  blockId: string;
  stepId?: string | null;
  label?: string | null;
  value: string;
}

export interface VideoCollapseEventCreateInput {
  id?: string | null;
  blockId: string;
  stepId?: string | null;
  position?: number | null;
  label?: string | null;
  value?: VideoBlockSource | null;
}

export interface VideoCompleteEventCreateInput {
  id?: string | null;
  blockId: string;
  stepId?: string | null;
  position?: number | null;
  label?: string | null;
  value?: VideoBlockSource | null;
}

export interface VideoExpandEventCreateInput {
  id?: string | null;
  blockId: string;
  stepId?: string | null;
  position?: number | null;
  label?: string | null;
  value?: VideoBlockSource | null;
}

export interface VideoPauseEventCreateInput {
  id?: string | null;
  blockId: string;
  stepId?: string | null;
  position?: number | null;
  label?: string | null;
  value?: VideoBlockSource | null;
}

export interface VideoPlayEventCreateInput {
  id?: string | null;
  blockId: string;
  stepId?: string | null;
  position?: number | null;
  label?: string | null;
  value?: VideoBlockSource | null;
}

export interface VideoProgressEventCreateInput {
  id?: string | null;
  blockId: string;
  stepId?: string | null;
  position?: number | null;
  progress: number;
  label?: string | null;
  value?: VideoBlockSource | null;
}

export interface VideoStartEventCreateInput {
  id?: string | null;
  blockId: string;
  stepId?: string | null;
  position?: number | null;
  label?: string | null;
  value?: VideoBlockSource | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================

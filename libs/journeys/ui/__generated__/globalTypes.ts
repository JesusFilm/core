/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

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

export interface ButtonClickEventCreateInput {
  id?: string | null;
  blockId: string;
  stepId?: string | null;
  label?: string | null;
  value?: string | null;
  action?: ButtonAction | null;
  actionValue?: string | null;
}

export interface ChatOpenEventCreateInput {
  id?: string | null;
  blockId: string;
  stepId?: string | null;
  value?: MessagePlatform | null;
}

export interface RadioQuestionSubmissionEventCreateInput {
  id?: string | null;
  blockId: string;
  radioOptionBlockId: string;
  stepId?: string | null;
  label?: string | null;
  value?: string | null;
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

export interface StepPrevEventCreateInput {
  id?: string | null;
  blockId: string;
  prevStepId: string;
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

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

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

export enum GridAlignItems {
  baseline = "baseline",
  center = "center",
  flexEnd = "flexEnd",
  flexStart = "flexStart",
}

export enum GridDirection {
  column = "column",
  columnReverse = "columnReverse",
  row = "row",
  rowReverse = "rowReverse",
}

export enum GridJustifyContent {
  center = "center",
  flexEnd = "flexEnd",
  flexStart = "flexStart",
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
  ArrowForwardRounded = "ArrowForwardRounded",
  BeenhereRounded = "BeenhereRounded",
  ChatBubbleOutlineRounded = "ChatBubbleOutlineRounded",
  CheckCircleRounded = "CheckCircleRounded",
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

export enum VideoType {
  episode = "episode",
  playlist = "playlist",
  standalone = "standalone",
}

export interface ButtonClickEventCreateInput {
  blockId: string;
  id?: string | null;
}

export interface RadioQuestionSubmissionEventCreateInput {
  blockId: string;
  id?: string | null;
  radioOptionBlockId: string;
}

export interface SignUpSubmissionEventCreateInput {
  blockId: string;
  email: string;
  id?: string | null;
  name: string;
}

export interface StepViewEventCreateInput {
  blockId: string;
  id?: string | null;
}

export interface VideoCollapseEventCreateInput {
  blockId: string;
  id?: string | null;
  position?: number | null;
}

export interface VideoCompleteEventCreateInput {
  blockId: string;
  id?: string | null;
  position?: number | null;
}

export interface VideoExpandEventCreateInput {
  blockId: string;
  id?: string | null;
  position?: number | null;
}

export interface VideoPauseEventCreateInput {
  blockId: string;
  id?: string | null;
  position?: number | null;
}

export interface VideoPlayEventCreateInput {
  blockId: string;
  id?: string | null;
  position?: number | null;
}

export interface VideoProgressEventCreateInput {
  blockId: string;
  id?: string | null;
  position?: number | null;
  progress: number;
}

export interface VideoStartEventCreateInput {
  blockId: string;
  id?: string | null;
  position?: number | null;
}

export interface VideosFilter {
  availableVariantLanguageIds?: string[] | null;
  tagId?: string | null;
  title?: string | null;
  types?: VideoType[] | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================

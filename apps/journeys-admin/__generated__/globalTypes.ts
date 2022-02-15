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
  draft = "draft",
  published = "published",
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

export enum VideoResponseStateEnum {
  FINISHED = "FINISHED",
  PAUSED = "PAUSED",
  PLAYING = "PLAYING",
}

export interface ButtonBlockUpdateInput {
  color?: ButtonColor | null;
  label?: string | null;
  parentBlockId?: string | null;
  size?: ButtonSize | null;
  variant?: ButtonVariant | null;
}

export interface CardBlockUpdateInput {
  backgroundColor?: string | null;
  coverBlockId?: string | null;
  fullscreen?: boolean | null;
  parentBlockId?: string | null;
  themeMode?: ThemeMode | null;
  themeName?: ThemeName | null;
}

export interface ImageBlockCreateInput {
  alt: string;
  id?: string | null;
  journeyId: string;
  parentBlockId: string;
  src?: string | null;
}

export interface JourneyUpdateInput {
  description?: string | null;
  locale?: string | null;
  primaryImageBlockId?: string | null;
  slug?: string | null;
  themeMode?: ThemeMode | null;
  themeName?: ThemeName | null;
  title?: string | null;
}

export interface LinkActionInput {
  gtmEventName?: string | null;
  target?: string | null;
  url: string;
}

export interface NavigateActionInput {
  gtmEventName?: string | null;
}

export interface NavigateToBlockActionInput {
  blockId: string;
  gtmEventName?: string | null;
}

export interface NavigateToJourneyActionInput {
  gtmEventName?: string | null;
  journeyId: string;
}

export interface RadioOptionBlockCreateInput {
  id?: string | null;
  journeyId: string;
  label: string;
  parentBlockId: string;
}

export interface RadioQuestionBlockCreateInput {
  id?: string | null;
  journeyId: string;
  label: string;
  parentBlockId: string;
}

export interface RadioQuestionResponseCreateInput {
  blockId: string;
  id?: string | null;
  radioOptionBlockId: string;
}

export interface SignUpBlockCreateInput {
  id?: string | null;
  journeyId: string;
  parentBlockId: string;
  submitLabel: string;
}

export interface SignUpResponseCreateInput {
  blockId: string;
  email: string;
  id?: string | null;
  name: string;
}

export interface TypographyBlockCreateInput {
  align?: TypographyAlign | null;
  color?: TypographyColor | null;
  content: string;
  id?: string | null;
  journeyId: string;
  parentBlockId: string;
  variant?: TypographyVariant | null;
}

export interface TypographyBlockUpdateInput {
  align?: TypographyAlign | null;
  color?: TypographyColor | null;
  content?: string | null;
  parentBlockId?: string | null;
  variant?: TypographyVariant | null;
}

export interface VideoBlockCreateInput {
  autoplay?: boolean | null;
  description?: string | null;
  endAt?: number | null;
  fullsize?: boolean | null;
  id?: string | null;
  journeyId: string;
  muted?: boolean | null;
  parentBlockId: string;
  posterBlockId?: string | null;
  startAt?: number | null;
  title: string;
  videoContent: VideoContentInput;
}

export interface VideoContentInput {
  languageId?: string | null;
  mediaComponentId?: string | null;
  src?: string | null;
}

export interface VideoResponseCreateInput {
  blockId: string;
  id?: string | null;
  position?: number | null;
  state: VideoResponseStateEnum;
}

//==============================================================
// END Enums and Input Objects
//==============================================================

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

export enum JourneysReportType {
  multipleFull = "multipleFull",
  multipleSummary = "multipleSummary",
  singleFull = "singleFull",
  singleSummary = "singleSummary",
}

export enum Role {
  publisher = "publisher",
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

export enum VideoBlockSource {
  internal = "internal",
  youTube = "youTube",
}

export enum VideoType {
  episode = "episode",
  playlist = "playlist",
  standalone = "standalone",
}

export interface ButtonBlockCreateInput {
  color?: ButtonColor | null;
  id?: string | null;
  journeyId: string;
  label: string;
  parentBlockId: string;
  size?: ButtonSize | null;
  variant?: ButtonVariant | null;
}

export interface ButtonBlockUpdateInput {
  color?: ButtonColor | null;
  endIconId?: string | null;
  label?: string | null;
  parentBlockId?: string | null;
  size?: ButtonSize | null;
  startIconId?: string | null;
  variant?: ButtonVariant | null;
}

export interface ButtonClickEventCreateInput {
  blockId: string;
  id?: string | null;
  label?: string | null;
  stepId?: string | null;
  value?: string | null;
}

export interface CardBlockUpdateInput {
  backgroundColor?: string | null;
  fullscreen?: boolean | null;
  parentBlockId?: string | null;
  themeMode?: ThemeMode | null;
  themeName?: ThemeName | null;
}

export interface IconBlockCreateInput {
  color?: IconColor | null;
  id?: string | null;
  journeyId: string;
  name?: IconName | null;
  parentBlockId: string;
  size?: IconSize | null;
}

export interface IconBlockUpdateInput {
  color?: IconColor | null;
  name?: IconName | null;
  size?: IconSize | null;
}

export interface ImageBlockCreateInput {
  alt: string;
  blurhash?: string | null;
  id?: string | null;
  isCover?: boolean | null;
  journeyId: string;
  parentBlockId: string;
  src?: string | null;
}

export interface ImageBlockUpdateInput {
  alt?: string | null;
  parentBlockId?: string | null;
  src?: string | null;
}

export interface JourneyTemplateInput {
  template?: boolean | null;
}

export interface JourneyUpdateInput {
  description?: string | null;
  languageId?: string | null;
  primaryImageBlockId?: string | null;
  seoDescription?: string | null;
  seoTitle?: string | null;
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

export interface RadioOptionBlockUpdateInput {
  label?: string | null;
  parentBlockId?: string | null;
}

export interface RadioQuestionBlockCreateInput {
  id?: string | null;
  journeyId: string;
  parentBlockId: string;
}

export interface RadioQuestionSubmissionEventCreateInput {
  blockId: string;
  id?: string | null;
  label?: string | null;
  radioOptionBlockId: string;
  stepId?: string | null;
  value?: string | null;
}

export interface SignUpBlockCreateInput {
  id?: string | null;
  journeyId: string;
  parentBlockId: string;
  submitLabel: string;
}

export interface SignUpBlockUpdateInput {
  parentBlockId?: string | null;
  submitIconId?: string | null;
  submitLabel?: string | null;
}

export interface SignUpSubmissionEventCreateInput {
  blockId: string;
  email: string;
  id?: string | null;
  name: string;
  stepId?: string | null;
}

export interface StepBlockUpdateInput {
  locked?: boolean | null;
  nextBlockId?: string | null;
}

export interface StepViewEventCreateInput {
  blockId: string;
  id?: string | null;
  value?: string | null;
}

export interface TextResponseBlockCreateInput {
  id?: string | null;
  journeyId: string;
  label: string;
  parentBlockId: string;
  submitLabel: string;
}

export interface TextResponseBlockUpdateInput {
  hint?: string | null;
  label?: string | null;
  minRows?: number | null;
  parentBlockId?: string | null;
  submitIconId?: string | null;
  submitLabel?: string | null;
}

export interface TextResponseSubmissionEventCreateInput {
  blockId: string;
  id?: string | null;
  label?: string | null;
  stepId?: string | null;
  value: string;
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
  isCover?: boolean | null;
  journeyId: string;
  muted?: boolean | null;
  parentBlockId: string;
  posterBlockId?: string | null;
  source?: VideoBlockSource | null;
  startAt?: number | null;
  videoId?: string | null;
  videoVariantLanguageId?: string | null;
}

export interface VideoBlockUpdateInput {
  autoplay?: boolean | null;
  endAt?: number | null;
  fullsize?: boolean | null;
  muted?: boolean | null;
  posterBlockId?: string | null;
  source?: VideoBlockSource | null;
  startAt?: number | null;
  videoId?: string | null;
  videoVariantLanguageId?: string | null;
}

export interface VideoCollapseEventCreateInput {
  blockId: string;
  id?: string | null;
  label?: VideoBlockSource | null;
  position?: number | null;
  stepId?: string | null;
  value?: string | null;
}

export interface VideoCompleteEventCreateInput {
  blockId: string;
  id?: string | null;
  label?: VideoBlockSource | null;
  position?: number | null;
  stepId?: string | null;
  value?: string | null;
}

export interface VideoExpandEventCreateInput {
  blockId: string;
  id?: string | null;
  label?: VideoBlockSource | null;
  position?: number | null;
  stepId?: string | null;
  value?: string | null;
}

export interface VideoPauseEventCreateInput {
  blockId: string;
  id?: string | null;
  label?: VideoBlockSource | null;
  position?: number | null;
  stepId?: string | null;
  value?: string | null;
}

export interface VideoPlayEventCreateInput {
  blockId: string;
  id?: string | null;
  label?: VideoBlockSource | null;
  position?: number | null;
  stepId?: string | null;
  value?: string | null;
}

export interface VideoProgressEventCreateInput {
  blockId: string;
  id?: string | null;
  label?: VideoBlockSource | null;
  position?: number | null;
  progress: number;
  stepId?: string | null;
  value?: string | null;
}

export interface VideoStartEventCreateInput {
  blockId: string;
  id?: string | null;
  label?: VideoBlockSource | null;
  position?: number | null;
  stepId?: string | null;
  value?: string | null;
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

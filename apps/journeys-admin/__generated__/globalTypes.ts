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

export enum MessagePlatform {
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

export enum VideoBlockObjectFit {
  fill = "fill",
  fit = "fit",
  zoomed = "zoomed",
}

export enum VideoBlockSource {
  internal = "internal",
  youTube = "youTube",
}

export enum VideoLabel {
  collection = "collection",
  episode = "episode",
  featureFilm = "featureFilm",
  segment = "segment",
  series = "series",
  shortFilm = "shortFilm",
}

/**
 * The status of a visitor according to team members interacting with the
 * visitor admin interface. This enum should map to an emoji when displayed
 * (names here match Apple's emoji name)
 */
export enum VisitorStatus {
  checkMarkSymbol = "checkMarkSymbol",
  partyPopper = "partyPopper",
  prohibited = "prohibited",
  redExclamationMark = "redExclamationMark",
  redQuestionMark = "redQuestionMark",
  robotFace = "robotFace",
  star = "star",
  thumbsDown = "thumbsDown",
  thumbsUp = "thumbsUp",
  warning = "warning",
}

export interface ButtonBlockCreateInput {
  id?: string | null;
  journeyId: string;
  parentBlockId: string;
  label: string;
  variant?: ButtonVariant | null;
  color?: ButtonColor | null;
  size?: ButtonSize | null;
}

export interface ButtonBlockUpdateInput {
  parentBlockId?: string | null;
  label?: string | null;
  variant?: ButtonVariant | null;
  color?: ButtonColor | null;
  size?: ButtonSize | null;
  startIconId?: string | null;
  endIconId?: string | null;
}

export interface ButtonClickEventCreateInput {
  id?: string | null;
  blockId: string;
  stepId?: string | null;
  label?: string | null;
  value?: string | null;
}

export interface CardBlockUpdateInput {
  parentBlockId?: string | null;
  backgroundColor?: string | null;
  fullscreen?: boolean | null;
  themeMode?: ThemeMode | null;
  themeName?: ThemeName | null;
}

export interface ChatOpenEventCreateInput {
  id?: string | null;
  blockId: string;
  stepId?: string | null;
  value?: MessagePlatform | null;
}

export interface IconBlockCreateInput {
  id?: string | null;
  parentBlockId: string;
  journeyId: string;
  name?: IconName | null;
  color?: IconColor | null;
  size?: IconSize | null;
}

export interface IconBlockUpdateInput {
  name?: IconName | null;
  color?: IconColor | null;
  size?: IconSize | null;
}

export interface ImageBlockCreateInput {
  id?: string | null;
  parentBlockId: string;
  journeyId: string;
  src?: string | null;
  alt: string;
  blurhash?: string | null;
  isCover?: boolean | null;
}

export interface ImageBlockUpdateInput {
  parentBlockId?: string | null;
  src?: string | null;
  alt?: string | null;
}

export interface JourneyTemplateInput {
  template?: boolean | null;
}

export interface JourneyUpdateInput {
  title?: string | null;
  languageId?: string | null;
  themeMode?: ThemeMode | null;
  themeName?: ThemeName | null;
  description?: string | null;
  primaryImageBlockId?: string | null;
  slug?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export interface LinkActionInput {
  gtmEventName?: string | null;
  url: string;
  target?: string | null;
}

export interface NavigateActionInput {
  gtmEventName?: string | null;
}

export interface NavigateToBlockActionInput {
  gtmEventName?: string | null;
  blockId: string;
}

export interface NavigateToJourneyActionInput {
  gtmEventName?: string | null;
  journeyId: string;
}

export interface RadioOptionBlockCreateInput {
  id?: string | null;
  journeyId: string;
  parentBlockId: string;
  label: string;
}

export interface RadioOptionBlockUpdateInput {
  parentBlockId?: string | null;
  label?: string | null;
}

export interface RadioQuestionBlockCreateInput {
  id?: string | null;
  journeyId: string;
  parentBlockId: string;
}

export interface RadioQuestionSubmissionEventCreateInput {
  id?: string | null;
  blockId: string;
  radioOptionBlockId: string;
  stepId?: string | null;
  label?: string | null;
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
  id?: string | null;
  blockId: string;
  stepId?: string | null;
  name: string;
  email: string;
}

export interface StepBlockUpdateInput {
  nextBlockId?: string | null;
  locked?: boolean | null;
}

export interface StepViewEventCreateInput {
  id?: string | null;
  blockId: string;
  value?: string | null;
}

export interface TextResponseBlockCreateInput {
  id?: string | null;
  journeyId: string;
  parentBlockId: string;
  label: string;
  submitLabel: string;
}

export interface TextResponseBlockUpdateInput {
  parentBlockId?: string | null;
  label?: string | null;
  hint?: string | null;
  minRows?: number | null;
  submitIconId?: string | null;
  submitLabel?: string | null;
}

export interface TextResponseSubmissionEventCreateInput {
  id?: string | null;
  blockId: string;
  stepId?: string | null;
  label?: string | null;
  value: string;
}

export interface TypographyBlockCreateInput {
  id?: string | null;
  journeyId: string;
  parentBlockId: string;
  content: string;
  variant?: TypographyVariant | null;
  color?: TypographyColor | null;
  align?: TypographyAlign | null;
}

export interface TypographyBlockUpdateInput {
  parentBlockId?: string | null;
  content?: string | null;
  variant?: TypographyVariant | null;
  color?: TypographyColor | null;
  align?: TypographyAlign | null;
}

export interface VideoBlockCreateInput {
  id?: string | null;
  journeyId: string;
  parentBlockId: string;
  startAt?: number | null;
  endAt?: number | null;
  description?: string | null;
  muted?: boolean | null;
  autoplay?: boolean | null;
  videoId?: string | null;
  videoVariantLanguageId?: string | null;
  source?: VideoBlockSource | null;
  posterBlockId?: string | null;
  fullsize?: boolean | null;
  isCover?: boolean | null;
  objectFit?: VideoBlockObjectFit | null;
}

export interface VideoBlockUpdateInput {
  startAt?: number | null;
  endAt?: number | null;
  muted?: boolean | null;
  autoplay?: boolean | null;
  videoId?: string | null;
  videoVariantLanguageId?: string | null;
  source?: VideoBlockSource | null;
  posterBlockId?: string | null;
  fullsize?: boolean | null;
  objectFit?: VideoBlockObjectFit | null;
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

export interface VideosFilter {
  availableVariantLanguageIds?: string[] | null;
  title?: string | null;
  labels?: VideoLabel[] | null;
  ids?: string[] | null;
  subtitleLanguageIds?: string[] | null;
}

/**
 * A list of fields to update a visitor when calling the visitorUpdate mutation
 */
export interface VisitorUpdateInput {
  email?: string | null;
  messagePlatformId?: string | null;
  messagePlatform?: MessagePlatform | null;
  name?: string | null;
  notes?: string | null;
  status?: VisitorStatus | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================

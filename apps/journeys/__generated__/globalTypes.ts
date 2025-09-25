/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum ButtonAction {
  ChatAction = "ChatAction",
  EmailAction = "EmailAction",
  LinkAction = "LinkAction",
  NavigateToBlockAction = "NavigateToBlockAction",
  PhoneAction = "PhoneAction",
}

export enum ButtonAlignment {
  center = "center",
  justify = "justify",
  left = "left",
  right = "right",
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
  outlined = "outlined",
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
  Launch = "Launch",
  LiveTvRounded = "LiveTvRounded",
  LockOpenRounded = "LockOpenRounded",
  MailOutline = "MailOutline",
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

export enum IdType {
  databaseId = "databaseId",
  slug = "slug",
}

export enum JourneyMenuButtonIcon {
  chevronDown = "chevronDown",
  ellipsis = "ellipsis",
  equals = "equals",
  grid1 = "grid1",
  home3 = "home3",
  home4 = "home4",
  menu1 = "menu1",
  more = "more",
}

export enum JourneyStatus {
  archived = "archived",
  deleted = "deleted",
  draft = "draft",
  published = "published",
  trashed = "trashed",
}

export enum MessagePlatform {
  checkBroken = "checkBroken",
  checkContained = "checkContained",
  custom = "custom",
  facebook = "facebook",
  globe2 = "globe2",
  globe3 = "globe3",
  helpCircleContained = "helpCircleContained",
  helpSquareContained = "helpSquareContained",
  home3 = "home3",
  home4 = "home4",
  instagram = "instagram",
  kakaoTalk = "kakaoTalk",
  line = "line",
  linkExternal = "linkExternal",
  mail1 = "mail1",
  menu1 = "menu1",
  messageChat2 = "messageChat2",
  messageCircle = "messageCircle",
  messageNotifyCircle = "messageNotifyCircle",
  messageNotifySquare = "messageNotifySquare",
  messageSquare = "messageSquare",
  messageText1 = "messageText1",
  messageText2 = "messageText2",
  send1 = "send1",
  send2 = "send2",
  settings = "settings",
  shieldCheck = "shieldCheck",
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

export enum Service {
  apiJourneys = "apiJourneys",
  apiLanguages = "apiLanguages",
  apiMedia = "apiMedia",
  apiTags = "apiTags",
  apiUsers = "apiUsers",
  apiVideos = "apiVideos",
}

export enum TextResponseType {
  email = "email",
  freeForm = "freeForm",
  name = "name",
  phone = "phone",
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

export enum UserTeamRole {
  manager = "manager",
  member = "member",
}

export enum VideoBlockObjectFit {
  fill = "fill",
  fit = "fit",
  zoomed = "zoomed",
}

export enum VideoBlockSource {
  cloudflare = "cloudflare",
  internal = "internal",
  mux = "mux",
  youTube = "youTube",
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

export interface JourneyProfileUpdateInput {
  lastActiveTeamId?: string | null;
  journeyFlowBackButtonClicked?: boolean | null;
  plausibleJourneyFlowViewed?: boolean | null;
  plausibleDashboardViewed?: boolean | null;
}

export interface JourneyViewEventCreateInput {
  id?: string | null;
  journeyId: string;
  label?: string | null;
  value?: string | null;
}

export interface JourneysFilter {
  featured?: boolean | null;
  template?: boolean | null;
  ids?: string[] | null;
  tagIds?: string[] | null;
  languageIds?: string[] | null;
  limit?: number | null;
  orderByRecent?: boolean | null;
  fromTemplateId?: string | null;
}

export interface JourneysQueryOptions {
  hostname?: string | null;
  embedded?: boolean | null;
  journeyCollection?: boolean | null;
}

export interface LanguagesFilter {
  ids?: string[] | null;
  bcp47?: string[] | null;
  iso3?: string[] | null;
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
  countryCode?: string | null;
  referrer?: string | null;
  phone?: string | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================

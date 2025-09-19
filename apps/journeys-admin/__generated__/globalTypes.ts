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

export enum EventType {
  ButtonClickEvent = "ButtonClickEvent",
  ChatOpenEvent = "ChatOpenEvent",
  JourneyViewEvent = "JourneyViewEvent",
  RadioQuestionSubmissionEvent = "RadioQuestionSubmissionEvent",
  SignUpSubmissionEvent = "SignUpSubmissionEvent",
  StepNextEvent = "StepNextEvent",
  StepPreviousEvent = "StepPreviousEvent",
  StepViewEvent = "StepViewEvent",
  TextResponseSubmissionEvent = "TextResponseSubmissionEvent",
  VideoCollapseEvent = "VideoCollapseEvent",
  VideoCompleteEvent = "VideoCompleteEvent",
  VideoExpandEvent = "VideoExpandEvent",
  VideoPauseEvent = "VideoPauseEvent",
  VideoPlayEvent = "VideoPlayEvent",
  VideoProgressEvent = "VideoProgressEvent",
  VideoStartEvent = "VideoStartEvent",
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

export enum IntegrationType {
  growthSpaces = "growthSpaces",
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

export enum JourneyVisitorSort {
  activity = "activity",
  date = "date",
  duration = "duration",
}

export enum JourneysReportType {
  multipleFull = "multipleFull",
  multipleSummary = "multipleSummary",
  singleFull = "singleFull",
  singleSummary = "singleSummary",
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

export enum SegmindModel {
  kandinsky2__2_txt2img = "kandinsky2__2_txt2img",
  sd1__5_paragon = "sd1__5_paragon",
  sdxl1__0_txt2img = "sdxl1__0_txt2img",
  tinysd1__5_txt2img = "tinysd1__5_txt2img",
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

export interface BlockDuplicateIdMap {
  oldId: string;
  newId: string;
}

export interface BlockUpdateActionInput {
  gtmEventName?: string | null;
  email?: string | null;
  url?: string | null;
  phone?: string | null;
  countryCode?: string | null;
  target?: string | null;
  blockId?: string | null;
}

export interface ButtonBlockCreateInput {
  id?: string | null;
  journeyId: string;
  parentBlockId: string;
  label: string;
  variant?: ButtonVariant | null;
  color?: ButtonColor | null;
  size?: ButtonSize | null;
  submitEnabled?: boolean | null;
  settings?: ButtonBlockSettingsInput | null;
}

export interface ButtonBlockSettingsInput {
  alignment?: ButtonAlignment | null;
  color?: string | null;
}

export interface ButtonBlockUpdateInput {
  parentBlockId?: string | null;
  label?: string | null;
  variant?: ButtonVariant | null;
  color?: ButtonColor | null;
  size?: ButtonSize | null;
  startIconId?: string | null;
  endIconId?: string | null;
  submitEnabled?: boolean | null;
  settings?: ButtonBlockSettingsInput | null;
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

export interface CardBlockCreateInput {
  id?: string | null;
  journeyId: string;
  parentBlockId: string;
  backgroundColor?: string | null;
  backdropBlur?: number | null;
  fullscreen?: boolean | null;
  themeMode?: ThemeMode | null;
  themeName?: ThemeName | null;
}

export interface CardBlockUpdateInput {
  parentBlockId?: string | null;
  coverBlockId?: string | null;
  backgroundColor?: string | null;
  backdropBlur?: number | null;
  fullscreen?: boolean | null;
  themeMode?: ThemeMode | null;
  themeName?: ThemeName | null;
}

export interface ChatButtonCreateInput {
  link?: string | null;
  platform?: MessagePlatform | null;
}

export interface ChatButtonUpdateInput {
  link?: string | null;
  platform?: MessagePlatform | null;
}

export interface ChatOpenEventCreateInput {
  id?: string | null;
  blockId: string;
  stepId?: string | null;
  value?: MessagePlatform | null;
}

export interface CreateVerificationRequestInput {
  redirect?: string | null;
}

export interface CustomDomainCreateInput {
  id?: string | null;
  teamId: string;
  name: string;
  journeyCollectionId?: string | null;
  routeAllTeamJourneys?: boolean | null;
}

export interface CustomDomainUpdateInput {
  journeyCollectionId?: string | null;
  routeAllTeamJourneys?: boolean | null;
}

export interface EmailActionInput {
  gtmEventName?: string | null;
  email: string;
  customizable?: boolean | null;
  parentStepId?: string | null;
}

export interface HostCreateInput {
  title: string;
  location?: string | null;
  src1?: string | null;
  src2?: string | null;
}

export interface HostUpdateInput {
  title?: string | null;
  location?: string | null;
  src1?: string | null;
  src2?: string | null;
}

export interface IconBlockCreateInput {
  id?: string | null;
  parentBlockId: string;
  journeyId: string;
  name?: IconName | null;
  color?: IconColor | null;
  size?: IconSize | null;
}

export interface ImageBlockCreateInput {
  id?: string | null;
  parentBlockId?: string | null;
  journeyId: string;
  src?: string | null;
  alt: string;
  blurhash?: string | null;
  width?: number | null;
  height?: number | null;
  isCover?: boolean | null;
  scale?: number | null;
  focalTop?: number | null;
  focalLeft?: number | null;
}

export interface ImageBlockUpdateInput {
  parentBlockId?: string | null;
  src?: string | null;
  alt?: string | null;
  blurhash?: string | null;
  width?: number | null;
  height?: number | null;
  scale?: number | null;
  focalTop?: number | null;
  focalLeft?: number | null;
}

export interface IntegrationGrowthSpacesCreateInput {
  accessId: string;
  accessSecret: string;
  teamId: string;
}

export interface IntegrationGrowthSpacesUpdateInput {
  accessId: string;
  accessSecret: string;
}

export interface JourneyCollectionCreateInput {
  id?: string | null;
  teamId: string;
  title?: string | null;
  journeyIds?: string[] | null;
}

export interface JourneyCollectionUpdateInput {
  title?: string | null;
  journeyIds?: string[] | null;
}

export interface JourneyEventsExportLogInput {
  journeyId: string;
  eventsFilter: EventType[];
  dateRangeStart?: any | null;
  dateRangeEnd?: any | null;
}

export interface JourneyEventsFilter {
  typenames?: string[] | null;
  periodRangeStart?: any | null;
  periodRangeEnd?: any | null;
}

export interface JourneyNotificationUpdateInput {
  journeyId: string;
  visitorInteractionEmail: boolean;
}

export interface JourneyProfileUpdateInput {
  lastActiveTeamId?: string | null;
  journeyFlowBackButtonClicked?: boolean | null;
  plausibleJourneyFlowViewed?: boolean | null;
  plausibleDashboardViewed?: boolean | null;
}

export interface JourneyTemplateInput {
  template?: boolean | null;
}

export interface JourneyThemeCreateInput {
  journeyId: string;
  headerFont?: string | null;
  bodyFont?: string | null;
  labelFont?: string | null;
}

export interface JourneyThemeUpdateInput {
  headerFont?: string | null;
  bodyFont?: string | null;
  labelFont?: string | null;
}

export interface JourneyUpdateInput {
  title?: string | null;
  languageId?: string | null;
  themeMode?: ThemeMode | null;
  themeName?: ThemeName | null;
  description?: string | null;
  creatorDescription?: string | null;
  creatorImageBlockId?: string | null;
  primaryImageBlockId?: string | null;
  slug?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  hostId?: string | null;
  strategySlug?: string | null;
  tagIds?: string[] | null;
  website?: boolean | null;
  showShareButton?: boolean | null;
  showLikeButton?: boolean | null;
  showDislikeButton?: boolean | null;
  displayTitle?: string | null;
  showHosts?: boolean | null;
  showChatButtons?: boolean | null;
  showReactionButtons?: boolean | null;
  showLogo?: boolean | null;
  showMenu?: boolean | null;
  showDisplayTitle?: boolean | null;
  menuButtonIcon?: JourneyMenuButtonIcon | null;
  menuStepBlockId?: string | null;
  logoImageBlockId?: string | null;
  socialNodeX?: number | null;
  socialNodeY?: number | null;
}

export interface JourneyVisitorFilter {
  journeyId: string;
  hasChatStarted?: boolean | null;
  hasPollAnswers?: boolean | null;
  hasTextResponse?: boolean | null;
  hasIcon?: boolean | null;
  hideInactive?: boolean | null;
  countryCode?: string | null;
}

export interface JourneysEmailPreferenceUpdateInput {
  email: string;
  preference: string;
  value: boolean;
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

export interface LinkActionInput {
  gtmEventName?: string | null;
  url: string;
  target?: string | null;
  customizable?: boolean | null;
  parentStepId?: string | null;
}

export interface MeInput {
  redirect?: string | null;
}

export interface QrCodeCreateInput {
  teamId: string;
  journeyId: string;
}

export interface QrCodesFilter {
  journeyId?: string | null;
  teamId?: string | null;
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
  pollOptionImageBlockId?: string | null;
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

export interface SpacerBlockCreateInput {
  id?: string | null;
  journeyId: string;
  parentBlockId: string;
  spacing?: number | null;
}

export interface StepBlockCreateInput {
  id?: string | null;
  journeyId: string;
  nextBlockId?: string | null;
  locked?: boolean | null;
  x?: number | null;
  y?: number | null;
}

export interface StepBlockPositionUpdateInput {
  id: string;
  x?: number | null;
  y?: number | null;
}

export interface StepBlockUpdateInput {
  nextBlockId?: string | null;
  locked?: boolean | null;
  x?: number | null;
  y?: number | null;
  slug?: string | null;
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

export interface TeamCreateInput {
  title: string;
  publicTitle?: string | null;
}

export interface TeamUpdateInput {
  title: string;
  publicTitle?: string | null;
}

export interface TextResponseBlockCreateInput {
  id?: string | null;
  journeyId: string;
  parentBlockId: string;
  label: string;
}

export interface TextResponseBlockUpdateInput {
  parentBlockId?: string | null;
  label?: string | null;
  placeholder?: string | null;
  required?: boolean | null;
  hint?: string | null;
  hideLabel?: boolean | null;
  minRows?: number | null;
  routeId?: string | null;
  type?: TextResponseType | null;
  integrationId?: string | null;
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
  settings?: TypographyBlockSettingsInput | null;
}

export interface TypographyBlockSettingsInput {
  color?: string | null;
}

export interface TypographyBlockUpdateInput {
  parentBlockId?: string | null;
  content?: string | null;
  variant?: TypographyVariant | null;
  color?: TypographyColor | null;
  align?: TypographyAlign | null;
  settings?: TypographyBlockSettingsInput | null;
}

export interface UserInviteCreateInput {
  email: string;
}

export interface UserTeamFilterInput {
  role?: UserTeamRole[] | null;
}

export interface UserTeamInviteCreateInput {
  email: string;
}

export interface UserTeamUpdateInput {
  role: UserTeamRole;
}

export interface VideoBlockCreateInput {
  id?: string | null;
  journeyId: string;
  parentBlockId: string;
  videoId?: string | null;
  videoVariantLanguageId?: string | null;
  source?: VideoBlockSource | null;
  isCover?: boolean | null;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  duration?: number | null;
  objectFit?: VideoBlockObjectFit | null;
  startAt?: number | null;
  endAt?: number | null;
  muted?: boolean | null;
  autoplay?: boolean | null;
  fullsize?: boolean | null;
  posterBlockId?: string | null;
}

export interface VideoBlockUpdateInput {
  parentBlockId?: string | null;
  videoId?: string | null;
  videoVariantLanguageId?: string | null;
  posterBlockId?: string | null;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  duration?: number | null;
  objectFit?: VideoBlockObjectFit | null;
  startAt?: number | null;
  endAt?: number | null;
  muted?: boolean | null;
  autoplay?: boolean | null;
  fullsize?: boolean | null;
  source?: VideoBlockSource | null;
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

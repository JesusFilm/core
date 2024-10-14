/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date string, such as 2007-12-03, compliant with the `full-date` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  Date: { input: any; output: any; }
  DateTime: { input: any; output: any; }
  Json: { input: any; output: any; }
  join__FieldSet: { input: any; output: any; }
  link__Import: { input: any; output: any; }
};

export type BlockDuplicateIdMap = {
  newId: Scalars['ID']['input'];
  oldId: Scalars['ID']['input'];
};

export type BlockUpdateActionInput = {
  blockId?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  gtmEventName?: InputMaybe<Scalars['String']['input']>;
  target?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type BlocksFilter = {
  journeyIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  typenames?: InputMaybe<Array<Scalars['String']['input']>>;
};

export enum ButtonAction {
  EmailAction = 'EmailAction',
  LinkAction = 'LinkAction',
  NavigateToBlockAction = 'NavigateToBlockAction'
}

export type ButtonBlockCreateInput = {
  color?: InputMaybe<ButtonColor>;
  id?: InputMaybe<Scalars['ID']['input']>;
  journeyId: Scalars['ID']['input'];
  label: Scalars['String']['input'];
  parentBlockId: Scalars['ID']['input'];
  size?: InputMaybe<ButtonSize>;
  variant?: InputMaybe<ButtonVariant>;
};

export type ButtonBlockUpdateInput = {
  color?: InputMaybe<ButtonColor>;
  endIconId?: InputMaybe<Scalars['ID']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  parentBlockId?: InputMaybe<Scalars['ID']['input']>;
  size?: InputMaybe<ButtonSize>;
  startIconId?: InputMaybe<Scalars['ID']['input']>;
  variant?: InputMaybe<ButtonVariant>;
};

export type ButtonClickEventCreateInput = {
  /** Action type of the button when it was clicked */
  action?: InputMaybe<ButtonAction>;
  /**
   * The label for each corresponding action, mapping below:
   * NavigateToBlockAction - StepName (generated in client) of the StepBlock
   * LinkAction - url of the link
   */
  actionValue?: InputMaybe<Scalars['String']['input']>;
  blockId: Scalars['ID']['input'];
  /** ID should be unique Event UUID (Provided for optimistic mutation result matching) */
  id?: InputMaybe<Scalars['ID']['input']>;
  /** stepName of the parent stepBlock */
  label?: InputMaybe<Scalars['String']['input']>;
  /** id of the parent stepBlock */
  stepId?: InputMaybe<Scalars['ID']['input']>;
  /** label of the button */
  value?: InputMaybe<Scalars['String']['input']>;
};

export enum ButtonColor {
  Error = 'error',
  Inherit = 'inherit',
  Primary = 'primary',
  Secondary = 'secondary'
}

export enum ButtonSize {
  Large = 'large',
  Medium = 'medium',
  Small = 'small'
}

export enum ButtonVariant {
  Contained = 'contained',
  Text = 'text'
}

export type CardBlockCreateInput = {
  backgroundColor?: InputMaybe<Scalars['String']['input']>;
  fullscreen?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  journeyId: Scalars['ID']['input'];
  parentBlockId: Scalars['ID']['input'];
  themeMode?: InputMaybe<ThemeMode>;
  themeName?: InputMaybe<ThemeName>;
};

export type CardBlockUpdateInput = {
  backgroundColor?: InputMaybe<Scalars['String']['input']>;
  coverBlockId?: InputMaybe<Scalars['ID']['input']>;
  fullscreen?: InputMaybe<Scalars['Boolean']['input']>;
  parentBlockId?: InputMaybe<Scalars['ID']['input']>;
  themeMode?: InputMaybe<ThemeMode>;
  themeName?: InputMaybe<ThemeName>;
};

export type ChatButtonCreateInput = {
  link?: InputMaybe<Scalars['String']['input']>;
  platform?: InputMaybe<MessagePlatform>;
};

export type ChatButtonUpdateInput = {
  link?: InputMaybe<Scalars['String']['input']>;
  platform?: InputMaybe<MessagePlatform>;
};

export type ChatOpenEventCreateInput = {
  blockId: Scalars['ID']['input'];
  /** ID should be unique Event UUID (Provided for optimistic mutation result matching) */
  id?: InputMaybe<Scalars['ID']['input']>;
  /** id of the parent stepBlock */
  stepId?: InputMaybe<Scalars['ID']['input']>;
  /** messagePlatform of the link used for chat */
  value?: InputMaybe<MessagePlatform>;
};

export type CreateVerificationRequestInput = {
  redirect?: InputMaybe<Scalars['String']['input']>;
};

export type CustomDomainCreateInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  journeyCollectionId?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
  routeAllTeamJourneys?: InputMaybe<Scalars['Boolean']['input']>;
  teamId: Scalars['String']['input'];
};

export type CustomDomainUpdateInput = {
  journeyCollectionId?: InputMaybe<Scalars['ID']['input']>;
  routeAllTeamJourneys?: InputMaybe<Scalars['Boolean']['input']>;
};

export enum DeviceType {
  Console = 'console',
  Embedded = 'embedded',
  Mobile = 'mobile',
  Smarttv = 'smarttv',
  Tablet = 'tablet',
  Wearable = 'wearable'
}

export type EmailActionInput = {
  email: Scalars['String']['input'];
  gtmEventName?: InputMaybe<Scalars['String']['input']>;
};

export enum GridAlignItems {
  Baseline = 'baseline',
  Center = 'center',
  FlexEnd = 'flexEnd',
  FlexStart = 'flexStart'
}

export enum GridDirection {
  Column = 'column',
  ColumnReverse = 'columnReverse',
  Row = 'row',
  RowReverse = 'rowReverse'
}

export enum GridJustifyContent {
  Center = 'center',
  FlexEnd = 'flexEnd',
  FlexStart = 'flexStart'
}

export type HostCreateInput = {
  location?: InputMaybe<Scalars['String']['input']>;
  src1?: InputMaybe<Scalars['String']['input']>;
  src2?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type HostUpdateInput = {
  location?: InputMaybe<Scalars['String']['input']>;
  src1?: InputMaybe<Scalars['String']['input']>;
  src2?: InputMaybe<Scalars['String']['input']>;
  /** title can be undefined as to not update title, but it cannot be null as to clear the value of title */
  title?: InputMaybe<Scalars['String']['input']>;
};

export type IconBlockCreateInput = {
  color?: InputMaybe<IconColor>;
  /** ID should be unique Response UUID (Provided for optimistic mutation result matching) */
  id?: InputMaybe<Scalars['ID']['input']>;
  journeyId: Scalars['ID']['input'];
  name?: InputMaybe<IconName>;
  parentBlockId: Scalars['ID']['input'];
  size?: InputMaybe<IconSize>;
};

export type IconBlockUpdateInput = {
  color?: InputMaybe<IconColor>;
  name?: InputMaybe<IconName>;
  size?: InputMaybe<IconSize>;
};

export enum IconColor {
  Action = 'action',
  Disabled = 'disabled',
  Error = 'error',
  Inherit = 'inherit',
  Primary = 'primary',
  Secondary = 'secondary'
}

/** IconName is equivalent to the icons found in @mui/icons-material */
export enum IconName {
  ArrowBackRounded = 'ArrowBackRounded',
  ArrowForwardRounded = 'ArrowForwardRounded',
  BeenhereRounded = 'BeenhereRounded',
  ChatBubbleOutlineRounded = 'ChatBubbleOutlineRounded',
  CheckCircleRounded = 'CheckCircleRounded',
  ChevronLeftRounded = 'ChevronLeftRounded',
  ChevronRightRounded = 'ChevronRightRounded',
  ContactSupportRounded = 'ContactSupportRounded',
  FormatQuoteRounded = 'FormatQuoteRounded',
  Launch = 'Launch',
  LiveTvRounded = 'LiveTvRounded',
  LockOpenRounded = 'LockOpenRounded',
  MailOutline = 'MailOutline',
  MenuBookRounded = 'MenuBookRounded',
  PlayArrowRounded = 'PlayArrowRounded',
  RadioButtonUncheckedRounded = 'RadioButtonUncheckedRounded',
  SendRounded = 'SendRounded',
  SubscriptionsRounded = 'SubscriptionsRounded',
  TranslateRounded = 'TranslateRounded'
}

export enum IconSize {
  Inherit = 'inherit',
  Lg = 'lg',
  Md = 'md',
  Sm = 'sm',
  Xl = 'xl'
}

export enum IdType {
  DatabaseId = 'databaseId',
  Slug = 'slug'
}

export enum ImageAspectRatio {
  Banner = 'banner',
  Hd = 'hd'
}

export type ImageBlockCreateInput = {
  alt: Scalars['String']['input'];
  /** If blurhash, width, & height are provided, the image will skip blurhash processing. Otherwise these values will be calculated. */
  blurhash?: InputMaybe<Scalars['String']['input']>;
  height?: InputMaybe<Scalars['Int']['input']>;
  /** ID should be unique Response UUID (Provided for optimistic mutation result matching) */
  id?: InputMaybe<Scalars['ID']['input']>;
  /** True if the coverBlockId in a parent block should be set to this block's id. */
  isCover?: InputMaybe<Scalars['Boolean']['input']>;
  journeyId: Scalars['ID']['input'];
  parentBlockId?: InputMaybe<Scalars['ID']['input']>;
  scale?: InputMaybe<Scalars['Int']['input']>;
  src?: InputMaybe<Scalars['String']['input']>;
  width?: InputMaybe<Scalars['Int']['input']>;
};

export type ImageBlockUpdateInput = {
  alt?: InputMaybe<Scalars['String']['input']>;
  /** If blurhash, width, & height are provided, the image will skip blurhash processing. Otherwise these values will be calculated. */
  blurhash?: InputMaybe<Scalars['String']['input']>;
  height?: InputMaybe<Scalars['Int']['input']>;
  parentBlockId?: InputMaybe<Scalars['ID']['input']>;
  scale?: InputMaybe<Scalars['Int']['input']>;
  src?: InputMaybe<Scalars['String']['input']>;
  width?: InputMaybe<Scalars['Int']['input']>;
};

export type ImageInput = {
  aspectRatio?: InputMaybe<ImageAspectRatio>;
  videoId?: InputMaybe<Scalars['ID']['input']>;
};

export type IntegrationGrowthSpacesCreateInput = {
  accessId: Scalars['String']['input'];
  accessSecret: Scalars['String']['input'];
  teamId: Scalars['String']['input'];
};

export type IntegrationGrowthSpacesUpdateInput = {
  accessId: Scalars['String']['input'];
  accessSecret: Scalars['String']['input'];
};

export enum IntegrationType {
  GrowthSpaces = 'growthSpaces'
}

export type JourneyCollectionCreateInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  journeyIds?: InputMaybe<Array<Scalars['String']['input']>>;
  teamId: Scalars['String']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
};

export type JourneyCollectionUpdateInput = {
  journeyIds?: InputMaybe<Array<Scalars['String']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type JourneyCreateInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  /**
   * ID should be unique Response UUID
   * (Provided for optimistic mutation result matching)
   */
  id?: InputMaybe<Scalars['ID']['input']>;
  languageId: Scalars['String']['input'];
  /**
   * Slug should be unique amongst all journeys
   * (server will throw BAD_USER_INPUT error if not)
   * If not required will use title formatted with kebab-case
   * If the generated slug is not unique the uuid will be placed
   * at the end of the slug guaranteeing uniqueness
   */
  slug?: InputMaybe<Scalars['String']['input']>;
  themeMode?: InputMaybe<ThemeMode>;
  themeName?: InputMaybe<ThemeName>;
  title: Scalars['String']['input'];
};

export enum JourneyMenuButtonIcon {
  ChevronDown = 'chevronDown',
  Ellipsis = 'ellipsis',
  Equals = 'equals',
  Grid1 = 'grid1',
  Home3 = 'home3',
  Home4 = 'home4',
  Menu1 = 'menu1',
  More = 'more'
}

export type JourneyNotificationUpdateInput = {
  journeyId: Scalars['ID']['input'];
  visitorInteractionEmail: Scalars['Boolean']['input'];
};

export type JourneyProfileUpdateInput = {
  journeyFlowBackButtonClicked?: InputMaybe<Scalars['Boolean']['input']>;
  lastActiveTeamId?: InputMaybe<Scalars['String']['input']>;
  plausibleDashboardViewed?: InputMaybe<Scalars['Boolean']['input']>;
  plausibleJourneyFlowViewed?: InputMaybe<Scalars['Boolean']['input']>;
};

export enum JourneyStatus {
  Archived = 'archived',
  Deleted = 'deleted',
  Draft = 'draft',
  Published = 'published',
  Trashed = 'trashed'
}

export type JourneyTemplateInput = {
  template?: InputMaybe<Scalars['Boolean']['input']>;
};

export type JourneyUpdateInput = {
  creatorDescription?: InputMaybe<Scalars['String']['input']>;
  creatorImageBlockId?: InputMaybe<Scalars['ID']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  displayTitle?: InputMaybe<Scalars['String']['input']>;
  hostId?: InputMaybe<Scalars['String']['input']>;
  languageId?: InputMaybe<Scalars['String']['input']>;
  logoImageBlockId?: InputMaybe<Scalars['ID']['input']>;
  menuButtonIcon?: InputMaybe<JourneyMenuButtonIcon>;
  menuStepBlockId?: InputMaybe<Scalars['ID']['input']>;
  primaryImageBlockId?: InputMaybe<Scalars['ID']['input']>;
  seoDescription?: InputMaybe<Scalars['String']['input']>;
  seoTitle?: InputMaybe<Scalars['String']['input']>;
  showChatButtons?: InputMaybe<Scalars['Boolean']['input']>;
  showDislikeButton?: InputMaybe<Scalars['Boolean']['input']>;
  showDisplayTitle?: InputMaybe<Scalars['Boolean']['input']>;
  showHosts?: InputMaybe<Scalars['Boolean']['input']>;
  showLikeButton?: InputMaybe<Scalars['Boolean']['input']>;
  showLogo?: InputMaybe<Scalars['Boolean']['input']>;
  showMenu?: InputMaybe<Scalars['Boolean']['input']>;
  showReactionButtons?: InputMaybe<Scalars['Boolean']['input']>;
  showShareButton?: InputMaybe<Scalars['Boolean']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  strategySlug?: InputMaybe<Scalars['String']['input']>;
  tagIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  themeMode?: InputMaybe<ThemeMode>;
  themeName?: InputMaybe<ThemeName>;
  title?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['Boolean']['input']>;
};

export type JourneyViewEventCreateInput = {
  /** ID should be unique Event UUID (Provided for optimistic mutation result matching) */
  id?: InputMaybe<Scalars['ID']['input']>;
  journeyId: Scalars['ID']['input'];
  /** title of the journey being viewed */
  label?: InputMaybe<Scalars['String']['input']>;
  /** languageId of the journey being viewed */
  value?: InputMaybe<Scalars['ID']['input']>;
};

export type JourneyVisitorFilter = {
  countryCode?: InputMaybe<Scalars['String']['input']>;
  hasChatStarted?: InputMaybe<Scalars['Boolean']['input']>;
  hasIcon?: InputMaybe<Scalars['Boolean']['input']>;
  hasPollAnswers?: InputMaybe<Scalars['Boolean']['input']>;
  hasTextResponse?: InputMaybe<Scalars['Boolean']['input']>;
  hideInactive?: InputMaybe<Scalars['Boolean']['input']>;
  journeyId: Scalars['String']['input'];
};

export enum JourneyVisitorSort {
  Activity = 'activity',
  Date = 'date',
  Duration = 'duration'
}

export type JourneysEmailPreferenceUpdateInput = {
  email: Scalars['String']['input'];
  preference: Scalars['String']['input'];
  value: Scalars['Boolean']['input'];
};

export type JourneysFilter = {
  featured?: InputMaybe<Scalars['Boolean']['input']>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  languageIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderByRecent?: InputMaybe<Scalars['Boolean']['input']>;
  tagIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  template?: InputMaybe<Scalars['Boolean']['input']>;
};

export type JourneysQueryOptions = {
  /** is this being requested from an embed url */
  embedded?: InputMaybe<Scalars['Boolean']['input']>;
  /**
   * hostname filters journeys to those that belong to a team with a custom domain
   * matching the hostname.
   */
  hostname?: InputMaybe<Scalars['String']['input']>;
  /** limit results to journeys in a journey collection (currently only available when using hostname option) */
  journeyCollection?: InputMaybe<Scalars['Boolean']['input']>;
};

export enum JourneysReportType {
  MultipleFull = 'multipleFull',
  MultipleSummary = 'multipleSummary',
  SingleFull = 'singleFull',
  SingleSummary = 'singleSummary'
}

export enum LanguageIdType {
  Bcp47 = 'bcp47',
  DatabaseId = 'databaseId'
}

export type LanguagesFilter = {
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type LinkActionInput = {
  gtmEventName?: InputMaybe<Scalars['String']['input']>;
  target?: InputMaybe<Scalars['String']['input']>;
  url: Scalars['String']['input'];
};

export type MeInput = {
  redirect?: InputMaybe<Scalars['String']['input']>;
};

export enum MediaRole {
  Publisher = 'publisher'
}

export enum MessagePlatform {
  CheckBroken = 'checkBroken',
  CheckContained = 'checkContained',
  Custom = 'custom',
  Facebook = 'facebook',
  Globe2 = 'globe2',
  Globe3 = 'globe3',
  HelpCircleContained = 'helpCircleContained',
  HelpSquareContained = 'helpSquareContained',
  Home3 = 'home3',
  Home4 = 'home4',
  Instagram = 'instagram',
  Line = 'line',
  LinkExternal = 'linkExternal',
  Mail1 = 'mail1',
  Menu1 = 'menu1',
  MessageChat2 = 'messageChat2',
  MessageCircle = 'messageCircle',
  MessageNotifyCircle = 'messageNotifyCircle',
  MessageNotifySquare = 'messageNotifySquare',
  MessageSquare = 'messageSquare',
  MessageText1 = 'messageText1',
  MessageText2 = 'messageText2',
  Send1 = 'send1',
  Send2 = 'send2',
  Settings = 'settings',
  ShieldCheck = 'shieldCheck',
  Skype = 'skype',
  Snapchat = 'snapchat',
  Telegram = 'telegram',
  TikTok = 'tikTok',
  Viber = 'viber',
  Vk = 'vk',
  WhatsApp = 'whatsApp'
}

export type NavigateToBlockActionInput = {
  blockId: Scalars['String']['input'];
  gtmEventName?: InputMaybe<Scalars['String']['input']>;
};

export type PlausibleStatsAggregateFilter = {
  /**
   * date in the standard ISO-8601 format (YYYY-MM-DD).
   * When using a custom range, the date parameter expects two ISO-8601 formatted
   * dates joined with a comma e.g `2021-01-01,2021-01-31`. Stats will be returned
   * for the whole date range inclusive of the start and end dates.
   */
  date?: InputMaybe<Scalars['String']['input']>;
  /**
   * See [filtering](https://plausible.io/docs/stats-api#filtering)
   * section for more details.
   */
  filters?: InputMaybe<Scalars['String']['input']>;
  /**
   * Off by default. You can specify `previous_period` to calculate the percent
   * difference with the previous period for each metric. The previous period
   * will be of the exact same length as specified in the period parameter.
   */
  interval?: InputMaybe<Scalars['String']['input']>;
  /**
   * See [time periods](https://plausible.io/docs/stats-api#time-periods).
   * If not specified, it will default to 30d.
   */
  period?: InputMaybe<Scalars['String']['input']>;
};

export type PlausibleStatsBreakdownFilter = {
  /**
   * date in the standard ISO-8601 format (YYYY-MM-DD).
   * When using a custom range, the date parameter expects two ISO-8601 formatted
   * dates joined with a comma e.g `2021-01-01,2021-01-31`. Stats will be returned
   * for the whole date range inclusive of the start and end dates.
   */
  date?: InputMaybe<Scalars['String']['input']>;
  /**
   * See [filtering](https://plausible.io/docs/stats-api#filtering)
   * section for more details.
   */
  filters?: InputMaybe<Scalars['String']['input']>;
  /**
   * Limit the number of results. Maximum value is 1000. Defaults to 100.
   * If you want to get more than 1000 results, you can make multiple requests
   * and paginate the results by specifying the page parameter (e.g. make the
   * same request with page=1, then page=2, etc)
   */
  limit?: InputMaybe<Scalars['Int']['input']>;
  /**
   * Number of the page, used to paginate results.
   * Importantly, the page numbers start from 1 not 0.
   */
  page?: InputMaybe<Scalars['Int']['input']>;
  /**
   * See [time periods](https://plausible.io/docs/stats-api#time-periods).
   * If not specified, it will default to 30d.
   */
  period?: InputMaybe<Scalars['String']['input']>;
  /**
   * Which [property](https://plausible.io/docs/stats-api#properties)
   * to break down the stats by.
   */
  property: Scalars['String']['input'];
};

export type PlausibleStatsTimeseriesFilter = {
  /**
   * date in the standard ISO-8601 format (YYYY-MM-DD).
   * When using a custom range, the date parameter expects two ISO-8601 formatted
   * dates joined with a comma e.g `2021-01-01,2021-01-31`. Stats will be returned
   * for the whole date range inclusive of the start and end dates.
   */
  date?: InputMaybe<Scalars['String']['input']>;
  /**
   * See [filtering](https://plausible.io/docs/stats-api#filtering)
   * section for more details.
   */
  filters?: InputMaybe<Scalars['String']['input']>;
  /**
   * Choose your reporting interval. Valid options are date (always) and month
   * (when specified period is longer than one calendar month). Defaults to month
   * for 6mo and 12mo, otherwise falls back to date.
   */
  interval?: InputMaybe<Scalars['String']['input']>;
  /**
   * See [time periods](https://plausible.io/docs/stats-api#time-periods).
   * If not specified, it will default to 30d.
   */
  period?: InputMaybe<Scalars['String']['input']>;
};

export type RadioOptionBlockCreateInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  journeyId: Scalars['ID']['input'];
  label: Scalars['String']['input'];
  parentBlockId: Scalars['ID']['input'];
};

export type RadioOptionBlockUpdateInput = {
  label?: InputMaybe<Scalars['String']['input']>;
  parentBlockId?: InputMaybe<Scalars['ID']['input']>;
};

export type RadioQuestionBlockCreateInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  journeyId: Scalars['ID']['input'];
  parentBlockId: Scalars['ID']['input'];
};

export type RadioQuestionSubmissionEventCreateInput = {
  blockId: Scalars['ID']['input'];
  /** ID should be unique Event UUID (Provided for optimistic mutation result matching) */
  id?: InputMaybe<Scalars['ID']['input']>;
  /** stepName of the parent stepBlock */
  label?: InputMaybe<Scalars['String']['input']>;
  radioOptionBlockId: Scalars['ID']['input'];
  /** id of the parent stepBlock */
  stepId?: InputMaybe<Scalars['ID']['input']>;
  /** label of the selected radioOption block */
  value?: InputMaybe<Scalars['String']['input']>;
};

export enum Role {
  /**
   * User can create templates and
   * add them to template library
   */
  Publisher = 'publisher'
}

export enum SegmindModel {
  Kandinsky2_2Txt2img = 'kandinsky2__2_txt2img',
  Sd1_5Paragon = 'sd1__5_paragon',
  Sdxl1_0Txt2img = 'sdxl1__0_txt2img',
  Tinysd1_5Txt2img = 'tinysd1__5_txt2img'
}

export enum Service {
  ApiJourneys = 'apiJourneys',
  ApiLanguages = 'apiLanguages',
  ApiMedia = 'apiMedia',
  ApiTags = 'apiTags',
  ApiUsers = 'apiUsers',
  ApiVideos = 'apiVideos'
}

export type SignUpBlockCreateInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  journeyId: Scalars['ID']['input'];
  parentBlockId: Scalars['ID']['input'];
  submitLabel: Scalars['String']['input'];
};

export type SignUpBlockUpdateInput = {
  parentBlockId?: InputMaybe<Scalars['ID']['input']>;
  submitIconId?: InputMaybe<Scalars['ID']['input']>;
  submitLabel?: InputMaybe<Scalars['String']['input']>;
};

export type SignUpSubmissionEventCreateInput = {
  blockId: Scalars['ID']['input'];
  /** email from the signUpBlock form */
  email: Scalars['String']['input'];
  /** ID should be unique Event UUID (Provided for optimistic mutation result matching) */
  id?: InputMaybe<Scalars['ID']['input']>;
  /** name from the signUpBlock form */
  name: Scalars['String']['input'];
  /** id of the parent stepBlock */
  stepId?: InputMaybe<Scalars['ID']['input']>;
};

export type SiteCreateInput = {
  domain: Scalars['String']['input'];
  goals?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type StepBlockCreateInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  journeyId: Scalars['ID']['input'];
  locked?: InputMaybe<Scalars['Boolean']['input']>;
  nextBlockId?: InputMaybe<Scalars['ID']['input']>;
  /**
   * x is used to position the block horizontally in the journey flow diagram on
   * the editor.
   */
  x?: InputMaybe<Scalars['Int']['input']>;
  /**
   * y is used to position the block vertically in the journey flow diagram on
   * the editor.
   */
  y?: InputMaybe<Scalars['Int']['input']>;
};

export type StepBlockPositionUpdateInput = {
  id: Scalars['ID']['input'];
  x?: InputMaybe<Scalars['Int']['input']>;
  y?: InputMaybe<Scalars['Int']['input']>;
};

export type StepBlockUpdateInput = {
  locked?: InputMaybe<Scalars['Boolean']['input']>;
  nextBlockId?: InputMaybe<Scalars['ID']['input']>;
  /**
   * Slug should be unique amongst all blocks
   * (server will throw BAD_USER_INPUT error if not)
   * If not required will use the current block id
   * If the generated slug is not unique the uuid will be placed
   * at the end of the slug guaranteeing uniqueness
   */
  slug?: InputMaybe<Scalars['String']['input']>;
  /**
   * x is used to position the block horizontally in the journey flow diagram on
   * the editor.
   */
  x?: InputMaybe<Scalars['Int']['input']>;
  /**
   * y is used to position the block vertically in the journey flow diagram on
   * the editor.
   */
  y?: InputMaybe<Scalars['Int']['input']>;
};

export type StepNextEventCreateInput = {
  /** Id of the current StepBlock */
  blockId: Scalars['ID']['input'];
  /** ID should be unique Event UUID (Provided for optimistic mutation result matching) */
  id?: InputMaybe<Scalars['ID']['input']>;
  /** stepName of the current stepBlock */
  label?: InputMaybe<Scalars['String']['input']>;
  /** id of the next stepBlock */
  nextStepId: Scalars['ID']['input'];
  /** stepName of the next stepBlock */
  value?: InputMaybe<Scalars['String']['input']>;
};

export type StepPreviousEventCreateInput = {
  /** Id of the current StepBlock */
  blockId: Scalars['ID']['input'];
  /** ID should be unique Event UUID (Provided for optimistic mutation result matching) */
  id?: InputMaybe<Scalars['ID']['input']>;
  /** stepName of the current stepBlock */
  label?: InputMaybe<Scalars['String']['input']>;
  /** id of the previous stepBlock */
  previousStepId: Scalars['ID']['input'];
  /** stepName of the previous stepBlock */
  value?: InputMaybe<Scalars['String']['input']>;
};

export type StepViewEventCreateInput = {
  /** Id of the current StepBlock */
  blockId: Scalars['ID']['input'];
  /** ID should be unique Event UUID (Provided for optimistic mutation result matching) */
  id?: InputMaybe<Scalars['ID']['input']>;
  /** stepName of the current stepBlock */
  value?: InputMaybe<Scalars['String']['input']>;
};

export type TeamCreateInput = {
  publicTitle?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type TeamUpdateInput = {
  publicTitle?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type TextResponseBlockCreateInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  journeyId: Scalars['ID']['input'];
  label: Scalars['String']['input'];
  parentBlockId: Scalars['ID']['input'];
};

export type TextResponseBlockUpdateInput = {
  hint?: InputMaybe<Scalars['String']['input']>;
  integrationId?: InputMaybe<Scalars['String']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  minRows?: InputMaybe<Scalars['Int']['input']>;
  parentBlockId?: InputMaybe<Scalars['ID']['input']>;
  routeId?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<TextResponseType>;
};

export type TextResponseSubmissionEventCreateInput = {
  blockId: Scalars['ID']['input'];
  /** ID should be unique Event UUID (Provided for optimistic mutation result matching) */
  id?: InputMaybe<Scalars['ID']['input']>;
  /** stepName of the parent stepBlock */
  label?: InputMaybe<Scalars['String']['input']>;
  /** id of the parent stepBlock */
  stepId?: InputMaybe<Scalars['ID']['input']>;
  /** response from the TextResponseBlock form */
  value: Scalars['String']['input'];
};

export enum TextResponseType {
  Email = 'email',
  FreeForm = 'freeForm',
  Name = 'name'
}

export enum ThemeMode {
  Dark = 'dark',
  Light = 'light'
}

export enum ThemeName {
  Base = 'base'
}

export enum TypographyAlign {
  Center = 'center',
  Left = 'left',
  Right = 'right'
}

export type TypographyBlockCreateInput = {
  align?: InputMaybe<TypographyAlign>;
  color?: InputMaybe<TypographyColor>;
  content: Scalars['String']['input'];
  id?: InputMaybe<Scalars['ID']['input']>;
  journeyId: Scalars['ID']['input'];
  parentBlockId: Scalars['ID']['input'];
  variant?: InputMaybe<TypographyVariant>;
};

export type TypographyBlockUpdateInput = {
  align?: InputMaybe<TypographyAlign>;
  color?: InputMaybe<TypographyColor>;
  content?: InputMaybe<Scalars['String']['input']>;
  parentBlockId?: InputMaybe<Scalars['ID']['input']>;
  variant?: InputMaybe<TypographyVariant>;
};

export enum TypographyColor {
  Error = 'error',
  Primary = 'primary',
  Secondary = 'secondary'
}

export enum TypographyVariant {
  Body1 = 'body1',
  Body2 = 'body2',
  Caption = 'caption',
  H1 = 'h1',
  H2 = 'h2',
  H3 = 'h3',
  H4 = 'h4',
  H5 = 'h5',
  H6 = 'h6',
  Overline = 'overline',
  Subtitle1 = 'subtitle1',
  Subtitle2 = 'subtitle2'
}

export enum UnsplashColor {
  Black = 'black',
  BlackAndWhite = 'black_and_white',
  Blue = 'blue',
  Green = 'green',
  Magenta = 'magenta',
  Orange = 'orange',
  Purple = 'purple',
  Red = 'red',
  Teal = 'teal',
  White = 'white',
  Yellow = 'yellow'
}

export enum UnsplashContentFilter {
  High = 'high',
  Low = 'low'
}

export enum UnsplashOrderBy {
  Editorial = 'editorial',
  Latest = 'latest',
  Relevant = 'relevant'
}

export enum UnsplashPhotoOrientation {
  Landscape = 'landscape',
  Portrait = 'portrait',
  Squarish = 'squarish'
}

export type UserInviteCreateInput = {
  email: Scalars['String']['input'];
};

export enum UserJourneyRole {
  Editor = 'editor',
  InviteRequested = 'inviteRequested',
  Owner = 'owner'
}

export type UserTeamFilterInput = {
  role?: InputMaybe<Array<UserTeamRole>>;
};

export type UserTeamInviteCreateInput = {
  email: Scalars['String']['input'];
};

export enum UserTeamRole {
  Manager = 'manager',
  Member = 'member'
}

export type UserTeamUpdateInput = {
  role: UserTeamRole;
};

export type VideoBlockCreateInput = {
  autoplay?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  duration?: InputMaybe<Scalars['Int']['input']>;
  /** endAt dictates at which point of time the video should end */
  endAt?: InputMaybe<Scalars['Int']['input']>;
  fullsize?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  /** True if the coverBlockId in a parent block should be set to this block's id. */
  isCover?: InputMaybe<Scalars['Boolean']['input']>;
  journeyId: Scalars['ID']['input'];
  muted?: InputMaybe<Scalars['Boolean']['input']>;
  /** how the video should display within the VideoBlock */
  objectFit?: InputMaybe<VideoBlockObjectFit>;
  parentBlockId: Scalars['ID']['input'];
  /**
   * posterBlockId is present if a child block should be used as a poster.
   * This child block should not be rendered normally, instead it should be used
   * as the video poster. PosterBlock should be of type ImageBlock.
   */
  posterBlockId?: InputMaybe<Scalars['ID']['input']>;
  /**
   * internal source: videoId and videoVariantLanguageId required
   * youTube source: videoId required
   */
  source?: InputMaybe<VideoBlockSource>;
  /** startAt dictates at which point of time the video should start playing */
  startAt?: InputMaybe<Scalars['Int']['input']>;
  /**
   * internal source videos: videoId and videoVariantLanguageId both need to be set
   * to select a video.
   * For other sources only videoId needs to be set.
   */
  videoId?: InputMaybe<Scalars['ID']['input']>;
  /**
   * internal source videos: videoId and videoVariantLanguageId both need to be set
   * to select a video.
   * For other sources only videoId needs to be set.
   */
  videoVariantLanguageId?: InputMaybe<Scalars['ID']['input']>;
};

export enum VideoBlockObjectFit {
  /**
   * The video is scaled to maintain its aspect ratio while filling the
   *  entire VideoBlock. If the video's aspect ratio does not match the
   *  aspect ratio of the VideoBlock, then the video will be clipped to fit.
   */
  Fill = 'fill',
  /**
   * The video is scaled to maintain its aspect ratio while fitting within the
   *  VideoBlock. The entire video is made to fill the VideoBlock, while
   *  preserving its aspect ratio, so the video will be "letterboxed" if its
   *  aspect ratio does not match the aspect ratio of the VideoBlock.
   */
  Fit = 'fit',
  /**
   * 12.5% of either side of the video is discarded (this has the effect of
   *  converting a 16:9 aspect ratio to 4:3). The remaining video is scaled to
   *  maintain its new aspect ratio while fitting within the VideoBlock.  The
   *  remaining video is made to fill the VideoBlock, while preserving its new
   *  aspect ratio, so the video will be "letterboxed" if its new aspect ratio
   *  does not match the aspect ratio of the VideoBlock.
   */
  Zoomed = 'zoomed'
}

export enum VideoBlockSource {
  Cloudflare = 'cloudflare',
  Internal = 'internal',
  YouTube = 'youTube'
}

export type VideoBlockUpdateInput = {
  autoplay?: InputMaybe<Scalars['Boolean']['input']>;
  duration?: InputMaybe<Scalars['Int']['input']>;
  /** endAt dictates at which point of time the video should end */
  endAt?: InputMaybe<Scalars['Int']['input']>;
  fullsize?: InputMaybe<Scalars['Boolean']['input']>;
  muted?: InputMaybe<Scalars['Boolean']['input']>;
  /** how the video should display within the VideoBlock */
  objectFit?: InputMaybe<VideoBlockObjectFit>;
  /**
   * posterBlockId is present if a child block should be used as a poster.
   * This child block should not be rendered normally, instead it should be used
   * as the video poster. PosterBlock should be of type ImageBlock.
   */
  posterBlockId?: InputMaybe<Scalars['ID']['input']>;
  /**
   * internal source: videoId and videoVariantLanguageId required
   * youTube source: videoId required
   */
  source?: InputMaybe<VideoBlockSource>;
  /** startAt dictates at which point of time the video should start playing */
  startAt?: InputMaybe<Scalars['Int']['input']>;
  /**
   * internal source videos: videoId and videoVariantLanguageId both need to be set
   * to select a video.
   * For other sources only videoId needs to be set.
   */
  videoId?: InputMaybe<Scalars['ID']['input']>;
  /**
   * internal source videos: videoId and videoVariantLanguageId both need to be set
   * to select a video.
   * For other sources only videoId needs to be set.
   */
  videoVariantLanguageId?: InputMaybe<Scalars['ID']['input']>;
};

export type VideoCollapseEventCreateInput = {
  blockId: Scalars['ID']['input'];
  /** ID should be unique Event UUID (Provided for optimistic mutation result matching) */
  id?: InputMaybe<Scalars['ID']['input']>;
  /** title of the video */
  label?: InputMaybe<Scalars['String']['input']>;
  /** duration of the video played when the VideoCollapseEvent is triggered */
  position?: InputMaybe<Scalars['Float']['input']>;
  /** id of the parent stepBlock */
  stepId?: InputMaybe<Scalars['ID']['input']>;
  /** source of the video */
  value?: InputMaybe<VideoBlockSource>;
};

export type VideoCompleteEventCreateInput = {
  blockId: Scalars['ID']['input'];
  /** ID should be unique Event UUID (Provided for optimistic mutation result matching) */
  id?: InputMaybe<Scalars['ID']['input']>;
  /** title of the video */
  label?: InputMaybe<Scalars['String']['input']>;
  /** duration of the video played when the VideoCompleteEvent is triggered */
  position?: InputMaybe<Scalars['Float']['input']>;
  /** id of the parent stepBlock */
  stepId?: InputMaybe<Scalars['ID']['input']>;
  /** source of the video */
  value?: InputMaybe<VideoBlockSource>;
};

export type VideoCreateInput = {
  childIds: Array<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  label: VideoLabel;
  noIndex: Scalars['Boolean']['input'];
  primaryLanguageId: Scalars['String']['input'];
  published: Scalars['Boolean']['input'];
  slug: Scalars['String']['input'];
};

export type VideoExpandEventCreateInput = {
  blockId: Scalars['ID']['input'];
  /** ID should be unique Event UUID (Provided for optimistic mutation result matching) */
  id?: InputMaybe<Scalars['ID']['input']>;
  /** title of the video */
  label?: InputMaybe<Scalars['String']['input']>;
  /** duration of the video played when the VideoExpandEvent is triggered */
  position?: InputMaybe<Scalars['Float']['input']>;
  /** id of the parent stepBlock */
  stepId?: InputMaybe<Scalars['ID']['input']>;
  /** source of the video */
  value?: InputMaybe<VideoBlockSource>;
};

export enum VideoLabel {
  BehindTheScenes = 'behindTheScenes',
  Collection = 'collection',
  Episode = 'episode',
  FeatureFilm = 'featureFilm',
  Segment = 'segment',
  Series = 'series',
  ShortFilm = 'shortFilm',
  Trailer = 'trailer'
}

export type VideoPauseEventCreateInput = {
  blockId: Scalars['ID']['input'];
  /** ID should be unique Event UUID (Provided for optimistic mutation result matching) */
  id?: InputMaybe<Scalars['ID']['input']>;
  /** title of the video */
  label?: InputMaybe<Scalars['String']['input']>;
  /** duration of the video played when the VideoPauseEvent is triggered */
  position?: InputMaybe<Scalars['Float']['input']>;
  /** id of the parent stepBlock */
  stepId?: InputMaybe<Scalars['ID']['input']>;
  /** source of the video */
  value?: InputMaybe<VideoBlockSource>;
};

export type VideoPlayEventCreateInput = {
  blockId: Scalars['ID']['input'];
  /** ID should be unique Event UUID (Provided for optimistic mutation result matching) */
  id?: InputMaybe<Scalars['ID']['input']>;
  /** title of the video */
  label?: InputMaybe<Scalars['String']['input']>;
  /** duration of the video played when the VideoPlayEvent is triggered */
  position?: InputMaybe<Scalars['Float']['input']>;
  /** id of the parent stepBlock */
  stepId?: InputMaybe<Scalars['ID']['input']>;
  /** source of the video */
  value?: InputMaybe<VideoBlockSource>;
};

export type VideoProgressEventCreateInput = {
  blockId: Scalars['ID']['input'];
  /** ID should be unique Event UUID (Provided for optimistic mutation result matching) */
  id?: InputMaybe<Scalars['ID']['input']>;
  /** title of the video */
  label?: InputMaybe<Scalars['String']['input']>;
  /** duration of the video played when the VideoProgressEvent is triggered */
  position?: InputMaybe<Scalars['Float']['input']>;
  /** progress is a integer indicating the precentage completion from the startAt to the endAt times of the videoBlock */
  progress: Scalars['Int']['input'];
  /** id of the parent stepBlock */
  stepId?: InputMaybe<Scalars['ID']['input']>;
  /** source of the video */
  value?: InputMaybe<VideoBlockSource>;
};

export type VideoStartEventCreateInput = {
  blockId: Scalars['ID']['input'];
  /** ID should be unique Event UUID (Provided for optimistic mutation result matching) */
  id?: InputMaybe<Scalars['ID']['input']>;
  /** title of the video */
  label?: InputMaybe<Scalars['String']['input']>;
  /** duration of the video played when the VideoStartEvent is triggered */
  position?: InputMaybe<Scalars['Float']['input']>;
  /** id of the parent stepBlock */
  stepId?: InputMaybe<Scalars['ID']['input']>;
  /** source of the video */
  value?: InputMaybe<VideoBlockSource>;
};

export type VideoStudyQuestionCreateInput = {
  crowdInId?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  languageId: Scalars['String']['input'];
  /** index from 1 */
  order: Scalars['Int']['input'];
  primary: Scalars['Boolean']['input'];
  value: Scalars['String']['input'];
  videoId: Scalars['String']['input'];
};

export type VideoStudyQuestionUpdateInput = {
  crowdInId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  languageId?: InputMaybe<Scalars['String']['input']>;
  /** index from 1 */
  order?: InputMaybe<Scalars['Int']['input']>;
  primary?: InputMaybe<Scalars['Boolean']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

export type VideoSubtitleCreateInput = {
  edition: Scalars['String']['input'];
  id?: InputMaybe<Scalars['ID']['input']>;
  languageId: Scalars['String']['input'];
  primary: Scalars['Boolean']['input'];
  srtSrc?: InputMaybe<Scalars['String']['input']>;
  videoId: Scalars['String']['input'];
  vttSrc?: InputMaybe<Scalars['String']['input']>;
};

export type VideoSubtitleUpdateInput = {
  edition: Scalars['String']['input'];
  id: Scalars['ID']['input'];
  languageId?: InputMaybe<Scalars['String']['input']>;
  primary?: InputMaybe<Scalars['Boolean']['input']>;
  srtSrc?: InputMaybe<Scalars['String']['input']>;
  vttSrc?: InputMaybe<Scalars['String']['input']>;
};

export type VideoTranslationCreateInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  languageId: Scalars['String']['input'];
  primary: Scalars['Boolean']['input'];
  value: Scalars['String']['input'];
  videoId: Scalars['String']['input'];
};

export type VideoTranslationUpdateInput = {
  id: Scalars['ID']['input'];
  languageId?: InputMaybe<Scalars['String']['input']>;
  primary?: InputMaybe<Scalars['Boolean']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

export type VideoUpdateInput = {
  childIds?: InputMaybe<Array<Scalars['String']['input']>>;
  id: Scalars['String']['input'];
  label?: InputMaybe<VideoLabel>;
  noIndex?: InputMaybe<Scalars['Boolean']['input']>;
  primaryLanguageId?: InputMaybe<Scalars['String']['input']>;
  published?: InputMaybe<Scalars['Boolean']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type VideoVariantCreateInput = {
  dash?: InputMaybe<Scalars['String']['input']>;
  duration?: InputMaybe<Scalars['Int']['input']>;
  edition: Scalars['String']['input'];
  hls?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  languageId: Scalars['String']['input'];
  share?: InputMaybe<Scalars['String']['input']>;
  slug: Scalars['String']['input'];
  videoId: Scalars['String']['input'];
};

export type VideoVariantDownloadCreateInput = {
  height?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  quality: VideoVariantDownloadQuality;
  size?: InputMaybe<Scalars['Float']['input']>;
  url: Scalars['String']['input'];
  videoVariantId: Scalars['String']['input'];
  width?: InputMaybe<Scalars['Int']['input']>;
};

export enum VideoVariantDownloadQuality {
  High = 'high',
  Low = 'low'
}

export type VideoVariantDownloadUpdateInput = {
  height?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['String']['input'];
  quality?: InputMaybe<VideoVariantDownloadQuality>;
  size?: InputMaybe<Scalars['Float']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
  videoVariantId?: InputMaybe<Scalars['String']['input']>;
  width?: InputMaybe<Scalars['Int']['input']>;
};

export type VideoVariantUpdateInput = {
  dash?: InputMaybe<Scalars['String']['input']>;
  duration?: InputMaybe<Scalars['Int']['input']>;
  edition?: InputMaybe<Scalars['String']['input']>;
  hls?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  languageId?: InputMaybe<Scalars['String']['input']>;
  share?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  videoId?: InputMaybe<Scalars['String']['input']>;
};

export type VideosFilter = {
  availableVariantLanguageIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  labels?: InputMaybe<Array<VideoLabel>>;
  subtitleLanguageIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
};

/**
 * The status of a visitor according to team members interacting with the
 * visitor admin interface. This enum should map to an emoji when displayed
 * (names here match Apple's emoji name)
 */
export enum VisitorStatus {
  CheckMarkSymbol = 'checkMarkSymbol',
  PartyPopper = 'partyPopper',
  Prohibited = 'prohibited',
  RedExclamationMark = 'redExclamationMark',
  RedQuestionMark = 'redQuestionMark',
  RobotFace = 'robotFace',
  Star = 'star',
  ThumbsDown = 'thumbsDown',
  ThumbsUp = 'thumbsUp',
  Warning = 'warning'
}

/** A list of fields to update a visitor when calling the visitorUpdate mutation */
export type VisitorUpdateInput = {
  /** The country code of the visitor as poulated by visitor ip address detected */
  countryCode?: InputMaybe<Scalars['String']['input']>;
  /**
   * The email address of the visitor (will prevent
   * SignUpEventSubmissionEventCreate mutation from updating this field
   * automatically)
   */
  email?: InputMaybe<Scalars['String']['input']>;
  /**
   * Message platform the visitor wishes to be connected to us on (will prevent
   * ChatOpenEventCreate mutation from updating this field automatically)
   */
  messagePlatform?: InputMaybe<MessagePlatform>;
  /**
   * ID of the visitor. This could be a phone number, user id or other unique
   * identifier provided by the message platform.
   */
  messagePlatformId?: InputMaybe<Scalars['String']['input']>;
  /**
   * The name of the visitor (will prevent SignUpEventSubmissionEventCreate
   * mutation from updating this field automatically)
   */
  name?: InputMaybe<Scalars['String']['input']>;
  /**
   * Private notes relating to the visitor. This information is never made public
   * and only accessible by team members.
   */
  notes?: InputMaybe<Scalars['String']['input']>;
  /** The referring url of the visitor */
  referrer?: InputMaybe<Scalars['String']['input']>;
  /** Status of the visitor. */
  status?: InputMaybe<VisitorStatus>;
};

export enum Join__Graph {
  Analytics = 'ANALYTICS',
  Journeys = 'JOURNEYS',
  JourneysModern = 'JOURNEYS_MODERN',
  Languages = 'LANGUAGES',
  Media = 'MEDIA',
  Users = 'USERS'
}

export enum Link__Purpose {
  /** `EXECUTION` features provide metadata necessary for operation execution. */
  Execution = 'EXECUTION',
  /** `SECURITY` features provide metadata necessary to securely resolve fields. */
  Security = 'SECURITY'
}

export type GetUserQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type GetUserQuery = { __typename?: 'Query', user?: { __typename?: 'User', id: string, email: string, firstName: string, imageUrl?: string | null } | null };

export type GetUserByEmailQueryVariables = Exact<{
  email: Scalars['String']['input'];
}>;


export type GetUserByEmailQuery = { __typename?: 'Query', userByEmail?: { __typename?: 'User', id: string, email: string, firstName: string, imageUrl?: string | null } | null };

export type UserQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type UserQuery = { __typename?: 'Query', user?: { __typename?: 'User', id: string, firstName: string, email: string, imageUrl?: string | null } | null };

export type GetLanguagesQueryVariables = Exact<{
  languageId: Scalars['ID']['input'];
}>;


export type GetLanguagesQuery = { __typename?: 'Query', language?: { __typename?: 'Language', bcp47?: string | null, id: string } | null };

export type SiteCreateMutationVariables = Exact<{
  input: SiteCreateInput;
}>;


export type SiteCreateMutation = { __typename?: 'Mutation', siteCreate: { __typename: 'Error', message: string } | { __typename?: 'MutationSiteCreateSuccess', data: { __typename: 'Site', id: string, domain: string, memberships: Array<{ __typename: 'SiteMembership', id: string, role: string }>, goals: Array<{ __typename: 'SiteGoal', id: string, eventName?: string | null }>, sharedLinks: Array<{ __typename: 'SiteSharedLink', id: string, slug: string }> } } };


export const GetUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}}]}}]} as unknown as DocumentNode<GetUserQuery, GetUserQueryVariables>;
export const GetUserByEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUserByEmail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userByEmail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}}]}}]} as unknown as DocumentNode<GetUserByEmailQuery, GetUserByEmailQueryVariables>;
export const UserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"User"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}}]}}]} as unknown as DocumentNode<UserQuery, UserQueryVariables>;
export const GetLanguagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetLanguages"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"languageId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"language"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"languageId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bcp47"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<GetLanguagesQuery, GetLanguagesQueryVariables>;
export const SiteCreateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SiteCreate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SiteCreateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"siteCreate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Error"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MutationSiteCreateSuccess"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"domain"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"memberships"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"goals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"eventName"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sharedLinks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<SiteCreateMutation, SiteCreateMutationVariables>;
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
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: { input: any; output: any; }
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.This scalar is serialized to a string in ISO 8601 format and parsed from a string in ISO 8601 format. */
  DateTimeISO: { input: any; output: any; }
  /** The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  Json: { input: any; output: any; }
  join__FieldSet: { input: any; output: any; }
  link__Import: { input: any; output: any; }
};

export type Action = {
  gtmEventName?: Maybe<Scalars['String']['output']>;
  parentBlock?: Maybe<Block>;
  parentBlockId?: Maybe<Scalars['ID']['output']>;
};

export type ArclightApiKey = {
  __typename?: 'ArclightApiKey';
  defaultPlatform: DefaultPlatform;
  desc?: Maybe<Scalars['String']['output']>;
  key: Scalars['String']['output'];
};

export type AudioPreview = {
  __typename?: 'AudioPreview';
  bitrate: Scalars['Int']['output'];
  codec: Scalars['String']['output'];
  duration: Scalars['Int']['output'];
  language: Language;
  languageId: Scalars['ID']['output'];
  size: Scalars['Int']['output'];
  value: Scalars['String']['output'];
};

export type BaseError = {
  message?: Maybe<Scalars['String']['output']>;
};

export type BibleBook = {
  __typename?: 'BibleBook';
  alternateName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isNewTestament: Scalars['Boolean']['output'];
  name: Array<BibleBookName>;
  order: Scalars['Int']['output'];
  osisId: Scalars['String']['output'];
  paratextAbbreviation: Scalars['String']['output'];
};


export type BibleBookNameArgs = {
  languageId?: InputMaybe<Scalars['ID']['input']>;
  primary?: InputMaybe<Scalars['Boolean']['input']>;
};

export type BibleBookName = {
  __typename?: 'BibleBookName';
  language: Language;
  primary: Scalars['Boolean']['output'];
  value: Scalars['String']['output'];
};

export type BibleCitation = {
  __typename?: 'BibleCitation';
  bibleBook: BibleBook;
  chapterEnd?: Maybe<Scalars['Int']['output']>;
  chapterStart: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  order: Scalars['Int']['output'];
  osisId: Scalars['String']['output'];
  verseEnd?: Maybe<Scalars['Int']['output']>;
  verseStart?: Maybe<Scalars['Int']['output']>;
  video: Video;
};

export type Block = {
  id: Scalars['ID']['output'];
  journeyId: Scalars['ID']['output'];
  parentBlockId?: Maybe<Scalars['ID']['output']>;
  parentOrder?: Maybe<Scalars['Int']['output']>;
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

export type Browser = {
  __typename?: 'Browser';
  name?: Maybe<Scalars['String']['output']>;
  version?: Maybe<Scalars['String']['output']>;
};

export enum ButtonAction {
  EmailAction = 'EmailAction',
  LinkAction = 'LinkAction',
  NavigateToBlockAction = 'NavigateToBlockAction'
}

export enum ButtonAlignment {
  Center = 'center',
  Justify = 'justify',
  Left = 'left',
  Right = 'right'
}

export type ButtonBlock = Block & {
  __typename?: 'ButtonBlock';
  action?: Maybe<Action>;
  color?: Maybe<ButtonColor>;
  endIconId?: Maybe<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
  journeyId: Scalars['ID']['output'];
  label: Scalars['String']['output'];
  parentBlockId?: Maybe<Scalars['ID']['output']>;
  parentOrder?: Maybe<Scalars['Int']['output']>;
  settings?: Maybe<ButtonBlockSettings>;
  size?: Maybe<ButtonSize>;
  startIconId?: Maybe<Scalars['ID']['output']>;
  submitEnabled?: Maybe<Scalars['Boolean']['output']>;
  variant?: Maybe<ButtonVariant>;
};

export type ButtonBlockCreateInput = {
  color?: InputMaybe<ButtonColor>;
  id?: InputMaybe<Scalars['ID']['input']>;
  journeyId: Scalars['ID']['input'];
  label: Scalars['String']['input'];
  parentBlockId: Scalars['ID']['input'];
  settings?: InputMaybe<ButtonBlockSettingsInput>;
  size?: InputMaybe<ButtonSize>;
  submitEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  variant?: InputMaybe<ButtonVariant>;
};

export type ButtonBlockSettings = {
  __typename?: 'ButtonBlockSettings';
  alignment?: Maybe<ButtonAlignment>;
  color?: Maybe<Scalars['String']['output']>;
};

export type ButtonBlockSettingsInput = {
  alignment?: InputMaybe<ButtonAlignment>;
  color?: InputMaybe<Scalars['String']['input']>;
};

export type ButtonBlockUpdateInput = {
  color?: InputMaybe<ButtonColor>;
  endIconId?: InputMaybe<Scalars['ID']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  parentBlockId?: InputMaybe<Scalars['ID']['input']>;
  settings?: InputMaybe<ButtonBlockSettingsInput>;
  size?: InputMaybe<ButtonSize>;
  startIconId?: InputMaybe<Scalars['ID']['input']>;
  submitEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  variant?: InputMaybe<ButtonVariant>;
};

export type ButtonClickEvent = Event & {
  __typename?: 'ButtonClickEvent';
  action?: Maybe<ButtonAction>;
  actionValue?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  journeyId?: Maybe<Scalars['String']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

export type ButtonClickEventCreateInput = {
  action?: InputMaybe<ButtonAction>;
  actionValue?: InputMaybe<Scalars['String']['input']>;
  blockId: Scalars['String']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  stepId?: InputMaybe<Scalars['String']['input']>;
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
  Outlined = 'outlined',
  Text = 'text'
}

export type CardBlock = Block & {
  __typename?: 'CardBlock';
  /** backdropBlur should be a number representing blur amount in pixels e.g 20. */
  backdropBlur?: Maybe<Scalars['Int']['output']>;
  /** backgroundColor should be a HEX color value e.g #FFFFFF for white. */
  backgroundColor?: Maybe<Scalars['String']['output']>;
  /**
   * coverBlockId is present if a child block should be used as a cover.
   * This child block should not be rendered normally, instead it should be used
   * as a background. Blocks are often of type ImageBlock or VideoBlock.
   */
  coverBlockId?: Maybe<Scalars['ID']['output']>;
  /**
   * fullscreen should control how the coverBlock is displayed. When fullscreen
   * is set to true the coverBlock Image should be displayed as a blur in the
   * background.
   */
  fullscreen: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  journeyId: Scalars['ID']['output'];
  parentBlockId?: Maybe<Scalars['ID']['output']>;
  parentOrder?: Maybe<Scalars['Int']['output']>;
  /**
   * themeMode can override journey themeMode. If nothing is set then use
   * themeMode from journey
   */
  themeMode?: Maybe<ThemeMode>;
  /**
   * themeName can override journey themeName. If nothing is set then use
   * themeName from journey
   */
  themeName?: Maybe<ThemeName>;
};

export type CardBlockCreateInput = {
  /** backdropBlur should be a number representing blur amount in pixels e.g 20. */
  backdropBlur?: InputMaybe<Scalars['Int']['input']>;
  /** backgroundColor should be a HEX color value e.g #FFFFFF for white. */
  backgroundColor?: InputMaybe<Scalars['String']['input']>;
  fullscreen?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  journeyId: Scalars['ID']['input'];
  parentBlockId: Scalars['ID']['input'];
  themeMode?: InputMaybe<ThemeMode>;
  themeName?: InputMaybe<ThemeName>;
};

export type CardBlockUpdateInput = {
  backdropBlur?: InputMaybe<Scalars['Int']['input']>;
  backgroundColor?: InputMaybe<Scalars['String']['input']>;
  coverBlockId?: InputMaybe<Scalars['ID']['input']>;
  fullscreen?: InputMaybe<Scalars['Boolean']['input']>;
  parentBlockId?: InputMaybe<Scalars['ID']['input']>;
  themeMode?: InputMaybe<ThemeMode>;
  themeName?: InputMaybe<ThemeName>;
};

export type ChatButton = {
  __typename?: 'ChatButton';
  id?: Maybe<Scalars['ID']['output']>;
  link?: Maybe<Scalars['String']['output']>;
  platform?: Maybe<MessagePlatform>;
};

export type ChatButtonCreateInput = {
  link: Scalars['String']['input'];
  platform: MessagePlatform;
};

export type ChatButtonUpdateInput = {
  link: Scalars['String']['input'];
  platform: MessagePlatform;
};

export type ChatOpenEvent = Event & {
  __typename?: 'ChatOpenEvent';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  journeyId?: Maybe<Scalars['String']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  messagePlatform?: Maybe<MessagePlatform>;
  value?: Maybe<Scalars['String']['output']>;
};

export type ChatOpenEventCreateInput = {
  blockId: Scalars['String']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  messagePlatform?: InputMaybe<MessagePlatform>;
  stepId?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

export type CloudflareImage = {
  __typename?: 'CloudflareImage';
  aspectRatio?: Maybe<ImageAspectRatio>;
  createdAt: Scalars['Date']['output'];
  id: Scalars['ID']['output'];
  mobileCinematicHigh?: Maybe<Scalars['String']['output']>;
  mobileCinematicLow?: Maybe<Scalars['String']['output']>;
  mobileCinematicVeryLow?: Maybe<Scalars['String']['output']>;
  thumbnail?: Maybe<Scalars['String']['output']>;
  uploadUrl?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
  userId: Scalars['ID']['output'];
  videoStill?: Maybe<Scalars['String']['output']>;
};

export type CloudflareR2 = {
  __typename?: 'CloudflareR2';
  contentLength: Scalars['Int']['output'];
  contentType: Scalars['String']['output'];
  createdAt: Scalars['Date']['output'];
  fileName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  originalFilename?: Maybe<Scalars['String']['output']>;
  publicUrl?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['Date']['output'];
  uploadUrl?: Maybe<Scalars['String']['output']>;
  userId: Scalars['ID']['output'];
};

export type CloudflareR2CreateInput = {
  /** the size of the file that is being uploaded */
  contentLength: Scalars['Int']['input'];
  /** the type of file that is being uploaded. e.g. image or video/mp4 */
  contentType: Scalars['String']['input'];
  /** the name of the file that is being uploaded */
  fileName: Scalars['String']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
  /** the original name of the file before any renaming */
  originalFilename?: InputMaybe<Scalars['String']['input']>;
  /** the id of the Video object this file relates to in the database */
  videoId: Scalars['String']['input'];
};

export type Continent = {
  __typename?: 'Continent';
  countries: Array<Country>;
  id: Scalars['ID']['output'];
  name: Array<ContinentName>;
};


export type ContinentNameArgs = {
  languageId?: InputMaybe<Scalars['ID']['input']>;
  primary?: InputMaybe<Scalars['Boolean']['input']>;
};

export type ContinentName = {
  __typename?: 'ContinentName';
  language: Language;
  primary: Scalars['Boolean']['output'];
  value: Scalars['String']['output'];
};

export type Country = {
  __typename?: 'Country';
  continent: Continent;
  countryLanguages: Array<CountryLanguage>;
  flagPngSrc?: Maybe<Scalars['String']['output']>;
  flagWebpSrc?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  languageCount: Scalars['Int']['output'];
  languageHavingMediaCount: Scalars['Int']['output'];
  languages: Array<Language>;
  latitude?: Maybe<Scalars['Float']['output']>;
  longitude?: Maybe<Scalars['Float']['output']>;
  name: Array<CountryName>;
  population?: Maybe<Scalars['Int']['output']>;
};


export type CountryNameArgs = {
  languageId?: InputMaybe<Scalars['ID']['input']>;
  primary?: InputMaybe<Scalars['Boolean']['input']>;
};

export type CountryLanguage = {
  __typename?: 'CountryLanguage';
  country: Country;
  displaySpeakers?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  language: Language;
  order?: Maybe<Scalars['Int']['output']>;
  primary: Scalars['Boolean']['output'];
  speakers: Scalars['Int']['output'];
  suggested: Scalars['Boolean']['output'];
};

export type CountryName = {
  __typename?: 'CountryName';
  language: Language;
  primary: Scalars['Boolean']['output'];
  value: Scalars['String']['output'];
};

export type CreateVerificationRequestInput = {
  redirect?: InputMaybe<Scalars['String']['input']>;
};

export type CustomDomain = {
  __typename?: 'CustomDomain';
  apexName?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  journeyCollection?: Maybe<JourneyCollection>;
  name?: Maybe<Scalars['String']['output']>;
  routeAllTeamJourneys?: Maybe<Scalars['Boolean']['output']>;
  team?: Maybe<Team>;
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

export enum DefaultPlatform {
  Android = 'android',
  Ios = 'ios',
  Web = 'web'
}

export type Device = {
  __typename?: 'Device';
  model?: Maybe<Scalars['String']['output']>;
  type?: Maybe<DeviceType>;
  vendor?: Maybe<Scalars['String']['output']>;
};

export enum DeviceType {
  Console = 'console',
  Embedded = 'embedded',
  Mobile = 'mobile',
  Smarttv = 'smarttv',
  Tablet = 'tablet',
  Wearable = 'wearable'
}

export type EmailAction = Action & {
  __typename?: 'EmailAction';
  email: Scalars['String']['output'];
  gtmEventName?: Maybe<Scalars['String']['output']>;
  parentBlock?: Maybe<Block>;
  parentBlockId?: Maybe<Scalars['ID']['output']>;
};

export type EmailActionInput = {
  email: Scalars['String']['input'];
  gtmEventName?: InputMaybe<Scalars['String']['input']>;
};

export type Error = BaseError & {
  __typename?: 'Error';
  message?: Maybe<Scalars['String']['output']>;
};

export type Event = {
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  journeyId?: Maybe<Scalars['String']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

export enum EventType {
  ButtonClickEvent = 'ButtonClickEvent',
  ChatOpenEvent = 'ChatOpenEvent',
  JourneyViewEvent = 'JourneyViewEvent',
  RadioQuestionSubmissionEvent = 'RadioQuestionSubmissionEvent',
  SignUpSubmissionEvent = 'SignUpSubmissionEvent',
  StepNextEvent = 'StepNextEvent',
  StepPreviousEvent = 'StepPreviousEvent',
  StepViewEvent = 'StepViewEvent',
  TextResponseSubmissionEvent = 'TextResponseSubmissionEvent',
  VideoCollapseEvent = 'VideoCollapseEvent',
  VideoCompleteEvent = 'VideoCompleteEvent',
  VideoExpandEvent = 'VideoExpandEvent',
  VideoPauseEvent = 'VideoPauseEvent',
  VideoPlayEvent = 'VideoPlayEvent',
  VideoProgressEvent = 'VideoProgressEvent',
  VideoStartEvent = 'VideoStartEvent'
}

export type ForeignKeyConstraintError = BaseError & {
  __typename?: 'ForeignKeyConstraintError';
  /** The arguments that caused the foriegn key constraint violation */
  location?: Maybe<Array<ForeignKeyConstraintErrorLocation>>;
  message?: Maybe<Scalars['String']['output']>;
};

export type ForeignKeyConstraintErrorLocation = {
  __typename?: 'ForeignKeyConstraintErrorLocation';
  /** An array describing the path in the arguments that caused this error */
  path?: Maybe<Array<Scalars['String']['output']>>;
  /** The value that was provided at the path */
  value?: Maybe<Scalars['String']['output']>;
};

export enum GridAlignItems {
  Baseline = 'baseline',
  Center = 'center',
  FlexEnd = 'flexEnd',
  FlexStart = 'flexStart'
}

export type GridContainerBlock = Block & {
  __typename?: 'GridContainerBlock';
  alignItems: GridAlignItems;
  direction: GridDirection;
  gap: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  journeyId: Scalars['ID']['output'];
  justifyContent: GridJustifyContent;
  parentBlockId?: Maybe<Scalars['ID']['output']>;
  parentOrder?: Maybe<Scalars['Int']['output']>;
};

export type GridContainerBlockCreateInput = {
  alignItems?: InputMaybe<GridAlignItems>;
  direction?: InputMaybe<GridDirection>;
  gap?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  journeyId: Scalars['ID']['input'];
  justifyContent?: InputMaybe<GridJustifyContent>;
  parentBlockId: Scalars['ID']['input'];
};

export type GridContainerBlockUpdateInput = {
  alignItems?: InputMaybe<GridAlignItems>;
  direction?: InputMaybe<GridDirection>;
  gap?: InputMaybe<Scalars['Int']['input']>;
  justifyContent?: InputMaybe<GridJustifyContent>;
  parentBlockId?: InputMaybe<Scalars['ID']['input']>;
};

export enum GridDirection {
  Column = 'column',
  ColumnReverse = 'columnReverse',
  Row = 'row',
  RowReverse = 'rowReverse'
}

export type GridItemBlock = Block & {
  __typename?: 'GridItemBlock';
  id: Scalars['ID']['output'];
  journeyId: Scalars['ID']['output'];
  lg: Scalars['Int']['output'];
  parentBlockId?: Maybe<Scalars['ID']['output']>;
  parentOrder?: Maybe<Scalars['Int']['output']>;
  sm: Scalars['Int']['output'];
  xl: Scalars['Int']['output'];
};

export type GridItemBlockCreateInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  journeyId: Scalars['ID']['input'];
  lg?: InputMaybe<Scalars['Int']['input']>;
  parentBlockId: Scalars['ID']['input'];
  sm?: InputMaybe<Scalars['Int']['input']>;
  xl?: InputMaybe<Scalars['Int']['input']>;
};

export type GridItemBlockUpdateInput = {
  lg?: InputMaybe<Scalars['Int']['input']>;
  parentBlockId?: InputMaybe<Scalars['ID']['input']>;
  sm?: InputMaybe<Scalars['Int']['input']>;
  xl?: InputMaybe<Scalars['Int']['input']>;
};

export enum GridJustifyContent {
  Center = 'center',
  FlexEnd = 'flexEnd',
  FlexStart = 'flexStart'
}

export type Host = {
  __typename?: 'Host';
  id?: Maybe<Scalars['ID']['output']>;
  journeys?: Maybe<Array<Journey>>;
  location?: Maybe<Scalars['String']['output']>;
  src1?: Maybe<Scalars['String']['output']>;
  src2?: Maybe<Scalars['String']['output']>;
  team?: Maybe<Team>;
  teamId?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

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

export type IconBlock = Block & {
  __typename?: 'IconBlock';
  color?: Maybe<IconColor>;
  id: Scalars['ID']['output'];
  journeyId: Scalars['ID']['output'];
  name?: Maybe<IconName>;
  parentBlockId?: Maybe<Scalars['ID']['output']>;
  parentOrder?: Maybe<Scalars['Int']['output']>;
  size?: Maybe<IconSize>;
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

export type ImageBlock = Block & {
  __typename?: 'ImageBlock';
  alt: Scalars['String']['output'];
  /**
   * blurhash is a compact representation of a placeholder for an image.
   * Find a frontend implementation at https://github.com/woltapp/blurhash
   */
  blurhash: Scalars['String']['output'];
  focalLeft?: Maybe<Scalars['Int']['output']>;
  focalTop?: Maybe<Scalars['Int']['output']>;
  height: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  journeyId: Scalars['ID']['output'];
  parentBlockId?: Maybe<Scalars['ID']['output']>;
  parentOrder?: Maybe<Scalars['Int']['output']>;
  scale?: Maybe<Scalars['Int']['output']>;
  src?: Maybe<Scalars['String']['output']>;
  width: Scalars['Int']['output'];
};

export type ImageBlockCreateInput = {
  alt: Scalars['String']['input'];
  /** If blurhash, width, & height are provided, the image will skip blurhash processing. Otherwise these values will be calculated. */
  blurhash?: InputMaybe<Scalars['String']['input']>;
  focalLeft?: InputMaybe<Scalars['Int']['input']>;
  focalTop?: InputMaybe<Scalars['Int']['input']>;
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
  focalLeft?: InputMaybe<Scalars['Int']['input']>;
  focalTop?: InputMaybe<Scalars['Int']['input']>;
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

export type Integration = {
  __typename?: 'Integration';
  accessId?: Maybe<Scalars['String']['output']>;
  accessSecretPart?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  team?: Maybe<Team>;
  type?: Maybe<IntegrationType>;
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

export type Journey = {
  __typename?: 'Journey';
  archivedAt?: Maybe<Scalars['DateTime']['output']>;
  blocks?: Maybe<Array<Block>>;
  chatButtons?: Maybe<Array<ChatButton>>;
  createdAt: Scalars['DateTime']['output'];
  creatorDescription?: Maybe<Scalars['String']['output']>;
  creatorImageBlock?: Maybe<Block>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  /** public title for viewers */
  displayTitle?: Maybe<Scalars['String']['output']>;
  featuredAt?: Maybe<Scalars['DateTime']['output']>;
  fromTemplateId?: Maybe<Scalars['String']['output']>;
  host?: Maybe<Host>;
  id: Scalars['ID']['output'];
  journeyCollections: Array<JourneyCollection>;
  journeyTheme?: Maybe<JourneyTheme>;
  language: Language;
  languageId: Scalars['String']['output'];
  logoImageBlock?: Maybe<Block>;
  menuButtonIcon?: Maybe<JourneyMenuButtonIcon>;
  menuStepBlock?: Maybe<Block>;
  /** used in a plausible share link to embed report */
  plausibleToken?: Maybe<Scalars['String']['output']>;
  primaryImageBlock?: Maybe<Block>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  seoDescription?: Maybe<Scalars['String']['output']>;
  /** title for seo and sharing */
  seoTitle?: Maybe<Scalars['String']['output']>;
  showChatButtons?: Maybe<Scalars['Boolean']['output']>;
  showDislikeButton?: Maybe<Scalars['Boolean']['output']>;
  showDisplayTitle?: Maybe<Scalars['Boolean']['output']>;
  showHosts?: Maybe<Scalars['Boolean']['output']>;
  showLikeButton?: Maybe<Scalars['Boolean']['output']>;
  showLogo?: Maybe<Scalars['Boolean']['output']>;
  showMenu?: Maybe<Scalars['Boolean']['output']>;
  showReactionButtons?: Maybe<Scalars['Boolean']['output']>;
  showShareButton?: Maybe<Scalars['Boolean']['output']>;
  slug: Scalars['String']['output'];
  socialNodeX?: Maybe<Scalars['Int']['output']>;
  socialNodeY?: Maybe<Scalars['Int']['output']>;
  status: JourneyStatus;
  strategySlug?: Maybe<Scalars['String']['output']>;
  tags: Array<Tag>;
  team?: Maybe<Team>;
  template?: Maybe<Scalars['Boolean']['output']>;
  themeMode: ThemeMode;
  themeName: ThemeName;
  /** private title for creators */
  title: Scalars['String']['output'];
  trashedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  userJourneys?: Maybe<Array<UserJourney>>;
  website?: Maybe<Scalars['Boolean']['output']>;
};

export type JourneyAiTranslateInput = {
  journeyId: Scalars['ID']['input'];
  journeyLanguageName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  textLanguageId: Scalars['ID']['input'];
  textLanguageName: Scalars['String']['input'];
};

export type JourneyAiTranslateProgress = {
  __typename?: 'JourneyAiTranslateProgress';
  /** The journey being translated (only present when complete) */
  journey?: Maybe<Journey>;
  /** Current translation step message */
  message?: Maybe<Scalars['String']['output']>;
  /** Translation progress as a percentage (0-100) */
  progress?: Maybe<Scalars['Float']['output']>;
};

/** A collection of journeys associated with a team */
export type JourneyCollection = {
  __typename?: 'JourneyCollection';
  id?: Maybe<Scalars['ID']['output']>;
  journeys?: Maybe<Array<Journey>>;
  team?: Maybe<Team>;
  title?: Maybe<Scalars['String']['output']>;
};

export type JourneyCollectionCreateInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  journeyIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  teamId: Scalars['ID']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
};

export type JourneyCollectionUpdateInput = {
  journeyIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type JourneyCreateInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  /** ID should be unique Response UUID (Provided for optimistic mutation result matching) */
  id?: InputMaybe<Scalars['ID']['input']>;
  languageId: Scalars['String']['input'];
  /** Slug should be unique amongst all journeys (server will throw BAD_USER_INPUT error if not). If not required will use title formatted with kebab-case. If the generated slug is not unique the uuid will be placed at the end of the slug guaranteeing uniqueness */
  slug?: InputMaybe<Scalars['String']['input']>;
  themeMode?: InputMaybe<ThemeMode>;
  themeName?: InputMaybe<ThemeName>;
  title: Scalars['String']['input'];
};

export type JourneyEventsExportLog = {
  __typename?: 'JourneyEventsExportLog';
  createdAt: Scalars['DateTimeISO']['output'];
  dateRangeEnd?: Maybe<Scalars['DateTimeISO']['output']>;
  dateRangeStart?: Maybe<Scalars['DateTimeISO']['output']>;
  eventsFilter: Array<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  journeyId: Scalars['ID']['output'];
  userId: Scalars['ID']['output'];
};

export type JourneyEventsExportLogInput = {
  dateRangeEnd?: InputMaybe<Scalars['DateTimeISO']['input']>;
  dateRangeStart?: InputMaybe<Scalars['DateTimeISO']['input']>;
  eventsFilter: Array<EventType>;
  journeyId: Scalars['ID']['input'];
};

export type JourneyEventsFilter = {
  periodRangeEnd?: InputMaybe<Scalars['DateTime']['input']>;
  periodRangeStart?: InputMaybe<Scalars['DateTime']['input']>;
  typenames?: InputMaybe<Array<Scalars['String']['input']>>;
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

export type JourneyNotification = {
  __typename?: 'JourneyNotification';
  id?: Maybe<Scalars['ID']['output']>;
  journey?: Maybe<Journey>;
  journeyId?: Maybe<Scalars['ID']['output']>;
  userId?: Maybe<Scalars['ID']['output']>;
  userJourney?: Maybe<UserJourney>;
  userJourneyId?: Maybe<Scalars['ID']['output']>;
  userTeam?: Maybe<UserTeam>;
  userTeamId?: Maybe<Scalars['ID']['output']>;
  visitorInteractionEmail?: Maybe<Scalars['Boolean']['output']>;
};

export type JourneyNotificationUpdateInput = {
  journeyId: Scalars['ID']['input'];
  visitorInteractionEmail: Scalars['Boolean']['input'];
};

export type JourneyProfile = {
  __typename?: 'JourneyProfile';
  acceptedTermsAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  journeyFlowBackButtonClicked?: Maybe<Scalars['Boolean']['output']>;
  lastActiveTeamId?: Maybe<Scalars['String']['output']>;
  plausibleDashboardViewed?: Maybe<Scalars['Boolean']['output']>;
  plausibleJourneyFlowViewed?: Maybe<Scalars['Boolean']['output']>;
  userId?: Maybe<Scalars['ID']['output']>;
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

export type JourneyTheme = {
  __typename?: 'JourneyTheme';
  bodyFont?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  headerFont?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  journey?: Maybe<Journey>;
  journeyId?: Maybe<Scalars['ID']['output']>;
  labelFont?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  userId?: Maybe<Scalars['ID']['output']>;
};

export type JourneyThemeCreateInput = {
  bodyFont?: InputMaybe<Scalars['String']['input']>;
  headerFont?: InputMaybe<Scalars['String']['input']>;
  journeyId: Scalars['ID']['input'];
  labelFont?: InputMaybe<Scalars['String']['input']>;
};

export type JourneyThemeUpdateInput = {
  bodyFont?: InputMaybe<Scalars['String']['input']>;
  headerFont?: InputMaybe<Scalars['String']['input']>;
  labelFont?: InputMaybe<Scalars['String']['input']>;
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
  socialNodeX?: InputMaybe<Scalars['Int']['input']>;
  socialNodeY?: InputMaybe<Scalars['Int']['input']>;
  strategySlug?: InputMaybe<Scalars['String']['input']>;
  tagIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  themeMode?: InputMaybe<ThemeMode>;
  themeName?: InputMaybe<ThemeName>;
  title?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['Boolean']['input']>;
};

export type JourneyViewEvent = Event & {
  __typename?: 'JourneyViewEvent';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  journeyId?: Maybe<Scalars['String']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  language?: Maybe<Scalars['Json']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

export type JourneyViewEventCreateInput = {
  id?: InputMaybe<Scalars['String']['input']>;
  journeyId: Scalars['String']['input'];
  label?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

export type JourneyVisitor = {
  __typename?: 'JourneyVisitor';
  activityCount?: Maybe<Scalars['Int']['output']>;
  countryCode?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  duration?: Maybe<Scalars['Int']['output']>;
  events?: Maybe<Array<Event>>;
  id?: Maybe<Scalars['ID']['output']>;
  journey?: Maybe<Journey>;
  journeyId?: Maybe<Scalars['String']['output']>;
  lastChatPlatform?: Maybe<MessagePlatform>;
  lastChatStartedAt?: Maybe<Scalars['DateTime']['output']>;
  lastLinkAction?: Maybe<Scalars['String']['output']>;
  lastRadioOptionSubmission?: Maybe<Scalars['String']['output']>;
  lastRadioQuestion?: Maybe<Scalars['String']['output']>;
  lastStepViewedAt?: Maybe<Scalars['DateTime']['output']>;
  lastTextResponse?: Maybe<Scalars['String']['output']>;
  messagePlatform?: Maybe<MessagePlatform>;
  notes?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  visitor?: Maybe<Visitor>;
  visitorId?: Maybe<Scalars['String']['output']>;
};

export type JourneyVisitorFilter = {
  countryCode?: InputMaybe<Scalars['String']['input']>;
  hasChatStarted?: InputMaybe<Scalars['Boolean']['input']>;
  hasIcon?: InputMaybe<Scalars['Boolean']['input']>;
  hasPollAnswers?: InputMaybe<Scalars['Boolean']['input']>;
  hasTextResponse?: InputMaybe<Scalars['Boolean']['input']>;
  hideInactive?: InputMaybe<Scalars['Boolean']['input']>;
  journeyId: Scalars['ID']['input'];
};

export enum JourneyVisitorSort {
  Activity = 'activity',
  Date = 'date',
  Duration = 'duration'
}

export type JourneysEmailPreference = {
  __typename?: 'JourneysEmailPreference';
  accountNotifications?: Maybe<Scalars['Boolean']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  unsubscribeAll?: Maybe<Scalars['Boolean']['output']>;
};

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
  /** hostname filters journeys to those that belong to a team with a custom domain matching the hostname. */
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

export type Keyword = {
  __typename?: 'Keyword';
  id: Scalars['ID']['output'];
  language: Language;
  value: Scalars['String']['output'];
};

export type LabeledVideoCounts = {
  __typename?: 'LabeledVideoCounts';
  featureFilmCount: Scalars['Int']['output'];
  seriesCount: Scalars['Int']['output'];
  shortFilmCount: Scalars['Int']['output'];
};

export type Language = {
  __typename?: 'Language';
  audioPreview?: Maybe<AudioPreview>;
  bcp47?: Maybe<Scalars['String']['output']>;
  countryLanguages: Array<CountryLanguage>;
  id: Scalars['ID']['output'];
  iso3?: Maybe<Scalars['String']['output']>;
  labeledVideoCounts: LabeledVideoCounts;
  name: Array<LanguageName>;
  slug?: Maybe<Scalars['String']['output']>;
};


export type LanguageNameArgs = {
  languageId?: InputMaybe<Scalars['ID']['input']>;
  primary?: InputMaybe<Scalars['Boolean']['input']>;
};

export enum LanguageIdType {
  Bcp47 = 'bcp47',
  DatabaseId = 'databaseId'
}

export type LanguageName = {
  __typename?: 'LanguageName';
  language: Language;
  primary: Scalars['Boolean']['output'];
  value: Scalars['String']['output'];
};

export enum LanguageRole {
  Publisher = 'publisher'
}

export type LanguageWithSlug = {
  __typename?: 'LanguageWithSlug';
  language: Language;
  slug: Scalars['String']['output'];
};

export type LanguagesFilter = {
  bcp47?: InputMaybe<Array<Scalars['String']['input']>>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  iso3?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type LinkAction = Action & {
  __typename?: 'LinkAction';
  gtmEventName?: Maybe<Scalars['String']['output']>;
  parentBlock?: Maybe<Block>;
  parentBlockId?: Maybe<Scalars['ID']['output']>;
  target?: Maybe<Scalars['String']['output']>;
  url: Scalars['String']['output'];
};

export type LinkActionInput = {
  gtmEventName?: InputMaybe<Scalars['String']['input']>;
  target?: InputMaybe<Scalars['String']['input']>;
  url: Scalars['String']['input'];
};

export enum MaxResolutionTier {
  Fhd = 'fhd',
  Qhd = 'qhd',
  Uhd = 'uhd'
}

export type MeInput = {
  redirect?: InputMaybe<Scalars['String']['input']>;
};

export enum MediaRole {
  Publisher = 'publisher'
}

export type MediaVideo = MuxVideo | Video | YouTube;

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
  KakaoTalk = 'kakaoTalk',
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

export type Mutation = {
  __typename?: 'Mutation';
  audioPreviewCreate: AudioPreview;
  audioPreviewDelete: AudioPreview;
  audioPreviewUpdate: AudioPreview;
  bibleCitationCreate?: Maybe<BibleCitation>;
  bibleCitationDelete?: Maybe<Scalars['Boolean']['output']>;
  bibleCitationUpdate?: Maybe<BibleCitation>;
  /** blockDelete returns the updated sibling blocks on successful delete */
  blockDelete: Array<Block>;
  blockDeleteAction?: Maybe<Block>;
  /** blockDuplicate returns the updated block, its children and sibling blocks on successful duplicate */
  blockDuplicate: Array<Block>;
  blockOrderUpdate: Array<Block>;
  /** blockRestore is used for redo/undo */
  blockRestore: Array<Block>;
  blockUpdateAction?: Maybe<Action>;
  blockUpdateEmailAction?: Maybe<EmailAction>;
  blockUpdateLinkAction?: Maybe<LinkAction>;
  blockUpdateNavigateToBlockAction?: Maybe<NavigateToBlockAction>;
  buttonBlockCreate: ButtonBlock;
  buttonBlockUpdate: ButtonBlock;
  buttonClickEventCreate?: Maybe<ButtonClickEvent>;
  cardBlockCreate: CardBlock;
  cardBlockUpdate: CardBlock;
  chatButtonCreate?: Maybe<ChatButton>;
  chatButtonRemove?: Maybe<ChatButton>;
  chatButtonUpdate?: Maybe<ChatButton>;
  chatOpenEventCreate?: Maybe<ChatOpenEvent>;
  /** The endpoint to upload a file to Cloudflare R2 */
  cloudflareR2Create: CloudflareR2;
  cloudflareR2Delete: CloudflareR2;
  cloudflareUploadComplete: Scalars['Boolean']['output'];
  createCloudflareImageFromPrompt: CloudflareImage;
  createCloudflareUploadByFile: CloudflareImage;
  createCloudflareUploadByUrl: CloudflareImage;
  /** @deprecated use createCloudflareImageFromPrompt */
  createImageBySegmindPrompt: CloudflareImage;
  createJourneyEventsExportLog: JourneyEventsExportLog;
  createKeyword: Keyword;
  createMuxVideoUploadByFile: MuxVideo;
  createMuxVideoUploadByUrl: MuxVideo;
  createVerificationRequest?: Maybe<Scalars['Boolean']['output']>;
  customDomainCheck?: Maybe<Scalars['Json']['output']>;
  customDomainCreate?: Maybe<CustomDomain>;
  customDomainDelete?: Maybe<CustomDomain>;
  customDomainUpdate?: Maybe<CustomDomain>;
  deleteCloudflareImage: Scalars['Boolean']['output'];
  deleteMuxVideo: Scalars['Boolean']['output'];
  enableMuxDownload?: Maybe<MuxVideo>;
  gridContainerBlockCreate: GridContainerBlock;
  gridContainerBlockUpdate: GridContainerBlock;
  gridItemBlockCreate: GridItemBlock;
  gridItemBlockUpdate: GridItemBlock;
  hostCreate?: Maybe<Host>;
  hostDelete?: Maybe<Host>;
  hostUpdate?: Maybe<Host>;
  iconBlockCreate: IconBlock;
  iconBlockUpdate: IconBlock;
  imageBlockCreate: ImageBlock;
  imageBlockUpdate: ImageBlock;
  integrationDelete?: Maybe<Integration>;
  integrationGrowthSpacesCreate?: Maybe<Integration>;
  integrationGrowthSpacesUpdate?: Maybe<Integration>;
  journeyAiTranslateCreate: Journey;
  journeyCollectionCreate: JourneyCollection;
  journeyCollectionDelete: JourneyCollection;
  journeyCollectionUpdate: JourneyCollection;
  journeyCreate: Journey;
  journeyDuplicate: Journey;
  journeyFeature: Journey;
  journeyLanguageAiDetect: Scalars['Boolean']['output'];
  journeyNotificationUpdate?: Maybe<JourneyNotification>;
  journeyProfileCreate: JourneyProfile;
  journeyProfileUpdate: JourneyProfile;
  journeyPublish: Journey;
  journeySimpleUpdate?: Maybe<Scalars['Json']['output']>;
  journeyTemplate: Journey;
  journeyThemeCreate: JourneyTheme;
  journeyThemeDelete: JourneyTheme;
  journeyThemeUpdate: JourneyTheme;
  journeyUpdate: Journey;
  journeyViewEventCreate?: Maybe<JourneyViewEvent>;
  journeysArchive: Array<Journey>;
  journeysDelete: Array<Journey>;
  journeysRestore: Array<Journey>;
  journeysTrash: Array<Journey>;
  qrCodeCreate: QrCode;
  qrCodeDelete: QrCode;
  qrCodeUpdate: QrCode;
  radioOptionBlockCreate: RadioOptionBlock;
  radioOptionBlockUpdate: RadioOptionBlock;
  radioQuestionBlockCreate: RadioQuestionBlock;
  radioQuestionBlockUpdate: RadioQuestionBlock;
  radioQuestionSubmissionEventCreate?: Maybe<RadioQuestionSubmissionEvent>;
  /** create a new short link */
  shortLinkCreate: MutationShortLinkCreateResult;
  /** delete an existing short link */
  shortLinkDelete: MutationShortLinkDeleteResult;
  /** Create a new short link domain that can be used for short links (this domain must have a CNAME record pointing to the short link service) */
  shortLinkDomainCreate: MutationShortLinkDomainCreateResult;
  /** delete an existing short link domain (all related short links must be deleted first) */
  shortLinkDomainDelete: MutationShortLinkDomainDeleteResult;
  /** Update services that can use this short link domain */
  shortLinkDomainUpdate: MutationShortLinkDomainUpdateResult;
  /** update an existing short link */
  shortLinkUpdate: MutationShortLinkUpdateResult;
  signUpBlockCreate: SignUpBlock;
  signUpBlockUpdate: SignUpBlock;
  signUpSubmissionEventCreate?: Maybe<SignUpSubmissionEvent>;
  siteCreate: MutationSiteCreateResult;
  spacerBlockCreate: SpacerBlock;
  spacerBlockUpdate: SpacerBlock;
  stepBlockCreate: StepBlock;
  stepBlockPositionUpdate: Array<StepBlock>;
  stepBlockUpdate: StepBlock;
  stepNextEventCreate?: Maybe<StepNextEvent>;
  stepPreviousEventCreate?: Maybe<StepPreviousEvent>;
  stepViewEventCreate?: Maybe<StepViewEvent>;
  teamCreate?: Maybe<Team>;
  teamUpdate?: Maybe<Team>;
  textResponseBlockCreate: TextResponseBlock;
  textResponseBlockUpdate: TextResponseBlock;
  textResponseSubmissionEventCreate?: Maybe<TextResponseSubmissionEvent>;
  /** Transcode an asset. Returns the bullmq job ID. */
  transcodeAsset?: Maybe<Scalars['String']['output']>;
  triggerUnsplashDownload: Scalars['Boolean']['output'];
  typographyBlockCreate: TypographyBlock;
  typographyBlockUpdate: TypographyBlock;
  updateJourneysEmailPreference?: Maybe<JourneysEmailPreference>;
  userImpersonate?: Maybe<Scalars['String']['output']>;
  userInviteAcceptAll?: Maybe<Array<UserInvite>>;
  userInviteCreate?: Maybe<UserInvite>;
  userInviteRemove?: Maybe<UserInvite>;
  userJourneyApprove?: Maybe<UserJourney>;
  userJourneyOpen?: Maybe<UserJourney>;
  userJourneyPromote?: Maybe<UserJourney>;
  userJourneyRemove?: Maybe<UserJourney>;
  userJourneyRemoveAll?: Maybe<Array<UserJourney>>;
  userJourneyRequest?: Maybe<UserJourney>;
  userTeamDelete?: Maybe<UserTeam>;
  userTeamInviteAcceptAll?: Maybe<Array<UserTeamInvite>>;
  userTeamInviteCreate?: Maybe<UserTeamInvite>;
  userTeamInviteRemove?: Maybe<UserTeamInvite>;
  userTeamUpdate?: Maybe<UserTeam>;
  validateEmail?: Maybe<User>;
  videoBlockCreate: VideoBlock;
  videoBlockUpdate: VideoBlock;
  videoCollapseEventCreate?: Maybe<VideoCollapseEvent>;
  videoCompleteEventCreate?: Maybe<VideoCompleteEvent>;
  videoCreate: Video;
  videoDelete: Video;
  videoDescriptionCreate: VideoDescription;
  videoDescriptionDelete: VideoDescription;
  videoDescriptionUpdate: VideoDescription;
  videoEditionCreate: VideoEdition;
  videoEditionDelete: VideoEdition;
  videoEditionUpdate: VideoEdition;
  videoExpandEventCreate?: Maybe<VideoExpandEvent>;
  videoImageAltCreate: VideoImageAlt;
  videoImageAltDelete: VideoImageAlt;
  videoImageAltUpdate: VideoImageAlt;
  videoOriginCreate: VideoOrigin;
  videoOriginDelete: VideoOrigin;
  videoOriginUpdate: VideoOrigin;
  videoPauseEventCreate?: Maybe<VideoPauseEvent>;
  videoPlayEventCreate?: Maybe<VideoPlayEvent>;
  videoProgressEventCreate?: Maybe<VideoProgressEvent>;
  videoSnippetCreate: VideoSnippet;
  videoSnippetDelete: VideoSnippet;
  videoSnippetUpdate: VideoSnippet;
  videoStartEventCreate?: Maybe<VideoStartEvent>;
  videoStudyQuestionCreate: VideoStudyQuestion;
  videoStudyQuestionDelete: VideoStudyQuestion;
  videoStudyQuestionUpdate: VideoStudyQuestion;
  videoSubtitleCreate: VideoSubtitle;
  videoSubtitleDelete: VideoSubtitle;
  videoSubtitleUpdate: VideoSubtitle;
  videoTitleCreate: VideoTitle;
  videoTitleDelete: VideoTitle;
  videoTitleUpdate: VideoTitle;
  videoTriggerBlockCreate: VideoTriggerBlock;
  videoTriggerBlockUpdate: VideoTriggerBlock;
  videoUpdate: Video;
  videoVariantCreate: VideoVariant;
  videoVariantDelete: VideoVariant;
  videoVariantDownloadCreate: VideoVariantDownload;
  videoVariantDownloadDelete: VideoVariantDownload;
  videoVariantDownloadUpdate: VideoVariantDownload;
  videoVariantUpdate: VideoVariant;
  visitorUpdate?: Maybe<Visitor>;
  visitorUpdateForCurrentUser?: Maybe<Visitor>;
};


export type MutationAudioPreviewCreateArgs = {
  input: MutationAudioPreviewCreateInput;
};


export type MutationAudioPreviewDeleteArgs = {
  languageId: Scalars['ID']['input'];
};


export type MutationAudioPreviewUpdateArgs = {
  input: MutationAudioPreviewUpdateInput;
};


export type MutationBibleCitationCreateArgs = {
  input: MutationBibleCitationCreateInput;
};


export type MutationBibleCitationDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationBibleCitationUpdateArgs = {
  input: MutationBibleCitationUpdateInput;
};


export type MutationBlockDeleteArgs = {
  id: Scalars['ID']['input'];
  journeyId?: InputMaybe<Scalars['ID']['input']>;
  parentBlockId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationBlockDeleteActionArgs = {
  id: Scalars['ID']['input'];
  journeyId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationBlockDuplicateArgs = {
  id: Scalars['ID']['input'];
  idMap?: InputMaybe<Array<BlockDuplicateIdMap>>;
  journeyId?: InputMaybe<Scalars['ID']['input']>;
  parentOrder?: InputMaybe<Scalars['Int']['input']>;
  x?: InputMaybe<Scalars['Int']['input']>;
  y?: InputMaybe<Scalars['Int']['input']>;
};


export type MutationBlockOrderUpdateArgs = {
  id: Scalars['ID']['input'];
  journeyId?: InputMaybe<Scalars['ID']['input']>;
  parentOrder: Scalars['Int']['input'];
};


export type MutationBlockRestoreArgs = {
  id: Scalars['ID']['input'];
};


export type MutationBlockUpdateActionArgs = {
  id: Scalars['ID']['input'];
  input: BlockUpdateActionInput;
};


export type MutationBlockUpdateEmailActionArgs = {
  id: Scalars['ID']['input'];
  input: EmailActionInput;
  journeyId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationBlockUpdateLinkActionArgs = {
  id: Scalars['ID']['input'];
  input: LinkActionInput;
  journeyId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationBlockUpdateNavigateToBlockActionArgs = {
  id: Scalars['ID']['input'];
  input: NavigateToBlockActionInput;
  journeyId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationButtonBlockCreateArgs = {
  input: ButtonBlockCreateInput;
};


export type MutationButtonBlockUpdateArgs = {
  id: Scalars['ID']['input'];
  input: ButtonBlockUpdateInput;
  journeyId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationButtonClickEventCreateArgs = {
  input: ButtonClickEventCreateInput;
};


export type MutationCardBlockCreateArgs = {
  input: CardBlockCreateInput;
};


export type MutationCardBlockUpdateArgs = {
  id: Scalars['ID']['input'];
  input: CardBlockUpdateInput;
  journeyId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationChatButtonCreateArgs = {
  input: ChatButtonCreateInput;
  journeyId: Scalars['ID']['input'];
};


export type MutationChatButtonRemoveArgs = {
  id: Scalars['ID']['input'];
};


export type MutationChatButtonUpdateArgs = {
  id: Scalars['ID']['input'];
  input: ChatButtonUpdateInput;
  journeyId: Scalars['ID']['input'];
};


export type MutationChatOpenEventCreateArgs = {
  input: ChatOpenEventCreateInput;
};


export type MutationCloudflareR2CreateArgs = {
  input: CloudflareR2CreateInput;
};


export type MutationCloudflareR2DeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationCloudflareUploadCompleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationCreateCloudflareImageFromPromptArgs = {
  input?: InputMaybe<ImageInput>;
  prompt: Scalars['String']['input'];
};


export type MutationCreateCloudflareUploadByFileArgs = {
  input?: InputMaybe<ImageInput>;
};


export type MutationCreateCloudflareUploadByUrlArgs = {
  input?: InputMaybe<ImageInput>;
  url: Scalars['String']['input'];
};


export type MutationCreateImageBySegmindPromptArgs = {
  model: SegmindModel;
  prompt: Scalars['String']['input'];
};


export type MutationCreateJourneyEventsExportLogArgs = {
  input: JourneyEventsExportLogInput;
};


export type MutationCreateKeywordArgs = {
  languageId: Scalars['String']['input'];
  value: Scalars['String']['input'];
};


export type MutationCreateMuxVideoUploadByFileArgs = {
  downloadable?: InputMaybe<Scalars['Boolean']['input']>;
  maxResolution?: InputMaybe<MaxResolutionTier>;
  name: Scalars['String']['input'];
  userGenerated?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationCreateMuxVideoUploadByUrlArgs = {
  downloadable?: InputMaybe<Scalars['Boolean']['input']>;
  maxResolution?: InputMaybe<MaxResolutionTier>;
  url: Scalars['String']['input'];
  userGenerated?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationCreateVerificationRequestArgs = {
  input?: InputMaybe<CreateVerificationRequestInput>;
};


export type MutationCustomDomainCheckArgs = {
  id: Scalars['ID']['input'];
};


export type MutationCustomDomainCreateArgs = {
  input: CustomDomainCreateInput;
};


export type MutationCustomDomainDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationCustomDomainUpdateArgs = {
  id: Scalars['ID']['input'];
  input: CustomDomainUpdateInput;
};


export type MutationDeleteCloudflareImageArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteMuxVideoArgs = {
  id: Scalars['ID']['input'];
  userGenerated?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationEnableMuxDownloadArgs = {
  id: Scalars['ID']['input'];
  resolution?: InputMaybe<Scalars['String']['input']>;
};


export type MutationGridContainerBlockCreateArgs = {
  input: GridContainerBlockCreateInput;
};


export type MutationGridContainerBlockUpdateArgs = {
  id: Scalars['ID']['input'];
  input: GridContainerBlockUpdateInput;
  journeyId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationGridItemBlockCreateArgs = {
  input: GridItemBlockCreateInput;
};


export type MutationGridItemBlockUpdateArgs = {
  id: Scalars['ID']['input'];
  input: GridItemBlockUpdateInput;
  journeyId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationHostCreateArgs = {
  input: HostCreateInput;
  teamId: Scalars['ID']['input'];
};


export type MutationHostDeleteArgs = {
  id: Scalars['ID']['input'];
  teamId: Scalars['ID']['input'];
};


export type MutationHostUpdateArgs = {
  id: Scalars['ID']['input'];
  input?: InputMaybe<HostUpdateInput>;
  teamId: Scalars['ID']['input'];
};


export type MutationIconBlockCreateArgs = {
  input: IconBlockCreateInput;
};


export type MutationIconBlockUpdateArgs = {
  id: Scalars['ID']['input'];
  input: IconBlockUpdateInput;
  journeyId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationImageBlockCreateArgs = {
  input: ImageBlockCreateInput;
};


export type MutationImageBlockUpdateArgs = {
  id: Scalars['ID']['input'];
  input: ImageBlockUpdateInput;
  journeyId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationIntegrationDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationIntegrationGrowthSpacesCreateArgs = {
  input: IntegrationGrowthSpacesCreateInput;
};


export type MutationIntegrationGrowthSpacesUpdateArgs = {
  id: Scalars['ID']['input'];
  input: IntegrationGrowthSpacesUpdateInput;
};


export type MutationJourneyAiTranslateCreateArgs = {
  input: JourneyAiTranslateInput;
};


export type MutationJourneyCollectionCreateArgs = {
  input: JourneyCollectionCreateInput;
};


export type MutationJourneyCollectionDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationJourneyCollectionUpdateArgs = {
  id: Scalars['ID']['input'];
  input: JourneyCollectionUpdateInput;
};


export type MutationJourneyCreateArgs = {
  input: JourneyCreateInput;
  teamId: Scalars['ID']['input'];
};


export type MutationJourneyDuplicateArgs = {
  id: Scalars['ID']['input'];
  teamId: Scalars['ID']['input'];
};


export type MutationJourneyFeatureArgs = {
  feature: Scalars['Boolean']['input'];
  id: Scalars['ID']['input'];
};


export type MutationJourneyLanguageAiDetectArgs = {
  input: MutationJourneyLanguageAiDetectInput;
};


export type MutationJourneyNotificationUpdateArgs = {
  input: JourneyNotificationUpdateInput;
};


export type MutationJourneyProfileUpdateArgs = {
  input: JourneyProfileUpdateInput;
};


export type MutationJourneyPublishArgs = {
  id: Scalars['ID']['input'];
};


export type MutationJourneySimpleUpdateArgs = {
  id: Scalars['ID']['input'];
  journey: Scalars['Json']['input'];
};


export type MutationJourneyTemplateArgs = {
  id: Scalars['ID']['input'];
  input: JourneyTemplateInput;
};


export type MutationJourneyThemeCreateArgs = {
  input: JourneyThemeCreateInput;
};


export type MutationJourneyThemeDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationJourneyThemeUpdateArgs = {
  id: Scalars['ID']['input'];
  input: JourneyThemeUpdateInput;
};


export type MutationJourneyUpdateArgs = {
  id: Scalars['ID']['input'];
  input: JourneyUpdateInput;
};


export type MutationJourneyViewEventCreateArgs = {
  input: JourneyViewEventCreateInput;
};


export type MutationJourneysArchiveArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type MutationJourneysDeleteArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type MutationJourneysRestoreArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type MutationJourneysTrashArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type MutationQrCodeCreateArgs = {
  input: QrCodeCreateInput;
};


export type MutationQrCodeDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationQrCodeUpdateArgs = {
  id: Scalars['ID']['input'];
  input: QrCodeUpdateInput;
};


export type MutationRadioOptionBlockCreateArgs = {
  input: RadioOptionBlockCreateInput;
};


export type MutationRadioOptionBlockUpdateArgs = {
  id: Scalars['ID']['input'];
  input: RadioOptionBlockUpdateInput;
  journeyId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationRadioQuestionBlockCreateArgs = {
  input: RadioQuestionBlockCreateInput;
};


export type MutationRadioQuestionBlockUpdateArgs = {
  id: Scalars['ID']['input'];
  input: RadioQuestionBlockUpdateInput;
  journeyId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationRadioQuestionSubmissionEventCreateArgs = {
  input: RadioQuestionSubmissionEventCreateInput;
};


export type MutationShortLinkCreateArgs = {
  input: MutationShortLinkCreateInput;
};


export type MutationShortLinkDeleteArgs = {
  id: Scalars['String']['input'];
};


export type MutationShortLinkDomainCreateArgs = {
  input: MutationShortLinkDomainCreateInput;
};


export type MutationShortLinkDomainDeleteArgs = {
  id: Scalars['String']['input'];
};


export type MutationShortLinkDomainUpdateArgs = {
  input: MutationShortLinkDomainUpdateInput;
};


export type MutationShortLinkUpdateArgs = {
  input: MutationShortLinkUpdateInput;
};


export type MutationSignUpBlockCreateArgs = {
  input: SignUpBlockCreateInput;
};


export type MutationSignUpBlockUpdateArgs = {
  id: Scalars['ID']['input'];
  input: SignUpBlockUpdateInput;
  journeyId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationSignUpSubmissionEventCreateArgs = {
  input: SignUpSubmissionEventCreateInput;
};


export type MutationSiteCreateArgs = {
  input: SiteCreateInput;
};


export type MutationSpacerBlockCreateArgs = {
  input: SpacerBlockCreateInput;
};


export type MutationSpacerBlockUpdateArgs = {
  id: Scalars['ID']['input'];
  input: SpacerBlockUpdateInput;
  journeyId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationStepBlockCreateArgs = {
  input: StepBlockCreateInput;
};


export type MutationStepBlockPositionUpdateArgs = {
  input: Array<StepBlockPositionUpdateInput>;
};


export type MutationStepBlockUpdateArgs = {
  id: Scalars['ID']['input'];
  input: StepBlockUpdateInput;
  journeyId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationStepNextEventCreateArgs = {
  input: StepNextEventCreateInput;
};


export type MutationStepPreviousEventCreateArgs = {
  input: StepPreviousEventCreateInput;
};


export type MutationStepViewEventCreateArgs = {
  input: StepViewEventCreateInput;
};


export type MutationTeamCreateArgs = {
  input: TeamCreateInput;
};


export type MutationTeamUpdateArgs = {
  id: Scalars['ID']['input'];
  input: TeamUpdateInput;
};


export type MutationTextResponseBlockCreateArgs = {
  input: TextResponseBlockCreateInput;
};


export type MutationTextResponseBlockUpdateArgs = {
  id: Scalars['ID']['input'];
  input: TextResponseBlockUpdateInput;
  journeyId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationTextResponseSubmissionEventCreateArgs = {
  input: TextResponseSubmissionEventCreateInput;
};


export type MutationTranscodeAssetArgs = {
  input: TranscodeVideoInput;
};


export type MutationTriggerUnsplashDownloadArgs = {
  url: Scalars['String']['input'];
};


export type MutationTypographyBlockCreateArgs = {
  input: TypographyBlockCreateInput;
};


export type MutationTypographyBlockUpdateArgs = {
  id: Scalars['ID']['input'];
  input: TypographyBlockUpdateInput;
  journeyId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationUpdateJourneysEmailPreferenceArgs = {
  input: JourneysEmailPreferenceUpdateInput;
};


export type MutationUserImpersonateArgs = {
  email: Scalars['String']['input'];
};


export type MutationUserInviteCreateArgs = {
  input: UserInviteCreateInput;
  journeyId: Scalars['ID']['input'];
};


export type MutationUserInviteRemoveArgs = {
  id: Scalars['ID']['input'];
  journeyId: Scalars['ID']['input'];
};


export type MutationUserJourneyApproveArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUserJourneyOpenArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUserJourneyPromoteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUserJourneyRemoveArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUserJourneyRemoveAllArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUserJourneyRequestArgs = {
  journeyId: Scalars['ID']['input'];
};


export type MutationUserTeamDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUserTeamInviteCreateArgs = {
  input: UserTeamInviteCreateInput;
  teamId: Scalars['ID']['input'];
};


export type MutationUserTeamInviteRemoveArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUserTeamUpdateArgs = {
  id: Scalars['ID']['input'];
  input: UserTeamUpdateInput;
};


export type MutationValidateEmailArgs = {
  email: Scalars['String']['input'];
  token: Scalars['String']['input'];
};


export type MutationVideoBlockCreateArgs = {
  input: VideoBlockCreateInput;
};


export type MutationVideoBlockUpdateArgs = {
  id: Scalars['ID']['input'];
  input: VideoBlockUpdateInput;
  journeyId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationVideoCollapseEventCreateArgs = {
  input: VideoCollapseEventCreateInput;
};


export type MutationVideoCompleteEventCreateArgs = {
  input: VideoCompleteEventCreateInput;
};


export type MutationVideoCreateArgs = {
  input: VideoCreateInput;
};


export type MutationVideoDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationVideoDescriptionCreateArgs = {
  input: VideoTranslationCreateInput;
};


export type MutationVideoDescriptionDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationVideoDescriptionUpdateArgs = {
  input: VideoTranslationUpdateInput;
};


export type MutationVideoEditionCreateArgs = {
  input: VideoEditionCreateInput;
};


export type MutationVideoEditionDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationVideoEditionUpdateArgs = {
  input: VideoEditionUpdateInput;
};


export type MutationVideoExpandEventCreateArgs = {
  input: VideoExpandEventCreateInput;
};


export type MutationVideoImageAltCreateArgs = {
  input: VideoTranslationCreateInput;
};


export type MutationVideoImageAltDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationVideoImageAltUpdateArgs = {
  input: VideoTranslationUpdateInput;
};


export type MutationVideoOriginCreateArgs = {
  input: MutationVideoOriginCreateInput;
};


export type MutationVideoOriginDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationVideoOriginUpdateArgs = {
  input: MutationVideoOriginUpdateInput;
};


export type MutationVideoPauseEventCreateArgs = {
  input: VideoPauseEventCreateInput;
};


export type MutationVideoPlayEventCreateArgs = {
  input: VideoPlayEventCreateInput;
};


export type MutationVideoProgressEventCreateArgs = {
  input: VideoProgressEventCreateInput;
};


export type MutationVideoSnippetCreateArgs = {
  input: VideoTranslationCreateInput;
};


export type MutationVideoSnippetDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationVideoSnippetUpdateArgs = {
  input: VideoTranslationUpdateInput;
};


export type MutationVideoStartEventCreateArgs = {
  input: VideoStartEventCreateInput;
};


export type MutationVideoStudyQuestionCreateArgs = {
  input: VideoStudyQuestionCreateInput;
};


export type MutationVideoStudyQuestionDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationVideoStudyQuestionUpdateArgs = {
  input: VideoStudyQuestionUpdateInput;
};


export type MutationVideoSubtitleCreateArgs = {
  input: VideoSubtitleCreateInput;
};


export type MutationVideoSubtitleDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationVideoSubtitleUpdateArgs = {
  input: VideoSubtitleUpdateInput;
};


export type MutationVideoTitleCreateArgs = {
  input: VideoTranslationCreateInput;
};


export type MutationVideoTitleDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationVideoTitleUpdateArgs = {
  input: VideoTranslationUpdateInput;
};


export type MutationVideoTriggerBlockCreateArgs = {
  input: VideoTriggerBlockCreateInput;
};


export type MutationVideoTriggerBlockUpdateArgs = {
  id: Scalars['ID']['input'];
  input: VideoTriggerBlockUpdateInput;
  journeyId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationVideoUpdateArgs = {
  input: VideoUpdateInput;
};


export type MutationVideoVariantCreateArgs = {
  input: VideoVariantCreateInput;
};


export type MutationVideoVariantDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationVideoVariantDownloadCreateArgs = {
  input: VideoVariantDownloadCreateInput;
};


export type MutationVideoVariantDownloadDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationVideoVariantDownloadUpdateArgs = {
  input: VideoVariantDownloadUpdateInput;
};


export type MutationVideoVariantUpdateArgs = {
  input: VideoVariantUpdateInput;
};


export type MutationVisitorUpdateArgs = {
  id: Scalars['ID']['input'];
  input: VisitorUpdateInput;
};


export type MutationVisitorUpdateForCurrentUserArgs = {
  input: VisitorUpdateForCurrentUserInput;
};

export type MutationAudioPreviewCreateInput = {
  bitrate: Scalars['Int']['input'];
  codec: Scalars['String']['input'];
  duration: Scalars['Int']['input'];
  languageId: Scalars['ID']['input'];
  size: Scalars['Int']['input'];
  value: Scalars['String']['input'];
};

export type MutationAudioPreviewUpdateInput = {
  bitrate?: InputMaybe<Scalars['Int']['input']>;
  codec?: InputMaybe<Scalars['String']['input']>;
  duration?: InputMaybe<Scalars['Int']['input']>;
  languageId: Scalars['ID']['input'];
  size?: InputMaybe<Scalars['Int']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

export type MutationBibleCitationCreateInput = {
  bibleBookId: Scalars['ID']['input'];
  chapterEnd?: InputMaybe<Scalars['Int']['input']>;
  chapterStart: Scalars['Int']['input'];
  id?: InputMaybe<Scalars['ID']['input']>;
  order: Scalars['Int']['input'];
  osisId: Scalars['String']['input'];
  verseEnd?: InputMaybe<Scalars['Int']['input']>;
  verseStart?: InputMaybe<Scalars['Int']['input']>;
  videoId: Scalars['ID']['input'];
};

export type MutationBibleCitationUpdateInput = {
  bibleBookId?: InputMaybe<Scalars['ID']['input']>;
  chapterEnd?: InputMaybe<Scalars['Int']['input']>;
  chapterStart?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['ID']['input'];
  order?: InputMaybe<Scalars['Int']['input']>;
  osisId?: InputMaybe<Scalars['String']['input']>;
  verseEnd?: InputMaybe<Scalars['Int']['input']>;
  verseStart?: InputMaybe<Scalars['Int']['input']>;
};

export type MutationJourneyLanguageAiDetectInput = {
  journeyId: Scalars['ID']['input'];
  journeyLanguageName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  textLanguageId: Scalars['ID']['input'];
  textLanguageName: Scalars['String']['input'];
};

export type MutationShortLinkCreateInput = {
  /** brightcove video ID for video redirects */
  brightcoveId?: InputMaybe<Scalars['String']['input']>;
  /** the fully qualified domain name (FQDN) to redirect the short link service should redirect the user to */
  hostname: Scalars['String']['input'];
  /** the unique identifier for the short link (will generate if not given) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** short link path not including the leading slash (defaults to a random 11 character string that is URL friendly) */
  pathname?: InputMaybe<Scalars['String']['input']>;
  /** type of video redirect (hls, dl, dh, s) */
  redirectType?: InputMaybe<RedirectType>;
  /** the service that created this short link */
  service: Service;
  /** the fully qualified domain name (FQDN) to redirect the short link service should redirect the user to */
  to: Scalars['String']['input'];
};

export type MutationShortLinkCreateResult = MutationShortLinkCreateSuccess | NotUniqueError | ZodError;

export type MutationShortLinkCreateSuccess = {
  __typename?: 'MutationShortLinkCreateSuccess';
  data: ShortLink;
};

export type MutationShortLinkDeleteResult = MutationShortLinkDeleteSuccess | NotFoundError;

export type MutationShortLinkDeleteSuccess = {
  __typename?: 'MutationShortLinkDeleteSuccess';
  data: ShortLink;
};

export type MutationShortLinkDomainCreateInput = {
  /** the hostname including subdomain, domain, and TLD, but excluding port */
  hostname: Scalars['String']['input'];
  /** the services that are enabled for this domain, if empty then this domain can be used by all services */
  services?: InputMaybe<Array<Service>>;
};

export type MutationShortLinkDomainCreateResult = MutationShortLinkDomainCreateSuccess | NotUniqueError | ZodError;

export type MutationShortLinkDomainCreateSuccess = {
  __typename?: 'MutationShortLinkDomainCreateSuccess';
  data: ShortLinkDomain;
};

export type MutationShortLinkDomainDeleteResult = ForeignKeyConstraintError | MutationShortLinkDomainDeleteSuccess | NotFoundError;

export type MutationShortLinkDomainDeleteSuccess = {
  __typename?: 'MutationShortLinkDomainDeleteSuccess';
  data: ShortLinkDomain;
};

export type MutationShortLinkDomainUpdateInput = {
  id: Scalars['String']['input'];
  /** the services that are enabled for this domain, if empty then this domain can be used by all services */
  services: Array<Service>;
};

export type MutationShortLinkDomainUpdateResult = MutationShortLinkDomainUpdateSuccess | NotFoundError;

export type MutationShortLinkDomainUpdateSuccess = {
  __typename?: 'MutationShortLinkDomainUpdateSuccess';
  data: ShortLinkDomain;
};

export type MutationShortLinkUpdateInput = {
  /** brightcove video ID for video redirects */
  brightcoveId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  /** type of video redirect (hls, dl, dh, s) */
  redirectType?: InputMaybe<RedirectType>;
  /** the fully qualified domain name (FQDN) to redirect the short link service should redirect the user to */
  to: Scalars['String']['input'];
};

export type MutationShortLinkUpdateResult = MutationShortLinkUpdateSuccess | NotFoundError | ZodError;

export type MutationShortLinkUpdateSuccess = {
  __typename?: 'MutationShortLinkUpdateSuccess';
  data: ShortLink;
};

export type MutationSiteCreateResult = Error | MutationSiteCreateSuccess;

export type MutationSiteCreateSuccess = {
  __typename?: 'MutationSiteCreateSuccess';
  data: Site;
};

export type MutationVideoOriginCreateInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type MutationVideoOriginUpdateInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};

export type MuxVideo = {
  __typename?: 'MuxVideo';
  assetId?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Date']['output'];
  downloadable: Scalars['Boolean']['output'];
  duration?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  playbackId?: Maybe<Scalars['String']['output']>;
  primaryLanguageId?: Maybe<Scalars['ID']['output']>;
  readyToStream: Scalars['Boolean']['output'];
  source?: Maybe<VideoBlockSource>;
  uploadId?: Maybe<Scalars['String']['output']>;
  uploadUrl?: Maybe<Scalars['String']['output']>;
  userId: Scalars['ID']['output'];
  videoVariants: Array<VideoVariant>;
};

export type NavigateToBlockAction = Action & {
  __typename?: 'NavigateToBlockAction';
  blockId: Scalars['String']['output'];
  gtmEventName?: Maybe<Scalars['String']['output']>;
  parentBlock?: Maybe<Block>;
  parentBlockId?: Maybe<Scalars['ID']['output']>;
};

export type NavigateToBlockActionInput = {
  blockId: Scalars['String']['input'];
  gtmEventName?: InputMaybe<Scalars['String']['input']>;
};

export type NotFoundError = BaseError & {
  __typename?: 'NotFoundError';
  /** The arguments that caused the not found error */
  location?: Maybe<Array<NotFoundErrorLocation>>;
  message?: Maybe<Scalars['String']['output']>;
};

export type NotFoundErrorLocation = {
  __typename?: 'NotFoundErrorLocation';
  /** An array describing the path in the arguments that caused this error */
  path?: Maybe<Array<Scalars['String']['output']>>;
  /** The value that was provided at the path */
  value?: Maybe<Scalars['String']['output']>;
};

export type NotUniqueError = BaseError & {
  __typename?: 'NotUniqueError';
  /** The arguments that caused the uniqueness violation */
  location?: Maybe<Array<NotUniqueErrorLocation>>;
  message?: Maybe<Scalars['String']['output']>;
};

export type NotUniqueErrorLocation = {
  __typename?: 'NotUniqueErrorLocation';
  /** An array describing the path in the arguments that caused this error */
  path?: Maybe<Array<Scalars['String']['output']>>;
  /** The value that was provided at the path */
  value?: Maybe<Scalars['String']['output']>;
};

export type OperatingSystem = {
  __typename?: 'OperatingSystem';
  name?: Maybe<Scalars['String']['output']>;
  version?: Maybe<Scalars['String']['output']>;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export enum Platform {
  Arclight = 'arclight',
  Journeys = 'journeys',
  Watch = 'watch'
}

export type PlausibleStatsAggregateFilter = {
  date?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<Scalars['String']['input']>;
  interval?: InputMaybe<Scalars['String']['input']>;
  period?: InputMaybe<Scalars['String']['input']>;
};

export type PlausibleStatsAggregateResponse = {
  __typename?: 'PlausibleStatsAggregateResponse';
  bounceRate?: Maybe<PlausibleStatsAggregateValue>;
  conversionRate?: Maybe<PlausibleStatsAggregateValue>;
  events?: Maybe<PlausibleStatsAggregateValue>;
  pageviews?: Maybe<PlausibleStatsAggregateValue>;
  timeOnPage?: Maybe<PlausibleStatsAggregateValue>;
  viewsPerVisit?: Maybe<PlausibleStatsAggregateValue>;
  visitDuration?: Maybe<PlausibleStatsAggregateValue>;
  visitors?: Maybe<PlausibleStatsAggregateValue>;
  visits?: Maybe<PlausibleStatsAggregateValue>;
};

export type PlausibleStatsAggregateValue = {
  __typename?: 'PlausibleStatsAggregateValue';
  change?: Maybe<Scalars['Int']['output']>;
  value?: Maybe<Scalars['Float']['output']>;
};

export type PlausibleStatsBreakdownFilter = {
  date?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  period?: InputMaybe<Scalars['String']['input']>;
  property: Scalars['String']['input'];
};

export type PlausibleStatsResponse = {
  __typename?: 'PlausibleStatsResponse';
  bounceRate?: Maybe<Scalars['Int']['output']>;
  conversionRate?: Maybe<Scalars['Int']['output']>;
  events?: Maybe<Scalars['Int']['output']>;
  pageviews?: Maybe<Scalars['Int']['output']>;
  property?: Maybe<Scalars['String']['output']>;
  timeOnPage?: Maybe<Scalars['Float']['output']>;
  viewsPerVisit?: Maybe<Scalars['Float']['output']>;
  visitDuration?: Maybe<Scalars['Int']['output']>;
  visitors?: Maybe<Scalars['Int']['output']>;
  visits?: Maybe<Scalars['Int']['output']>;
};

export type PlausibleStatsTimeseriesFilter = {
  date?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<Scalars['String']['input']>;
  interval?: InputMaybe<Scalars['String']['input']>;
  period?: InputMaybe<Scalars['String']['input']>;
};

export type QrCode = {
  __typename?: 'QrCode';
  backgroundColor?: Maybe<Scalars['String']['output']>;
  color?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  journey?: Maybe<Journey>;
  journeyId?: Maybe<Scalars['ID']['output']>;
  shortLink?: Maybe<ShortLink>;
  shortLinkId?: Maybe<Scalars['String']['output']>;
  team?: Maybe<Team>;
  teamId?: Maybe<Scalars['ID']['output']>;
  toBlockId?: Maybe<Scalars['String']['output']>;
  toJourneyId?: Maybe<Scalars['String']['output']>;
};

export type QrCodeCreateInput = {
  journeyId: Scalars['ID']['input'];
  teamId: Scalars['ID']['input'];
};

export type QrCodeUpdateInput = {
  backgroundColor?: InputMaybe<Scalars['String']['input']>;
  color?: InputMaybe<Scalars['String']['input']>;
  /** journey url where the QR code redirects to, will be parsed and stored as ids */
  to?: InputMaybe<Scalars['String']['input']>;
};

export type QrCodesFilter = {
  journeyId?: InputMaybe<Scalars['ID']['input']>;
  teamId?: InputMaybe<Scalars['ID']['input']>;
};

export type Query = {
  __typename?: 'Query';
  adminJourney: Journey;
  adminJourneys: Array<Journey>;
  adminJourneysReport?: Maybe<Scalars['Json']['output']>;
  adminVideo: Video;
  adminVideos: Array<Video>;
  adminVideosCount: Scalars['Int']['output'];
  arclightApiKeyByKey?: Maybe<ArclightApiKey>;
  arclightApiKeys: Array<ArclightApiKey>;
  bibleBooks: Array<BibleBook>;
  bibleCitation: BibleCitation;
  bibleCitations: Array<BibleCitation>;
  block?: Maybe<Block>;
  blocks: Array<Block>;
  countries: Array<Country>;
  country?: Maybe<Country>;
  customDomain?: Maybe<CustomDomain>;
  customDomains?: Maybe<Array<CustomDomain>>;
  getJourneyProfile?: Maybe<JourneyProfile>;
  getMuxVideo?: Maybe<MuxVideo>;
  getMyCloudflareImage: CloudflareImage;
  getMyCloudflareImages: Array<CloudflareImage>;
  getMyMuxVideo: MuxVideo;
  getMyMuxVideos: Array<MuxVideo>;
  getTranscodeAssetProgress?: Maybe<Scalars['Int']['output']>;
  getUserRole?: Maybe<UserRole>;
  hosts?: Maybe<Array<Host>>;
  integrations?: Maybe<Array<Integration>>;
  journey?: Maybe<Journey>;
  journeyCollection: JourneyCollection;
  journeyCollections: Array<JourneyCollection>;
  journeyEventsConnection?: Maybe<QueryJourneyEventsConnection>;
  journeyEventsCount: Scalars['Int']['output'];
  journeySimpleGet?: Maybe<Scalars['Json']['output']>;
  journeyTheme?: Maybe<JourneyTheme>;
  journeyVisitorCount?: Maybe<Scalars['Int']['output']>;
  journeyVisitorsConnection?: Maybe<QueryJourneyVisitorsConnection>;
  journeys: Array<Journey>;
  journeysEmailPreference?: Maybe<JourneysEmailPreference>;
  journeysPlausibleStatsAggregate?: Maybe<PlausibleStatsAggregateResponse>;
  journeysPlausibleStatsBreakdown?: Maybe<Array<PlausibleStatsResponse>>;
  journeysPlausibleStatsRealtimeVisitors?: Maybe<Scalars['Int']['output']>;
  journeysPlausibleStatsTimeseries?: Maybe<Array<PlausibleStatsResponse>>;
  keywords: Array<Keyword>;
  language?: Maybe<Language>;
  languages: Array<Language>;
  languagesCount: Scalars['Int']['output'];
  listUnsplashCollectionPhotos: Array<UnsplashPhoto>;
  me?: Maybe<User>;
  qrCode: QrCode;
  qrCodes: Array<QrCode>;
  searchUnsplashPhotos: UnsplashQueryResponse;
  /** find a short link by id */
  shortLink: QueryShortLinkResult;
  /** find a short link by path and hostname */
  shortLinkByPath: QueryShortLinkByPathResult;
  /** Find a short link domain by id */
  shortLinkDomain: QueryShortLinkDomainResult;
  /** List of short link domains that can be used for short links */
  shortLinkDomains: QueryShortLinkDomainsConnection;
  /** find all short links with optional hostname filter */
  shortLinks: QueryShortLinksConnection;
  tags: Array<Tag>;
  taxonomies: Array<Taxonomy>;
  team?: Maybe<Team>;
  teams?: Maybe<Array<Team>>;
  user?: Maybe<User>;
  userByEmail?: Maybe<User>;
  userInvites?: Maybe<Array<UserInvite>>;
  userTeam?: Maybe<UserTeam>;
  userTeamInvites?: Maybe<Array<UserTeamInvite>>;
  userTeams?: Maybe<Array<UserTeam>>;
  video: Video;
  videoEdition?: Maybe<VideoEdition>;
  videoEditions: Array<VideoEdition>;
  videoOrigins: Array<VideoOrigin>;
  videoVariant: VideoVariant;
  videoVariants: Array<VideoVariant>;
  videos: Array<Video>;
  videosCount: Scalars['Int']['output'];
  visitor?: Maybe<Visitor>;
  visitorsConnection?: Maybe<QueryVisitorsConnection>;
};


export type QueryAdminJourneyArgs = {
  id: Scalars['ID']['input'];
  idType?: InputMaybe<IdType>;
};


export type QueryAdminJourneysArgs = {
  status?: InputMaybe<Array<JourneyStatus>>;
  teamId?: InputMaybe<Scalars['ID']['input']>;
  template?: InputMaybe<Scalars['Boolean']['input']>;
  useLastActiveTeamId?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryAdminJourneysReportArgs = {
  reportType: JourneysReportType;
};


export type QueryAdminVideoArgs = {
  id: Scalars['ID']['input'];
  idType?: InputMaybe<IdType>;
};


export type QueryAdminVideosArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<VideosFilter>;
};


export type QueryAdminVideosCountArgs = {
  where?: InputMaybe<VideosFilter>;
};


export type QueryArclightApiKeyByKeyArgs = {
  key: Scalars['String']['input'];
};


export type QueryBibleCitationArgs = {
  id: Scalars['ID']['input'];
};


export type QueryBibleCitationsArgs = {
  videoId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryBlockArgs = {
  id: Scalars['ID']['input'];
};


export type QueryBlocksArgs = {
  where?: InputMaybe<BlocksFilter>;
};


export type QueryCountriesArgs = {
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  term?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCountryArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCustomDomainArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCustomDomainsArgs = {
  teamId: Scalars['ID']['input'];
};


export type QueryGetMuxVideoArgs = {
  id: Scalars['ID']['input'];
  userGenerated?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryGetMyCloudflareImageArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetMyCloudflareImagesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetMyMuxVideoArgs = {
  id: Scalars['ID']['input'];
  userGenerated?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryGetMyMuxVideosArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetTranscodeAssetProgressArgs = {
  jobId: Scalars['String']['input'];
};


export type QueryHostsArgs = {
  teamId: Scalars['ID']['input'];
};


export type QueryIntegrationsArgs = {
  teamId: Scalars['ID']['input'];
};


export type QueryJourneyArgs = {
  id: Scalars['ID']['input'];
  idType?: InputMaybe<IdType>;
  options?: InputMaybe<JourneysQueryOptions>;
};


export type QueryJourneyCollectionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryJourneyCollectionsArgs = {
  teamId: Scalars['ID']['input'];
};


export type QueryJourneyEventsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<JourneyEventsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  journeyId: Scalars['ID']['input'];
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryJourneyEventsCountArgs = {
  filter?: InputMaybe<JourneyEventsFilter>;
  journeyId: Scalars['ID']['input'];
};


export type QueryJourneySimpleGetArgs = {
  id: Scalars['ID']['input'];
};


export type QueryJourneyThemeArgs = {
  journeyId: Scalars['ID']['input'];
};


export type QueryJourneyVisitorCountArgs = {
  filter: JourneyVisitorFilter;
};


export type QueryJourneyVisitorsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter: JourneyVisitorFilter;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<JourneyVisitorSort>;
};


export type QueryJourneysArgs = {
  options?: InputMaybe<JourneysQueryOptions>;
  where?: InputMaybe<JourneysFilter>;
};


export type QueryJourneysEmailPreferenceArgs = {
  email: Scalars['String']['input'];
};


export type QueryJourneysPlausibleStatsAggregateArgs = {
  id: Scalars['ID']['input'];
  idType?: InputMaybe<IdType>;
  where: PlausibleStatsAggregateFilter;
};


export type QueryJourneysPlausibleStatsBreakdownArgs = {
  id: Scalars['ID']['input'];
  idType?: InputMaybe<IdType>;
  where: PlausibleStatsBreakdownFilter;
};


export type QueryJourneysPlausibleStatsRealtimeVisitorsArgs = {
  id: Scalars['ID']['input'];
  idType?: InputMaybe<IdType>;
};


export type QueryJourneysPlausibleStatsTimeseriesArgs = {
  id: Scalars['ID']['input'];
  idType?: InputMaybe<IdType>;
  where: PlausibleStatsTimeseriesFilter;
};


export type QueryLanguageArgs = {
  id: Scalars['ID']['input'];
  idType?: InputMaybe<LanguageIdType>;
};


export type QueryLanguagesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  term?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<LanguagesFilter>;
};


export type QueryLanguagesCountArgs = {
  term?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<LanguagesFilter>;
};


export type QueryListUnsplashCollectionPhotosArgs = {
  collectionId: Scalars['String']['input'];
  orientation?: InputMaybe<UnsplashPhotoOrientation>;
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMeArgs = {
  input?: InputMaybe<MeInput>;
};


export type QueryQrCodeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryQrCodesArgs = {
  where: QrCodesFilter;
};


export type QuerySearchUnsplashPhotosArgs = {
  collections?: InputMaybe<Array<Scalars['String']['input']>>;
  color?: InputMaybe<UnsplashColor>;
  contentFilter?: InputMaybe<UnsplashContentFilter>;
  orderBy?: InputMaybe<UnsplashOrderBy>;
  orientation?: InputMaybe<UnsplashPhotoOrientation>;
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
};


export type QueryShortLinkArgs = {
  id: Scalars['String']['input'];
};


export type QueryShortLinkByPathArgs = {
  hostname: Scalars['String']['input'];
  pathname: Scalars['String']['input'];
};


export type QueryShortLinkDomainArgs = {
  id: Scalars['String']['input'];
};


export type QueryShortLinkDomainsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  service?: InputMaybe<Service>;
};


export type QueryShortLinksArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  hostname?: InputMaybe<Scalars['String']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryTaxonomiesArgs = {
  category?: InputMaybe<Scalars['String']['input']>;
  languageCodes?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryTeamArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUserByEmailArgs = {
  email: Scalars['String']['input'];
};


export type QueryUserInvitesArgs = {
  journeyId: Scalars['ID']['input'];
};


export type QueryUserTeamArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUserTeamInvitesArgs = {
  teamId: Scalars['ID']['input'];
};


export type QueryUserTeamsArgs = {
  teamId: Scalars['ID']['input'];
  where?: InputMaybe<UserTeamFilterInput>;
};


export type QueryVideoArgs = {
  id: Scalars['ID']['input'];
  idType?: InputMaybe<IdType>;
};


export type QueryVideoEditionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryVideoVariantArgs = {
  id: Scalars['ID']['input'];
};


export type QueryVideoVariantsArgs = {
  input?: InputMaybe<VideoVariantFilter>;
};


export type QueryVideosArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<VideosFilter>;
};


export type QueryVideosCountArgs = {
  where?: InputMaybe<VideosFilter>;
};


export type QueryVisitorArgs = {
  id: Scalars['ID']['input'];
};


export type QueryVisitorsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  teamId: Scalars['ID']['input'];
};

export type QueryJourneyEventsConnection = {
  __typename?: 'QueryJourneyEventsConnection';
  edges?: Maybe<Array<Maybe<QueryJourneyEventsConnectionEdge>>>;
  pageInfo: PageInfo;
};

export type QueryJourneyEventsConnectionEdge = {
  __typename?: 'QueryJourneyEventsConnectionEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Event>;
};

export type QueryJourneyVisitorsConnection = {
  __typename?: 'QueryJourneyVisitorsConnection';
  edges?: Maybe<Array<Maybe<QueryJourneyVisitorsConnectionEdge>>>;
  pageInfo: PageInfo;
};

export type QueryJourneyVisitorsConnectionEdge = {
  __typename?: 'QueryJourneyVisitorsConnectionEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<JourneyVisitor>;
};

export type QueryShortLinkByPathResult = NotFoundError | QueryShortLinkByPathSuccess;

export type QueryShortLinkByPathSuccess = {
  __typename?: 'QueryShortLinkByPathSuccess';
  data: ShortLink;
};

export type QueryShortLinkDomainResult = NotFoundError | QueryShortLinkDomainSuccess;

export type QueryShortLinkDomainSuccess = {
  __typename?: 'QueryShortLinkDomainSuccess';
  data: ShortLinkDomain;
};

export type QueryShortLinkDomainsConnection = {
  __typename?: 'QueryShortLinkDomainsConnection';
  edges?: Maybe<Array<Maybe<QueryShortLinkDomainsConnectionEdge>>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type QueryShortLinkDomainsConnectionEdge = {
  __typename?: 'QueryShortLinkDomainsConnectionEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<ShortLinkDomain>;
};

export type QueryShortLinkResult = NotFoundError | QueryShortLinkSuccess;

export type QueryShortLinkSuccess = {
  __typename?: 'QueryShortLinkSuccess';
  data: ShortLink;
};

export type QueryShortLinksConnection = {
  __typename?: 'QueryShortLinksConnection';
  edges?: Maybe<Array<Maybe<QueryShortLinksConnectionEdge>>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type QueryShortLinksConnectionEdge = {
  __typename?: 'QueryShortLinksConnectionEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<ShortLink>;
};

export type QueryVisitorsConnection = {
  __typename?: 'QueryVisitorsConnection';
  edges?: Maybe<Array<Maybe<QueryVisitorsConnectionEdge>>>;
  pageInfo: PageInfo;
};

export type QueryVisitorsConnectionEdge = {
  __typename?: 'QueryVisitorsConnectionEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Visitor>;
};

export type RadioOptionBlock = Block & {
  __typename?: 'RadioOptionBlock';
  action?: Maybe<Action>;
  id: Scalars['ID']['output'];
  journeyId: Scalars['ID']['output'];
  label: Scalars['String']['output'];
  parentBlockId?: Maybe<Scalars['ID']['output']>;
  parentOrder?: Maybe<Scalars['Int']['output']>;
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

export type RadioQuestionBlock = Block & {
  __typename?: 'RadioQuestionBlock';
  id: Scalars['ID']['output'];
  journeyId: Scalars['ID']['output'];
  parentBlockId?: Maybe<Scalars['ID']['output']>;
  parentOrder?: Maybe<Scalars['Int']['output']>;
};

export type RadioQuestionBlockCreateInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  journeyId: Scalars['ID']['input'];
  parentBlockId: Scalars['ID']['input'];
};

export type RadioQuestionBlockUpdateInput = {
  parentBlockId?: InputMaybe<Scalars['ID']['input']>;
};

export type RadioQuestionSubmissionEvent = Event & {
  __typename?: 'RadioQuestionSubmissionEvent';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  journeyId?: Maybe<Scalars['String']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

export type RadioQuestionSubmissionEventCreateInput = {
  blockId: Scalars['String']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  radioOptionBlockId: Scalars['String']['input'];
  stepId?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

export enum RedirectType {
  Dh = 'dh',
  Dl = 'dl',
  Hls = 'hls',
  S = 's'
}

export enum Role {
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

/** A short link that redirects to a full URL */
export type ShortLink = {
  __typename?: 'ShortLink';
  /** brightcove video ID for video redirects */
  brightcoveId?: Maybe<Scalars['String']['output']>;
  domain: ShortLinkDomain;
  id?: Maybe<Scalars['ID']['output']>;
  /** short link path not including the leading slash */
  pathname: Scalars['String']['output'];
  /** type of video redirect (hls, dl, dh, s) */
  redirectType?: Maybe<RedirectType>;
  /** the service that created this short link */
  service: Service;
  /** the fully qualified domain name (FQDN) to redirect the short link service should redirect the user to */
  to: Scalars['String']['output'];
};

/** A domain that can be used for short links */
export type ShortLinkDomain = {
  __typename?: 'ShortLinkDomain';
  apexName: Scalars['String']['output'];
  /** check status of the domain */
  check: ShortLinkDomainCheck;
  createdAt: Scalars['Date']['output'];
  hostname: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  /** The services that are enabled for this domain, if empty then this domain can be used by all services */
  services: Array<Service>;
  updatedAt: Scalars['Date']['output'];
};

export type ShortLinkDomainCheck = {
  __typename?: 'ShortLinkDomainCheck';
  /** Is the domain correctly configured in the DNS? If false, A Record and CNAME Record should be added by the user. */
  configured: Scalars['Boolean']['output'];
  /** Verification records to be added to the DNS to confirm ownership. */
  verification: Array<ShortLinkDomainVerfication>;
  /** Does the domain belong to the short link application? If false, verification will be populated. */
  verified: Scalars['Boolean']['output'];
};

export type ShortLinkDomainVerfication = {
  __typename?: 'ShortLinkDomainVerfication';
  /** Domain name */
  domain: Scalars['String']['output'];
  /** Reason for the verification */
  reason: Scalars['String']['output'];
  /** Type of verification */
  type: Scalars['String']['output'];
  /** Value of the verification */
  value: Scalars['String']['output'];
};

export type SignUpBlock = Block & {
  __typename?: 'SignUpBlock';
  action?: Maybe<Action>;
  id: Scalars['ID']['output'];
  journeyId: Scalars['ID']['output'];
  parentBlockId?: Maybe<Scalars['ID']['output']>;
  parentOrder?: Maybe<Scalars['Int']['output']>;
  submitIconId?: Maybe<Scalars['ID']['output']>;
  submitLabel?: Maybe<Scalars['String']['output']>;
};

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

export type SignUpSubmissionEvent = Event & {
  __typename?: 'SignUpSubmissionEvent';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  journeyId?: Maybe<Scalars['String']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

export type SignUpSubmissionEventCreateInput = {
  blockId: Scalars['String']['input'];
  email: Scalars['String']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  stepId?: InputMaybe<Scalars['String']['input']>;
};

export type Site = {
  __typename?: 'Site';
  domain: Scalars['String']['output'];
  goals: Array<SiteGoal>;
  id: Scalars['String']['output'];
  memberships: Array<SiteMembership>;
  sharedLinks: Array<SiteSharedLink>;
};

export type SiteCreateInput = {
  domain: Scalars['String']['input'];
  goals?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type SiteGoal = {
  __typename?: 'SiteGoal';
  eventName?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
};

export type SiteMembership = {
  __typename?: 'SiteMembership';
  id: Scalars['String']['output'];
  role: Scalars['String']['output'];
};

export type SiteSharedLink = {
  __typename?: 'SiteSharedLink';
  id: Scalars['String']['output'];
  slug: Scalars['String']['output'];
};

export type SpacerBlock = Block & {
  __typename?: 'SpacerBlock';
  id: Scalars['ID']['output'];
  journeyId: Scalars['ID']['output'];
  parentBlockId?: Maybe<Scalars['ID']['output']>;
  parentOrder?: Maybe<Scalars['Int']['output']>;
  spacing?: Maybe<Scalars['Int']['output']>;
};

export type SpacerBlockCreateInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  journeyId: Scalars['ID']['input'];
  parentBlockId: Scalars['ID']['input'];
  spacing?: InputMaybe<Scalars['Int']['input']>;
};

export type SpacerBlockUpdateInput = {
  spacing?: InputMaybe<Scalars['Int']['input']>;
};

export type StepBlock = Block & {
  __typename?: 'StepBlock';
  id: Scalars['ID']['output'];
  journeyId: Scalars['ID']['output'];
  /**
   * locked will be set to true if the user should not be able to manually
   * advance to the next step.
   */
  locked: Scalars['Boolean']['output'];
  /**
   * nextBlockId contains the preferred block to navigate to, users will have to
   * manually set the next block they want to card to navigate to
   */
  nextBlockId?: Maybe<Scalars['ID']['output']>;
  parentBlockId?: Maybe<Scalars['ID']['output']>;
  parentOrder?: Maybe<Scalars['Int']['output']>;
  /**
   * Slug should be unique amongst all blocks
   * (server will throw BAD_USER_INPUT error if not)
   * If not required will use the current block id
   * If the generated slug is not unique the uuid will be placed
   * at the end of the slug guaranteeing uniqueness
   */
  slug?: Maybe<Scalars['String']['output']>;
  /**
   * x is used to position the block horizontally in the journey flow diagram on
   * the editor.
   */
  x?: Maybe<Scalars['Int']['output']>;
  /**
   * y is used to position the block vertically in the journey flow diagram on
   * the editor.
   */
  y?: Maybe<Scalars['Int']['output']>;
};

export type StepBlockCreateInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  journeyId: Scalars['ID']['input'];
  locked?: InputMaybe<Scalars['Boolean']['input']>;
  nextBlockId?: InputMaybe<Scalars['ID']['input']>;
  /** x is used to position the block horizontally in the journey flow diagram on the editor. */
  x?: InputMaybe<Scalars['Int']['input']>;
  /** y is used to position the block vertically in the journey flow diagram on the editor. */
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
  /** Slug should be unique amongst all blocks (server will throw BAD_USER_INPUT error if not). If not required will use the current block id. If the generated slug is not unique the uuid will be placed at the end of the slug guaranteeing uniqueness */
  slug?: InputMaybe<Scalars['String']['input']>;
  /** x is used to position the block horizontally in the journey flow diagram on the editor. */
  x?: InputMaybe<Scalars['Int']['input']>;
  /** y is used to position the block vertically in the journey flow diagram on the editor. */
  y?: InputMaybe<Scalars['Int']['input']>;
};

export type StepNextEvent = Event & {
  __typename?: 'StepNextEvent';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  journeyId?: Maybe<Scalars['String']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

export type StepNextEventCreateInput = {
  blockId: Scalars['String']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  nextStepId: Scalars['String']['input'];
  value?: InputMaybe<Scalars['String']['input']>;
};

export type StepPreviousEvent = Event & {
  __typename?: 'StepPreviousEvent';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  journeyId?: Maybe<Scalars['String']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

export type StepPreviousEventCreateInput = {
  blockId: Scalars['String']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  previousStepId: Scalars['String']['input'];
  value?: InputMaybe<Scalars['String']['input']>;
};

export type StepViewEvent = Event & {
  __typename?: 'StepViewEvent';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  journeyId?: Maybe<Scalars['String']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

export type StepViewEventCreateInput = {
  blockId: Scalars['String']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

export type Subscription = {
  __typename?: 'Subscription';
  journeyAiTranslateCreateSubscription: JourneyAiTranslateProgress;
};


export type SubscriptionJourneyAiTranslateCreateSubscriptionArgs = {
  input: JourneyAiTranslateInput;
};

export type Tag = {
  __typename?: 'Tag';
  id: Scalars['ID']['output'];
  name: Array<TagName>;
  parentId?: Maybe<Scalars['ID']['output']>;
  service?: Maybe<Service>;
};


export type TagNameArgs = {
  languageId?: InputMaybe<Scalars['ID']['input']>;
  primary?: InputMaybe<Scalars['Boolean']['input']>;
};

export type TagName = {
  __typename?: 'TagName';
  id: Scalars['ID']['output'];
  language: Language;
  primary: Scalars['Boolean']['output'];
  value: Scalars['String']['output'];
};

export type Taxonomy = {
  __typename?: 'Taxonomy';
  category: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Array<TaxonomyName>;
  term: Scalars['String']['output'];
};


export type TaxonomyNameArgs = {
  category?: InputMaybe<Scalars['String']['input']>;
  languageCodes?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type TaxonomyName = {
  __typename?: 'TaxonomyName';
  id: Scalars['ID']['output'];
  label: Scalars['String']['output'];
  language: Language;
  taxonomy: Taxonomy;
  term: Scalars['String']['output'];
};

export type Team = {
  __typename?: 'Team';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  customDomains?: Maybe<Array<CustomDomain>>;
  id?: Maybe<Scalars['ID']['output']>;
  publicTitle?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  userTeams?: Maybe<Array<UserTeam>>;
};

export type TeamCreateInput = {
  publicTitle?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type TeamUpdateInput = {
  publicTitle?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type TextResponseBlock = Block & {
  __typename?: 'TextResponseBlock';
  hint?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  integrationId?: Maybe<Scalars['String']['output']>;
  journeyId: Scalars['ID']['output'];
  label: Scalars['String']['output'];
  minRows?: Maybe<Scalars['Int']['output']>;
  parentBlockId?: Maybe<Scalars['ID']['output']>;
  parentOrder?: Maybe<Scalars['Int']['output']>;
  placeholder?: Maybe<Scalars['String']['output']>;
  required?: Maybe<Scalars['Boolean']['output']>;
  routeId?: Maybe<Scalars['String']['output']>;
  type?: Maybe<TextResponseType>;
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
  placeholder?: InputMaybe<Scalars['String']['input']>;
  required?: InputMaybe<Scalars['Boolean']['input']>;
  routeId?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<TextResponseType>;
};

export type TextResponseSubmissionEvent = Event & {
  __typename?: 'TextResponseSubmissionEvent';
  blockId?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  journeyId?: Maybe<Scalars['String']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

export type TextResponseSubmissionEventCreateInput = {
  blockId: Scalars['String']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  stepId?: InputMaybe<Scalars['String']['input']>;
  value: Scalars['String']['input'];
};

export enum TextResponseType {
  Email = 'email',
  FreeForm = 'freeForm',
  Name = 'name',
  Phone = 'phone'
}

export enum ThemeMode {
  Dark = 'dark',
  Light = 'light'
}

export enum ThemeName {
  Base = 'base'
}

export type TranscodeVideoInput = {
  outputFilename: Scalars['String']['input'];
  outputPath: Scalars['String']['input'];
  r2AssetId: Scalars['String']['input'];
  resolution: Scalars['String']['input'];
  videoBitrate?: InputMaybe<Scalars['String']['input']>;
};

export enum TypographyAlign {
  Center = 'center',
  Left = 'left',
  Right = 'right'
}

export type TypographyBlock = Block & {
  __typename?: 'TypographyBlock';
  align?: Maybe<TypographyAlign>;
  color?: Maybe<TypographyColor>;
  content: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  journeyId: Scalars['ID']['output'];
  parentBlockId?: Maybe<Scalars['ID']['output']>;
  parentOrder?: Maybe<Scalars['Int']['output']>;
  settings?: Maybe<TypographyBlockSettings>;
  variant?: Maybe<TypographyVariant>;
};

export type TypographyBlockCreateInput = {
  align?: InputMaybe<TypographyAlign>;
  color?: InputMaybe<TypographyColor>;
  content: Scalars['String']['input'];
  id?: InputMaybe<Scalars['ID']['input']>;
  journeyId: Scalars['ID']['input'];
  parentBlockId: Scalars['ID']['input'];
  settings?: InputMaybe<TypographyBlockSettingsInput>;
  variant?: InputMaybe<TypographyVariant>;
};

export type TypographyBlockSettings = {
  __typename?: 'TypographyBlockSettings';
  /** Color of the typography */
  color?: Maybe<Scalars['String']['output']>;
};

export type TypographyBlockSettingsInput = {
  color?: InputMaybe<Scalars['String']['input']>;
};

export type TypographyBlockUpdateInput = {
  align?: InputMaybe<TypographyAlign>;
  color?: InputMaybe<TypographyColor>;
  content?: InputMaybe<Scalars['String']['input']>;
  parentBlockId?: InputMaybe<Scalars['ID']['input']>;
  settings?: InputMaybe<TypographyBlockSettingsInput>;
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

export type UnsplashPhoto = {
  __typename?: 'UnsplashPhoto';
  alt_description?: Maybe<Scalars['String']['output']>;
  blur_hash?: Maybe<Scalars['String']['output']>;
  color?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  height: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  likes: Scalars['Int']['output'];
  links: UnsplashPhotoLinks;
  promoted_at?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['String']['output']>;
  urls: UnsplashPhotoUrls;
  user: UnsplashUser;
  width: Scalars['Int']['output'];
};

export type UnsplashPhotoLinks = {
  __typename?: 'UnsplashPhotoLinks';
  download: Scalars['String']['output'];
  download_location: Scalars['String']['output'];
  html: Scalars['String']['output'];
  self: Scalars['String']['output'];
};

export enum UnsplashPhotoOrientation {
  Landscape = 'landscape',
  Portrait = 'portrait',
  Squarish = 'squarish'
}

export type UnsplashPhotoUrls = {
  __typename?: 'UnsplashPhotoUrls';
  full: Scalars['String']['output'];
  raw: Scalars['String']['output'];
  regular: Scalars['String']['output'];
  small: Scalars['String']['output'];
  thumb: Scalars['String']['output'];
};

export type UnsplashQueryResponse = {
  __typename?: 'UnsplashQueryResponse';
  results: Array<UnsplashPhoto>;
  total: Scalars['Int']['output'];
  total_pages: Scalars['Int']['output'];
};

export type UnsplashUser = {
  __typename?: 'UnsplashUser';
  bio?: Maybe<Scalars['String']['output']>;
  first_name: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  instagram_username?: Maybe<Scalars['String']['output']>;
  last_name?: Maybe<Scalars['String']['output']>;
  links: UnsplashUserLinks;
  location?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  portfolio_url?: Maybe<Scalars['String']['output']>;
  profile_image: UnsplashUserImage;
  total_collections: Scalars['Int']['output'];
  total_likes: Scalars['Int']['output'];
  total_photos: Scalars['Int']['output'];
  twitter_username?: Maybe<Scalars['String']['output']>;
  updated_at: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

export type UnsplashUserImage = {
  __typename?: 'UnsplashUserImage';
  large: Scalars['String']['output'];
  medium: Scalars['String']['output'];
  small: Scalars['String']['output'];
};

export type UnsplashUserLinks = {
  __typename?: 'UnsplashUserLinks';
  followers: Scalars['String']['output'];
  following: Scalars['String']['output'];
  html: Scalars['String']['output'];
  likes: Scalars['String']['output'];
  photos: Scalars['String']['output'];
  portfolio: Scalars['String']['output'];
  self: Scalars['String']['output'];
};

export type User = {
  __typename?: 'User';
  email: Scalars['String']['output'];
  emailVerified: Scalars['Boolean']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  languageUserRoles: Array<LanguageRole>;
  lastName?: Maybe<Scalars['String']['output']>;
  mediaUserRoles: Array<MediaRole>;
  superAdmin?: Maybe<Scalars['Boolean']['output']>;
};

export type UserAgent = {
  __typename?: 'UserAgent';
  browser?: Maybe<Browser>;
  device?: Maybe<Device>;
  os?: Maybe<OperatingSystem>;
};

export type UserInvite = {
  __typename?: 'UserInvite';
  acceptedAt?: Maybe<Scalars['DateTime']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  journey?: Maybe<Journey>;
  journeyId?: Maybe<Scalars['ID']['output']>;
  removedAt?: Maybe<Scalars['DateTime']['output']>;
  senderId?: Maybe<Scalars['ID']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type UserInviteCreateInput = {
  email: Scalars['String']['input'];
};

export type UserJourney = {
  __typename?: 'UserJourney';
  id?: Maybe<Scalars['ID']['output']>;
  journey?: Maybe<Journey>;
  journeyId?: Maybe<Scalars['ID']['output']>;
  journeyNotification?: Maybe<JourneyNotification>;
  openedAt?: Maybe<Scalars['DateTime']['output']>;
  role?: Maybe<UserJourneyRole>;
  user?: Maybe<User>;
  userId?: Maybe<Scalars['ID']['output']>;
};

export enum UserJourneyRole {
  Editor = 'editor',
  InviteRequested = 'inviteRequested',
  Owner = 'owner'
}

export type UserRole = {
  __typename?: 'UserRole';
  id?: Maybe<Scalars['ID']['output']>;
  roles?: Maybe<Array<Role>>;
  userId?: Maybe<Scalars['ID']['output']>;
};

export type UserTeam = {
  __typename?: 'UserTeam';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  journeyNotification?: Maybe<JourneyNotification>;
  role?: Maybe<UserTeamRole>;
  team?: Maybe<Team>;
  teamId?: Maybe<Scalars['ID']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  user?: Maybe<User>;
  userId?: Maybe<Scalars['ID']['output']>;
};


export type UserTeamJourneyNotificationArgs = {
  journeyId: Scalars['ID']['input'];
};

export type UserTeamFilterInput = {
  role?: InputMaybe<Array<UserTeamRole>>;
};

export type UserTeamInvite = {
  __typename?: 'UserTeamInvite';
  acceptedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  receipientId?: Maybe<Scalars['ID']['output']>;
  removedAt?: Maybe<Scalars['DateTime']['output']>;
  senderId?: Maybe<Scalars['ID']['output']>;
  team?: Maybe<Team>;
  teamId?: Maybe<Scalars['ID']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
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

export type Video = {
  __typename?: 'Video';
  availableLanguages: Array<Scalars['String']['output']>;
  bibleCitations: Array<BibleCitation>;
  children: Array<Video>;
  /** the number value of the amount of children on a video */
  childrenCount: Scalars['Int']['output'];
  cloudflareAssets: Array<CloudflareR2>;
  description: Array<VideoDescription>;
  id: Scalars['ID']['output'];
  imageAlt: Array<VideoImageAlt>;
  images: Array<CloudflareImage>;
  keywords: Array<Keyword>;
  label: VideoLabel;
  locked: Scalars['Boolean']['output'];
  noIndex?: Maybe<Scalars['Boolean']['output']>;
  origin?: Maybe<VideoOrigin>;
  parents: Array<Video>;
  primaryLanguageId: Scalars['ID']['output'];
  published: Scalars['Boolean']['output'];
  publishedAt?: Maybe<Scalars['Date']['output']>;
  restrictDownloadPlatforms: Array<Platform>;
  restrictViewPlatforms: Array<Platform>;
  /** slug is a permanent link to the video. */
  slug: Scalars['String']['output'];
  snippet: Array<VideoSnippet>;
  source?: Maybe<VideoBlockSource>;
  studyQuestions: Array<VideoStudyQuestion>;
  subtitles: Array<VideoSubtitle>;
  title: Array<VideoTitle>;
  variant?: Maybe<VideoVariant>;
  variantLanguages: Array<Language>;
  variantLanguagesCount: Scalars['Int']['output'];
  variantLanguagesWithSlug: Array<LanguageWithSlug>;
  variants: Array<VideoVariant>;
  videoEditions: Array<VideoEdition>;
};


export type VideoDescriptionArgs = {
  languageId?: InputMaybe<Scalars['ID']['input']>;
  primary?: InputMaybe<Scalars['Boolean']['input']>;
};


export type VideoImageAltArgs = {
  languageId?: InputMaybe<Scalars['ID']['input']>;
  primary?: InputMaybe<Scalars['Boolean']['input']>;
};


export type VideoImagesArgs = {
  aspectRatio?: InputMaybe<ImageAspectRatio>;
};


export type VideoKeywordsArgs = {
  languageId?: InputMaybe<Scalars['ID']['input']>;
};


export type VideoSnippetArgs = {
  languageId?: InputMaybe<Scalars['ID']['input']>;
  primary?: InputMaybe<Scalars['Boolean']['input']>;
};


export type VideoStudyQuestionsArgs = {
  languageId?: InputMaybe<Scalars['ID']['input']>;
  primary?: InputMaybe<Scalars['Boolean']['input']>;
};


export type VideoSubtitlesArgs = {
  edition?: InputMaybe<Scalars['String']['input']>;
  languageId?: InputMaybe<Scalars['ID']['input']>;
  primary?: InputMaybe<Scalars['Boolean']['input']>;
};


export type VideoTitleArgs = {
  languageId?: InputMaybe<Scalars['ID']['input']>;
  primary?: InputMaybe<Scalars['Boolean']['input']>;
};


export type VideoVariantArgs = {
  languageId?: InputMaybe<Scalars['ID']['input']>;
};


export type VideoVariantLanguagesCountArgs = {
  input?: InputMaybe<VideoVariantFilter>;
};


export type VideoVariantLanguagesWithSlugArgs = {
  input?: InputMaybe<VideoVariantFilter>;
};


export type VideoVariantsArgs = {
  input?: InputMaybe<VideoVariantFilter>;
};

export type VideoBlock = Block & {
  __typename?: 'VideoBlock';
  action?: Maybe<Action>;
  autoplay: Scalars['Boolean']['output'];
  description: Scalars['String']['output'];
  duration?: Maybe<Scalars['Int']['output']>;
  endAt?: Maybe<Scalars['Int']['output']>;
  fullsize: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  journeyId: Scalars['ID']['output'];
  mediaVideo?: Maybe<MediaVideo>;
  muted: Scalars['Boolean']['output'];
  objectFit?: Maybe<VideoBlockObjectFit>;
  parentBlockId?: Maybe<Scalars['ID']['output']>;
  parentOrder?: Maybe<Scalars['Int']['output']>;
  posterBlockId?: Maybe<Scalars['ID']['output']>;
  source?: Maybe<VideoBlockSource>;
  startAt?: Maybe<Scalars['Int']['output']>;
  title: Scalars['String']['output'];
  videoId?: Maybe<Scalars['String']['output']>;
  videoVariantLanguageId?: Maybe<Scalars['String']['output']>;
};

export type VideoBlockCreateInput = {
  autoplay?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  duration?: InputMaybe<Scalars['Int']['input']>;
  endAt?: InputMaybe<Scalars['Int']['input']>;
  fullsize?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  journeyId: Scalars['ID']['input'];
  muted?: InputMaybe<Scalars['Boolean']['input']>;
  objectFit?: InputMaybe<VideoBlockObjectFit>;
  parentBlockId: Scalars['ID']['input'];
  posterBlockId?: InputMaybe<Scalars['ID']['input']>;
  source?: InputMaybe<VideoBlockSource>;
  startAt?: InputMaybe<Scalars['Int']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  videoId?: InputMaybe<Scalars['ID']['input']>;
  videoVariantLanguageId?: InputMaybe<Scalars['ID']['input']>;
};

export enum VideoBlockObjectFit {
  Fill = 'fill',
  Fit = 'fit',
  Zoomed = 'zoomed'
}

export enum VideoBlockSource {
  Cloudflare = 'cloudflare',
  Internal = 'internal',
  Mux = 'mux',
  YouTube = 'youTube'
}

export type VideoBlockUpdateInput = {
  autoplay?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  duration?: InputMaybe<Scalars['Int']['input']>;
  endAt?: InputMaybe<Scalars['Int']['input']>;
  fullsize?: InputMaybe<Scalars['Boolean']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  muted?: InputMaybe<Scalars['Boolean']['input']>;
  objectFit?: InputMaybe<VideoBlockObjectFit>;
  parentBlockId?: InputMaybe<Scalars['ID']['input']>;
  posterBlockId?: InputMaybe<Scalars['ID']['input']>;
  startAt?: InputMaybe<Scalars['Int']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  videoId?: InputMaybe<Scalars['ID']['input']>;
  videoVariantLanguageId?: InputMaybe<Scalars['ID']['input']>;
};

export type VideoCollapseEvent = Event & {
  __typename?: 'VideoCollapseEvent';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  journeyId?: Maybe<Scalars['String']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  position?: Maybe<Scalars['Float']['output']>;
  source?: Maybe<VideoBlockSource>;
  value?: Maybe<Scalars['String']['output']>;
};

export type VideoCollapseEventCreateInput = {
  blockId: Scalars['String']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<Scalars['Float']['input']>;
  stepId?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<VideoBlockSource>;
};

export type VideoCompleteEvent = Event & {
  __typename?: 'VideoCompleteEvent';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  journeyId?: Maybe<Scalars['String']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  position?: Maybe<Scalars['Float']['output']>;
  source?: Maybe<VideoBlockSource>;
  value?: Maybe<Scalars['String']['output']>;
};

export type VideoCompleteEventCreateInput = {
  blockId: Scalars['String']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<Scalars['Float']['input']>;
  stepId?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<VideoBlockSource>;
};

export type VideoCreateInput = {
  childIds: Array<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  label: VideoLabel;
  noIndex: Scalars['Boolean']['input'];
  originId: Scalars['String']['input'];
  primaryLanguageId: Scalars['String']['input'];
  published: Scalars['Boolean']['input'];
  slug: Scalars['String']['input'];
};

export type VideoDescription = {
  __typename?: 'VideoDescription';
  id: Scalars['ID']['output'];
  language: Language;
  primary: Scalars['Boolean']['output'];
  value: Scalars['String']['output'];
};

export type VideoEdition = {
  __typename?: 'VideoEdition';
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  videoSubtitles: Array<VideoSubtitle>;
  videoVariants: Array<VideoVariant>;
};

export type VideoEditionCreateInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
  videoId: Scalars['String']['input'];
};

export type VideoEditionUpdateInput = {
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};

export type VideoExpandEvent = Event & {
  __typename?: 'VideoExpandEvent';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  journeyId?: Maybe<Scalars['String']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  position?: Maybe<Scalars['Float']['output']>;
  source?: Maybe<VideoBlockSource>;
  value?: Maybe<Scalars['String']['output']>;
};

export type VideoExpandEventCreateInput = {
  blockId: Scalars['String']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<Scalars['Float']['input']>;
  stepId?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<VideoBlockSource>;
};

export type VideoImageAlt = {
  __typename?: 'VideoImageAlt';
  id: Scalars['ID']['output'];
  language: Language;
  primary: Scalars['Boolean']['output'];
  value: Scalars['String']['output'];
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

export type VideoOrigin = {
  __typename?: 'VideoOrigin';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type VideoPauseEvent = Event & {
  __typename?: 'VideoPauseEvent';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  journeyId?: Maybe<Scalars['String']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  position?: Maybe<Scalars['Float']['output']>;
  source?: Maybe<VideoBlockSource>;
  value?: Maybe<Scalars['String']['output']>;
};

export type VideoPauseEventCreateInput = {
  blockId: Scalars['String']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<Scalars['Float']['input']>;
  stepId?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<VideoBlockSource>;
};

export type VideoPlayEvent = Event & {
  __typename?: 'VideoPlayEvent';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  journeyId?: Maybe<Scalars['String']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  position?: Maybe<Scalars['Float']['output']>;
  source?: Maybe<VideoBlockSource>;
  value?: Maybe<Scalars['String']['output']>;
};

export type VideoPlayEventCreateInput = {
  blockId: Scalars['String']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<Scalars['Float']['input']>;
  stepId?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<VideoBlockSource>;
};

export type VideoProgressEvent = Event & {
  __typename?: 'VideoProgressEvent';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  journeyId?: Maybe<Scalars['String']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  position?: Maybe<Scalars['Float']['output']>;
  progress?: Maybe<Scalars['Int']['output']>;
  source?: Maybe<VideoBlockSource>;
  value?: Maybe<Scalars['String']['output']>;
};

export type VideoProgressEventCreateInput = {
  blockId: Scalars['String']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<Scalars['Float']['input']>;
  progress?: InputMaybe<Scalars['Int']['input']>;
  stepId?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<VideoBlockSource>;
};

export enum VideoRedirectType {
  Dh = 'dh',
  Dl = 'dl',
  Hls = 'hls',
  S = 's'
}

export type VideoSnippet = {
  __typename?: 'VideoSnippet';
  id: Scalars['ID']['output'];
  language: Language;
  primary: Scalars['Boolean']['output'];
  value: Scalars['String']['output'];
};

export type VideoStartEvent = Event & {
  __typename?: 'VideoStartEvent';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  journeyId?: Maybe<Scalars['String']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  position?: Maybe<Scalars['Float']['output']>;
  source?: Maybe<VideoBlockSource>;
  value?: Maybe<Scalars['String']['output']>;
};

export type VideoStartEventCreateInput = {
  blockId: Scalars['String']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<Scalars['Float']['input']>;
  stepId?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<VideoBlockSource>;
};

export type VideoStudyQuestion = {
  __typename?: 'VideoStudyQuestion';
  id: Scalars['ID']['output'];
  language: Language;
  order: Scalars['Int']['output'];
  primary: Scalars['Boolean']['output'];
  value: Scalars['String']['output'];
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
  /** index from 1 */
  order?: InputMaybe<Scalars['Int']['input']>;
  primary?: InputMaybe<Scalars['Boolean']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

export type VideoSubtitle = {
  __typename?: 'VideoSubtitle';
  edition: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  language: Language;
  languageId: Scalars['ID']['output'];
  primary: Scalars['Boolean']['output'];
  /** subtitle file */
  srtAsset?: Maybe<CloudflareR2>;
  srtSrc?: Maybe<Scalars['String']['output']>;
  /** version control for subtitle file */
  srtVersion: Scalars['Int']['output'];
  value: Scalars['String']['output'];
  videoEdition: VideoEdition;
  /** subtitle file */
  vttAsset?: Maybe<CloudflareR2>;
  vttSrc?: Maybe<Scalars['String']['output']>;
  /** version control for subtitle file */
  vttVersion: Scalars['Int']['output'];
};

export type VideoSubtitleCreateInput = {
  edition: Scalars['String']['input'];
  id?: InputMaybe<Scalars['ID']['input']>;
  languageId: Scalars['String']['input'];
  primary: Scalars['Boolean']['input'];
  srtAssetId?: InputMaybe<Scalars['ID']['input']>;
  srtSrc?: InputMaybe<Scalars['String']['input']>;
  srtVersion?: InputMaybe<Scalars['Int']['input']>;
  videoId: Scalars['String']['input'];
  vttAssetId?: InputMaybe<Scalars['ID']['input']>;
  vttSrc?: InputMaybe<Scalars['String']['input']>;
  vttVersion?: InputMaybe<Scalars['Int']['input']>;
};

export type VideoSubtitleUpdateInput = {
  edition: Scalars['String']['input'];
  id: Scalars['ID']['input'];
  languageId?: InputMaybe<Scalars['String']['input']>;
  primary?: InputMaybe<Scalars['Boolean']['input']>;
  srtAssetId?: InputMaybe<Scalars['ID']['input']>;
  srtSrc?: InputMaybe<Scalars['String']['input']>;
  srtVersion?: InputMaybe<Scalars['Int']['input']>;
  vttAssetId?: InputMaybe<Scalars['ID']['input']>;
  vttSrc?: InputMaybe<Scalars['String']['input']>;
  vttVersion?: InputMaybe<Scalars['Int']['input']>;
};

export type VideoTitle = {
  __typename?: 'VideoTitle';
  id: Scalars['ID']['output'];
  language: Language;
  primary: Scalars['Boolean']['output'];
  value: Scalars['String']['output'];
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

export type VideoTriggerBlock = Block & {
  __typename?: 'VideoTriggerBlock';
  action?: Maybe<Action>;
  id: Scalars['ID']['output'];
  journeyId: Scalars['ID']['output'];
  parentBlockId?: Maybe<Scalars['ID']['output']>;
  parentOrder?: Maybe<Scalars['Int']['output']>;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: Scalars['Int']['output'];
};

export type VideoTriggerBlockCreateInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  journeyId: Scalars['ID']['input'];
  parentBlockId: Scalars['ID']['input'];
  /** triggerStart sets the time as to when a video navigates to the next block, this is the number of seconds since the start of the video */
  triggerStart?: InputMaybe<Scalars['Int']['input']>;
};

export type VideoTriggerBlockUpdateInput = {
  triggerStart?: InputMaybe<Scalars['Int']['input']>;
};

export type VideoUpdateInput = {
  childIds?: InputMaybe<Array<Scalars['String']['input']>>;
  id: Scalars['String']['input'];
  keywordIds?: InputMaybe<Array<Scalars['String']['input']>>;
  label?: InputMaybe<VideoLabel>;
  noIndex?: InputMaybe<Scalars['Boolean']['input']>;
  primaryLanguageId?: InputMaybe<Scalars['String']['input']>;
  published?: InputMaybe<Scalars['Boolean']['input']>;
  restrictDownloadPlatforms?: InputMaybe<Array<Platform>>;
  restrictViewPlatforms?: InputMaybe<Array<Platform>>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type VideoVariant = {
  __typename?: 'VideoVariant';
  /** master video file */
  asset?: Maybe<CloudflareR2>;
  brightcoveId?: Maybe<Scalars['String']['output']>;
  dash?: Maybe<Scalars['String']['output']>;
  downloadable: Scalars['Boolean']['output'];
  downloads: Array<VideoVariantDownload>;
  duration: Scalars['Int']['output'];
  hls?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  language: Language;
  lengthInMilliseconds: Scalars['Int']['output'];
  muxVideo?: Maybe<MuxVideo>;
  published: Scalars['Boolean']['output'];
  share?: Maybe<Scalars['String']['output']>;
  /** slug is a permanent link to the video variant. */
  slug: Scalars['String']['output'];
  subtitle: Array<VideoSubtitle>;
  subtitleCount: Scalars['Int']['output'];
  /** version control for master video file */
  version: Scalars['Int']['output'];
  videoEdition: VideoEdition;
  videoId?: Maybe<Scalars['ID']['output']>;
};


export type VideoVariantSubtitleArgs = {
  languageId?: InputMaybe<Scalars['ID']['input']>;
  primary?: InputMaybe<Scalars['Boolean']['input']>;
};

export type VideoVariantCreateInput = {
  assetId?: InputMaybe<Scalars['String']['input']>;
  brightcoveId?: InputMaybe<Scalars['String']['input']>;
  dash?: InputMaybe<Scalars['String']['input']>;
  downloadable: Scalars['Boolean']['input'];
  duration?: InputMaybe<Scalars['Int']['input']>;
  edition: Scalars['String']['input'];
  hls?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  languageId: Scalars['String']['input'];
  lengthInMilliseconds?: InputMaybe<Scalars['Int']['input']>;
  muxVideoId?: InputMaybe<Scalars['String']['input']>;
  published?: InputMaybe<Scalars['Boolean']['input']>;
  share?: InputMaybe<Scalars['String']['input']>;
  slug: Scalars['String']['input'];
  version?: InputMaybe<Scalars['Int']['input']>;
  videoId: Scalars['String']['input'];
};

export type VideoVariantDownload = {
  __typename?: 'VideoVariantDownload';
  /** master video file */
  asset?: Maybe<CloudflareR2>;
  bitrate: Scalars['Int']['output'];
  height: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  quality: VideoVariantDownloadQuality;
  size: Scalars['Float']['output'];
  url: Scalars['String']['output'];
  /** master video file version */
  version: Scalars['Int']['output'];
  width: Scalars['Int']['output'];
};

export type VideoVariantDownloadCreateInput = {
  assetId?: InputMaybe<Scalars['String']['input']>;
  bitrate?: InputMaybe<Scalars['Int']['input']>;
  height?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  quality: VideoVariantDownloadQuality;
  size?: InputMaybe<Scalars['Float']['input']>;
  url: Scalars['String']['input'];
  version?: InputMaybe<Scalars['Int']['input']>;
  videoVariantId: Scalars['String']['input'];
  width?: InputMaybe<Scalars['Int']['input']>;
};

export enum VideoVariantDownloadQuality {
  DistroHigh = 'distroHigh',
  DistroLow = 'distroLow',
  DistroSd = 'distroSd',
  Fhd = 'fhd',
  High = 'high',
  Highest = 'highest',
  Low = 'low',
  Qhd = 'qhd',
  Sd = 'sd',
  Uhd = 'uhd'
}

export type VideoVariantDownloadUpdateInput = {
  assetId?: InputMaybe<Scalars['String']['input']>;
  bitrate?: InputMaybe<Scalars['Int']['input']>;
  height?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['String']['input'];
  quality?: InputMaybe<VideoVariantDownloadQuality>;
  size?: InputMaybe<Scalars['Float']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
  version?: InputMaybe<Scalars['Int']['input']>;
  videoVariantId?: InputMaybe<Scalars['String']['input']>;
  width?: InputMaybe<Scalars['Int']['input']>;
};

export type VideoVariantFilter = {
  onlyPublished?: InputMaybe<Scalars['Boolean']['input']>;
};

export type VideoVariantUpdateInput = {
  assetId?: InputMaybe<Scalars['String']['input']>;
  brightcoveId?: InputMaybe<Scalars['String']['input']>;
  dash?: InputMaybe<Scalars['String']['input']>;
  downloadable?: InputMaybe<Scalars['Boolean']['input']>;
  duration?: InputMaybe<Scalars['Int']['input']>;
  edition?: InputMaybe<Scalars['String']['input']>;
  hls?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  languageId?: InputMaybe<Scalars['String']['input']>;
  lengthInMilliseconds?: InputMaybe<Scalars['Int']['input']>;
  muxVideoId?: InputMaybe<Scalars['String']['input']>;
  published?: InputMaybe<Scalars['Boolean']['input']>;
  share?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  version?: InputMaybe<Scalars['Int']['input']>;
  videoId?: InputMaybe<Scalars['String']['input']>;
};

export type VideosFilter = {
  availableVariantLanguageIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  labels?: InputMaybe<Array<VideoLabel>>;
  locked?: InputMaybe<Scalars['Boolean']['input']>;
  published?: InputMaybe<Scalars['Boolean']['input']>;
  subtitleLanguageIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type Visitor = {
  __typename?: 'Visitor';
  countryCode?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  duration?: Maybe<Scalars['Int']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  events?: Maybe<Array<Event>>;
  id?: Maybe<Scalars['ID']['output']>;
  journeyVisitors?: Maybe<Array<JourneyVisitor>>;
  lastChatPlatform?: Maybe<MessagePlatform>;
  lastChatStartedAt?: Maybe<Scalars['DateTime']['output']>;
  lastLinkAction?: Maybe<Scalars['String']['output']>;
  lastRadioOptionSubmission?: Maybe<Scalars['String']['output']>;
  lastRadioQuestion?: Maybe<Scalars['String']['output']>;
  lastStepViewedAt?: Maybe<Scalars['DateTime']['output']>;
  lastTextResponse?: Maybe<Scalars['String']['output']>;
  messagePlatform?: Maybe<MessagePlatform>;
  messagePlatformId?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  referrer?: Maybe<Scalars['String']['output']>;
  status?: Maybe<VisitorStatus>;
  team?: Maybe<Team>;
  teamId?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  userAgent?: Maybe<UserAgent>;
  userId?: Maybe<Scalars['String']['output']>;
};

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

export type VisitorUpdateForCurrentUserInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  messagePlatform?: InputMaybe<MessagePlatform>;
  messagePlatformId?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
};

export type VisitorUpdateInput = {
  countryCode?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  messagePlatform?: InputMaybe<MessagePlatform>;
  messagePlatformId?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  referrer?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<VisitorStatus>;
};

export type YouTube = {
  __typename?: 'YouTube';
  id: Scalars['ID']['output'];
  primaryLanguageId?: Maybe<Scalars['ID']['output']>;
  source: VideoBlockSource;
};

export type Youtube = {
  __typename?: 'Youtube';
  id: Scalars['ID']['output'];
  primaryLanguageId?: Maybe<Scalars['ID']['output']>;
  source?: Maybe<VideoBlockSource>;
};

export type ZodError = BaseError & {
  __typename?: 'ZodError';
  fieldErrors: Array<ZodFieldError>;
  message?: Maybe<Scalars['String']['output']>;
};

export type ZodFieldError = {
  __typename?: 'ZodFieldError';
  message: Scalars['String']['output'];
  path: Array<Scalars['String']['output']>;
};

export enum Join__Graph {
  ApiAnalytics = 'API_ANALYTICS',
  ApiJourneysModern = 'API_JOURNEYS_MODERN',
  ApiLanguages = 'API_LANGUAGES',
  ApiMedia = 'API_MEDIA',
  ApiUsers = 'API_USERS'
}

export enum Link__Purpose {
  /** `EXECUTION` features provide metadata necessary for operation execution. */
  Execution = 'EXECUTION',
  /** `SECURITY` features provide metadata necessary to securely resolve fields. */
  Security = 'SECURITY'
}

export type GetMuxVideoQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetMuxVideoQuery = { __typename?: 'Query', getMuxVideo?: { __typename?: 'MuxVideo', id: string, name?: string | null, playbackId?: string | null, duration?: number | null } | null };

export type GetLanguagesQueryVariables = Exact<{
  languageId: Scalars['ID']['input'];
}>;


export type GetLanguagesQuery = { __typename?: 'Query', language?: { __typename?: 'Language', bcp47?: string | null, id: string } | null };

export type SiteCreateMutationVariables = Exact<{
  input: SiteCreateInput;
}>;


export type SiteCreateMutation = { __typename?: 'Mutation', siteCreate: { __typename: 'Error', message?: string | null } | { __typename?: 'MutationSiteCreateSuccess', data: { __typename: 'Site', id: string, domain: string, memberships: Array<{ __typename: 'SiteMembership', id: string, role: string }>, goals: Array<{ __typename: 'SiteGoal', id: string, eventName?: string | null }>, sharedLinks: Array<{ __typename: 'SiteSharedLink', id: string, slug: string }> } } };

export type GetShortLinkQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetShortLinkQuery = { __typename?: 'Query', shortLink: { __typename?: 'NotFoundError', message?: string | null } | { __typename?: 'QueryShortLinkSuccess', data: { __typename?: 'ShortLink', id?: string | null, pathname: string, to: string, domain: { __typename?: 'ShortLinkDomain', hostname: string } } } };

export type ShortLinkCreateMutationVariables = Exact<{
  input: MutationShortLinkCreateInput;
}>;


export type ShortLinkCreateMutation = { __typename?: 'Mutation', shortLinkCreate: { __typename?: 'MutationShortLinkCreateSuccess', data: { __typename?: 'ShortLink', id?: string | null, pathname: string, to: string, domain: { __typename?: 'ShortLinkDomain', hostname: string } } } | { __typename?: 'NotUniqueError', message?: string | null } | { __typename?: 'ZodError', message?: string | null } };

export type ShortLinkUpdateMutationVariables = Exact<{
  input: MutationShortLinkUpdateInput;
}>;


export type ShortLinkUpdateMutation = { __typename?: 'Mutation', shortLinkUpdate: { __typename?: 'MutationShortLinkUpdateSuccess', data: { __typename?: 'ShortLink', id?: string | null, to: string } } | { __typename?: 'NotFoundError', message?: string | null } | { __typename?: 'ZodError', message?: string | null } };

export type ShortLinkDeleteMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type ShortLinkDeleteMutation = { __typename?: 'Mutation', shortLinkDelete: { __typename?: 'MutationShortLinkDeleteSuccess', data: { __typename?: 'ShortLink', id?: string | null } } | { __typename?: 'NotFoundError', message?: string | null } };


export const GetMuxVideoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMuxVideo"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getMuxVideo"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"playbackId"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}}]}}]}}]} as unknown as DocumentNode<GetMuxVideoQuery, GetMuxVideoQueryVariables>;
export const GetLanguagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetLanguages"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"languageId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"language"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"languageId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bcp47"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<GetLanguagesQuery, GetLanguagesQueryVariables>;
export const SiteCreateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SiteCreate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SiteCreateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"siteCreate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Error"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MutationSiteCreateSuccess"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"domain"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"memberships"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"goals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"eventName"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sharedLinks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<SiteCreateMutation, SiteCreateMutationVariables>;
export const GetShortLinkDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetShortLink"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shortLink"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NotFoundError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"QueryShortLinkSuccess"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"pathname"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"domain"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hostname"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetShortLinkQuery, GetShortLinkQueryVariables>;
export const ShortLinkCreateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"shortLinkCreate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MutationShortLinkCreateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shortLinkCreate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ZodError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NotUniqueError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MutationShortLinkCreateSuccess"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"pathname"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"domain"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hostname"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<ShortLinkCreateMutation, ShortLinkCreateMutationVariables>;
export const ShortLinkUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"shortLinkUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MutationShortLinkUpdateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shortLinkUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ZodError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NotFoundError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MutationShortLinkUpdateSuccess"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"to"}}]}}]}}]}}]}}]} as unknown as DocumentNode<ShortLinkUpdateMutation, ShortLinkUpdateMutationVariables>;
export const ShortLinkDeleteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"shortLinkDelete"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shortLinkDelete"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NotFoundError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MutationShortLinkDeleteSuccess"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]}}]} as unknown as DocumentNode<ShortLinkDeleteMutation, ShortLinkDeleteMutationVariables>;
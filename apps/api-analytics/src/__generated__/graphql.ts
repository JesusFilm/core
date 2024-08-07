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
  DateTime: { input: any; output: any; }
  Json: { input: any; output: any; }
  join__DirectiveArguments: { input: any; output: any; }
  join__FieldSet: { input: any; output: any; }
  link__Import: { input: any; output: any; }
};

export type Action = {
  gtmEventName?: Maybe<Scalars['String']['output']>;
  parentBlock: Block;
  parentBlockId: Scalars['ID']['output'];
};

export type AudioPreview = {
  __typename?: 'AudioPreview';
  duration: Scalars['Int']['output'];
  language: Language;
  size: Scalars['Int']['output'];
  value: Scalars['String']['output'];
};

export type BibleBook = {
  __typename?: 'BibleBook';
  alternateName?: Maybe<Scalars['String']['output']>;
  isNewTestament: Scalars['Boolean']['output'];
  name: Array<Translation>;
  order: Scalars['Int']['output'];
  osisId: Scalars['String']['output'];
  paratextAbbreviation: Scalars['String']['output'];
};


export type BibleBookNameArgs = {
  languageId?: InputMaybe<Scalars['ID']['input']>;
  primary?: InputMaybe<Scalars['Boolean']['input']>;
};

export type BibleCitation = {
  __typename?: 'BibleCitation';
  bibleBook: BibleBook;
  chapterEnd?: Maybe<Scalars['Int']['output']>;
  chapterStart: Scalars['Int']['output'];
  osisId: Scalars['String']['output'];
  verseEnd?: Maybe<Scalars['Int']['output']>;
  verseStart: Scalars['Int']['output'];
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
  size?: Maybe<ButtonSize>;
  startIconId?: Maybe<Scalars['ID']['output']>;
  variant?: Maybe<ButtonVariant>;
};

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

export type ButtonClickEvent = Event & {
  __typename?: 'ButtonClickEvent';
  /** Action type of the button when it was clicked */
  action?: Maybe<ButtonAction>;
  /**
   * The label for each corresponding action, mapping below:
   * NavigateToBlockAction - StepName (generated in client) of the StepBlock
   * LinkAction - url of the link
   */
  actionValue?: Maybe<Scalars['String']['output']>;
  /** time event was created */
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  /** ID of the journey that the buttonBlock belongs to */
  journeyId: Scalars['ID']['output'];
  /** stepName of the parent stepBlock */
  label?: Maybe<Scalars['String']['output']>;
  /** label of the button */
  value?: Maybe<Scalars['String']['output']>;
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

export enum CacheControlScope {
  Private = 'PRIVATE',
  Public = 'PUBLIC'
}

export type CardBlock = Block & {
  __typename?: 'CardBlock';
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

export type ChatButton = {
  __typename?: 'ChatButton';
  id: Scalars['ID']['output'];
  link?: Maybe<Scalars['String']['output']>;
  platform?: Maybe<MessagePlatform>;
};

export type ChatButtonCreateInput = {
  link?: InputMaybe<Scalars['String']['input']>;
  platform?: InputMaybe<MessagePlatform>;
};

export type ChatButtonUpdateInput = {
  link?: InputMaybe<Scalars['String']['input']>;
  platform?: InputMaybe<MessagePlatform>;
};

export type ChatOpenEvent = Event & {
  __typename?: 'ChatOpenEvent';
  /** time event was created */
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  /** ID of the journey that the buttonBlock belongs to */
  journeyId: Scalars['ID']['output'];
  /** null for ChatOpenEvent */
  label?: Maybe<Scalars['String']['output']>;
  /** messagePlatform of the link used for chat (based on the messagePlatform in the value field) */
  messagePlatform?: Maybe<MessagePlatform>;
  /** messagePlatform of the link used for chat */
  value?: Maybe<Scalars['String']['output']>;
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

export type CloudflareImage = {
  __typename?: 'CloudflareImage';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  uploadUrl?: Maybe<Scalars['String']['output']>;
  userId: Scalars['ID']['output'];
};

export type CloudflareVideo = {
  __typename?: 'CloudflareVideo';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  readyToStream: Scalars['Boolean']['output'];
  uploadUrl?: Maybe<Scalars['String']['output']>;
  userId: Scalars['ID']['output'];
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
  speakers: Scalars['Int']['output'];
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
  apexName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  journeyCollection?: Maybe<JourneyCollection>;
  name: Scalars['String']['output'];
  routeAllTeamJourneys: Scalars['Boolean']['output'];
  team: Team;
};

export type CustomDomainCheck = {
  __typename?: 'CustomDomainCheck';
  /**
   * Is the domain correctly configured in the DNS?
   * If false, A Record and CNAME Record should be added by the user.
   */
  configured: Scalars['Boolean']['output'];
  /** Verification records to be added to the DNS to confirm ownership. */
  verification?: Maybe<Array<CustomDomainVerification>>;
  /** Reasoning as to why verification is required. */
  verificationResponse?: Maybe<CustomDomainVerificationResponse>;
  /**
   * Does the domain belong to the team?
   * If false, verification and verificationResponse will be populated.
   */
  verified: Scalars['Boolean']['output'];
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

export type CustomDomainVerification = {
  __typename?: 'CustomDomainVerification';
  domain: Scalars['String']['output'];
  reason: Scalars['String']['output'];
  type: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type CustomDomainVerificationResponse = {
  __typename?: 'CustomDomainVerificationResponse';
  code: Scalars['String']['output'];
  message: Scalars['String']['output'];
};

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
  parentBlock: Block;
  parentBlockId: Scalars['ID']['output'];
};

export type EmailActionInput = {
  email: Scalars['String']['input'];
  gtmEventName?: InputMaybe<Scalars['String']['input']>;
};

export type Error = {
  __typename?: 'Error';
  message: Scalars['String']['output'];
};

export type Event = {
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  journeyId: Scalars['ID']['output'];
  label?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

export type FormBlock = Block & {
  __typename?: 'FormBlock';
  action?: Maybe<Action>;
  apiTokenExists: Scalars['Boolean']['output'];
  form?: Maybe<Scalars['Json']['output']>;
  formSlug?: Maybe<Scalars['String']['output']>;
  forms: Array<FormiumForm>;
  id: Scalars['ID']['output'];
  journeyId: Scalars['ID']['output'];
  parentBlockId?: Maybe<Scalars['ID']['output']>;
  parentOrder?: Maybe<Scalars['Int']['output']>;
  projectId?: Maybe<Scalars['String']['output']>;
  projects: Array<FormiumProject>;
};

export type FormBlockCreateInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  journeyId: Scalars['ID']['input'];
  parentBlockId: Scalars['ID']['input'];
};

export type FormBlockUpdateInput = {
  apiToken?: InputMaybe<Scalars['String']['input']>;
  formSlug?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['String']['input']>;
};

export type FormiumForm = {
  __typename?: 'FormiumForm';
  /** The name of the form */
  name: Scalars['String']['output'];
  /** The formSlug of the form */
  slug: Scalars['String']['output'];
};

export type FormiumProject = {
  __typename?: 'FormiumProject';
  /** The projectId of the project */
  id: Scalars['String']['output'];
  /** The name of the project */
  name: Scalars['String']['output'];
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
  id: Scalars['ID']['output'];
  journeyId: Scalars['ID']['output'];
  justifyContent: GridJustifyContent;
  parentBlockId?: Maybe<Scalars['ID']['output']>;
  parentOrder?: Maybe<Scalars['Int']['output']>;
  spacing: Scalars['Int']['output'];
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

export enum GridJustifyContent {
  Center = 'center',
  FlexEnd = 'flexEnd',
  FlexStart = 'flexStart'
}

export type Host = {
  __typename?: 'Host';
  id: Scalars['ID']['output'];
  location?: Maybe<Scalars['String']['output']>;
  src1?: Maybe<Scalars['String']['output']>;
  src2?: Maybe<Scalars['String']['output']>;
  teamId: Scalars['ID']['output'];
  title: Scalars['String']['output'];
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

export type ImageBlock = Block & {
  __typename?: 'ImageBlock';
  alt: Scalars['String']['output'];
  /**
   * blurhash is a compact representation of a placeholder for an image.
   * Find a frontend implementation at https://github.com/woltapp/blurhash
   */
  blurhash: Scalars['String']['output'];
  height: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  journeyId: Scalars['ID']['output'];
  parentBlockId?: Maybe<Scalars['ID']['output']>;
  parentOrder?: Maybe<Scalars['Int']['output']>;
  src?: Maybe<Scalars['String']['output']>;
  width: Scalars['Int']['output'];
};

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
  src?: InputMaybe<Scalars['String']['input']>;
  width?: InputMaybe<Scalars['Int']['input']>;
};

export type ImageBlockUpdateInput = {
  alt?: InputMaybe<Scalars['String']['input']>;
  /** If blurhash, width, & height are provided, the image will skip blurhash processing. Otherwise these values will be calculated. */
  blurhash?: InputMaybe<Scalars['String']['input']>;
  height?: InputMaybe<Scalars['Int']['input']>;
  parentBlockId?: InputMaybe<Scalars['ID']['input']>;
  src?: InputMaybe<Scalars['String']['input']>;
  width?: InputMaybe<Scalars['Int']['input']>;
};

export type Integration = {
  id: Scalars['ID']['output'];
  team: Team;
  type: IntegrationType;
};

export type IntegrationGrowthSpaces = Integration & {
  __typename?: 'IntegrationGrowthSpaces';
  accessId: Scalars['String']['output'];
  accessSecretPart: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  routes: Array<IntegrationGrowthSpacesRoute>;
  team: Team;
  type: IntegrationType;
};

export type IntegrationGrowthSpacesCreateInput = {
  accessId: Scalars['String']['input'];
  accessSecret: Scalars['String']['input'];
  teamId: Scalars['String']['input'];
};

export type IntegrationGrowthSpacesRoute = {
  __typename?: 'IntegrationGrowthSpacesRoute';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
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
  chatButtons: Array<ChatButton>;
  createdAt: Scalars['DateTime']['output'];
  creatorDescription?: Maybe<Scalars['String']['output']>;
  creatorImageBlock?: Maybe<ImageBlock>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  featuredAt?: Maybe<Scalars['DateTime']['output']>;
  host?: Maybe<Host>;
  id: Scalars['ID']['output'];
  journeyCollections: Array<JourneyCollection>;
  language: Language;
  /** used in a plausible share link to embed report */
  plausibleToken?: Maybe<Scalars['String']['output']>;
  primaryImageBlock?: Maybe<ImageBlock>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  seoDescription?: Maybe<Scalars['String']['output']>;
  seoTitle?: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  status: JourneyStatus;
  strategySlug?: Maybe<Scalars['String']['output']>;
  tags: Array<Tag>;
  team?: Maybe<Team>;
  template?: Maybe<Scalars['Boolean']['output']>;
  themeMode: ThemeMode;
  themeName: ThemeName;
  title: Scalars['String']['output'];
  trashedAt?: Maybe<Scalars['DateTime']['output']>;
  userJourneys?: Maybe<Array<UserJourney>>;
};

export type JourneyCollection = {
  __typename?: 'JourneyCollection';
  customDomains?: Maybe<Array<CustomDomain>>;
  id: Scalars['ID']['output'];
  journeys?: Maybe<Array<Journey>>;
  team: Team;
  title?: Maybe<Scalars['String']['output']>;
};

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

export type JourneyNotification = {
  __typename?: 'JourneyNotification';
  id: Scalars['ID']['output'];
  journeyId: Scalars['ID']['output'];
  userId: Scalars['ID']['output'];
  userJourneyId?: Maybe<Scalars['ID']['output']>;
  userTeamId?: Maybe<Scalars['ID']['output']>;
  visitorInteractionEmail: Scalars['Boolean']['output'];
};

export type JourneyNotificationUpdateInput = {
  journeyId: Scalars['ID']['input'];
  visitorInteractionEmail: Scalars['Boolean']['input'];
};

export type JourneyProfile = {
  __typename?: 'JourneyProfile';
  acceptedTermsAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  journeyFlowBackButtonClicked?: Maybe<Scalars['Boolean']['output']>;
  lastActiveTeamId?: Maybe<Scalars['String']['output']>;
  onboardingFormCompletedAt?: Maybe<Scalars['DateTime']['output']>;
  userId: Scalars['ID']['output'];
};

export type JourneyProfileUpdateInput = {
  journeyFlowBackButtonClicked?: InputMaybe<Scalars['Boolean']['input']>;
  lastActiveTeamId?: InputMaybe<Scalars['String']['input']>;
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
  hostId?: InputMaybe<Scalars['String']['input']>;
  languageId?: InputMaybe<Scalars['String']['input']>;
  primaryImageBlockId?: InputMaybe<Scalars['ID']['input']>;
  seoDescription?: InputMaybe<Scalars['String']['input']>;
  seoTitle?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  strategySlug?: InputMaybe<Scalars['String']['input']>;
  tagIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  themeMode?: InputMaybe<ThemeMode>;
  themeName?: InputMaybe<ThemeName>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type JourneyViewEvent = Event & {
  __typename?: 'JourneyViewEvent';
  /** time event was created */
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  /** ID of the journey being viewed */
  journeyId: Scalars['ID']['output'];
  /** title of the journey being viewed */
  label?: Maybe<Scalars['String']['output']>;
  /** language of the journey being viewed (based on the ID in the value field) */
  language?: Maybe<Language>;
  /** languageId of the journey being viewed */
  value?: Maybe<Scalars['String']['output']>;
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

export type JourneyVisitor = {
  __typename?: 'JourneyVisitor';
  /**
   * The country code of the visitor as poulated by visitor ip address detected in
   * the JourneyViewEventCreate mutation. This field country code is converted
   * from an IP address by the @maxmind/geoip2-node library. If this field is empty
   * it is likely that the JourneyViewEventCreate mutation was not called by the
   * visitor or that the country was not able to be determined based on the
   * visitor IP address.
   */
  countryCode?: Maybe<Scalars['String']['output']>;
  /**
   * The time when the visitor created their first event on a journey connected
   * to the requested team.
   */
  createdAt: Scalars['DateTime']['output'];
  /** Duration between createdAt and lastStepViewedAt in seconds */
  duration?: Maybe<Scalars['Int']['output']>;
  events: Array<Event>;
  journeyId: Scalars['ID']['output'];
  /**
   * The last message platform the visitor called the ButtonClickEvent where the
   * url is in the format of a recognized chat platform
   */
  lastChatPlatform?: Maybe<MessagePlatform>;
  /**
   * The last time the visitor called the ButtonClickEvent mutation where the url
   * is in the format of a recognized chat platform.
   */
  lastChatStartedAt?: Maybe<Scalars['DateTime']['output']>;
  /**
   * The label of a link action button of the last time the visitor clicked a
   * link action button. Populated by ButtonClickEvent
   */
  lastLinkAction?: Maybe<Scalars['String']['output']>;
  /**
   * The selected option  of the last radio option the visitor filled out,
   * populated by RadioQuestionSubmission mutation
   */
  lastRadioOptionSubmission?: Maybe<Scalars['String']['output']>;
  /**
   * The question of the last radio option the visitor filled out,
   * populated by RadioQuestionSubmission mutation
   */
  lastRadioQuestion?: Maybe<Scalars['String']['output']>;
  /**
   * The last time the visitor called StepViewEvent mutation. It is populated when
   * the visitor is first created, and is updated by all event creation mutations.
   */
  lastStepViewedAt?: Maybe<Scalars['DateTime']['output']>;
  /**
   * The response of the last text response block the visitor filled out,
   * populated by TextResponseSubmission mutation
   */
  lastTextResponse?: Maybe<Scalars['String']['output']>;
  /**
   * Message platform the visitor wishes to be connected to us on as populated by
   * VisitorUpdate mutation or ChatOpenEventCreate mutation.
   */
  messagePlatform?: Maybe<MessagePlatform>;
  /**
   * ID of the visitor as set by VisitorUpdate mutation. This could be a phone
   * number, user id or other unique identifier provided by the message platform.
   */
  notes?: Maybe<Scalars['String']['output']>;
  visitor: Visitor;
  visitorId: Scalars['ID']['output'];
};

export type JourneyVisitorEdge = {
  __typename?: 'JourneyVisitorEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: JourneyVisitor;
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

export type JourneyVisitorsConnection = {
  __typename?: 'JourneyVisitorsConnection';
  /** A list of edges. */
  edges: Array<JourneyVisitorEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

export type JourneysEmailPreference = {
  __typename?: 'JourneysEmailPreference';
  accountNotifications: Scalars['Boolean']['output'];
  email: Scalars['String']['output'];
  unsubscribeAll: Scalars['Boolean']['output'];
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

export type Language = {
  __typename?: 'Language';
  audioPreview?: Maybe<AudioPreview>;
  bcp47?: Maybe<Scalars['String']['output']>;
  countryLanguages: Array<CountryLanguage>;
  id: Scalars['ID']['output'];
  iso3?: Maybe<Scalars['String']['output']>;
  name: Array<LanguageName>;
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

export type LanguageWithSlug = {
  __typename?: 'LanguageWithSlug';
  language?: Maybe<Language>;
  slug?: Maybe<Scalars['String']['output']>;
};

export type LanguagesFilter = {
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type LinkAction = Action & {
  __typename?: 'LinkAction';
  gtmEventName?: Maybe<Scalars['String']['output']>;
  parentBlock: Block;
  parentBlockId: Scalars['ID']['output'];
  target?: Maybe<Scalars['String']['output']>;
  url: Scalars['String']['output'];
};

export type LinkActionInput = {
  gtmEventName?: InputMaybe<Scalars['String']['input']>;
  target?: InputMaybe<Scalars['String']['input']>;
  url: Scalars['String']['input'];
};

export type MeInput = {
  redirect?: InputMaybe<Scalars['String']['input']>;
};

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

export type Mutation = {
  __typename?: 'Mutation';
  /** blockDelete returns the updated sibling blocks on successful delete */
  blockDelete: Array<Block>;
  blockDeleteAction: Block;
  /** blockDuplicate returns the updated block, it's children and sibling blocks on successful duplicate */
  blockDuplicate: Array<Block>;
  blockOrderUpdate: Array<Block>;
  /** blockRestore is used for redo/undo */
  blockRestore: Array<Block>;
  blockUpdateAction: Action;
  blockUpdateEmailAction: EmailAction;
  blockUpdateLinkAction: LinkAction;
  blockUpdateNavigateToBlockAction: NavigateToBlockAction;
  buttonBlockCreate: ButtonBlock;
  buttonBlockUpdate?: Maybe<ButtonBlock>;
  buttonClickEventCreate: ButtonClickEvent;
  cardBlockCreate: CardBlock;
  cardBlockUpdate: CardBlock;
  chatButtonCreate: ChatButton;
  chatButtonRemove: ChatButton;
  chatButtonUpdate: ChatButton;
  chatOpenEventCreate: ChatOpenEvent;
  cloudflareUploadComplete?: Maybe<Scalars['Boolean']['output']>;
  createCloudflareUploadByFile?: Maybe<CloudflareImage>;
  createCloudflareUploadByUrl?: Maybe<CloudflareImage>;
  createCloudflareVideoUploadByFile?: Maybe<CloudflareVideo>;
  createCloudflareVideoUploadByUrl?: Maybe<CloudflareVideo>;
  createImageBySegmindPrompt?: Maybe<CloudflareImage>;
  createVerificationRequest?: Maybe<Scalars['Boolean']['output']>;
  customDomainCheck: CustomDomainCheck;
  customDomainCreate: CustomDomain;
  customDomainDelete: CustomDomain;
  customDomainUpdate: CustomDomain;
  deleteCloudflareImage?: Maybe<Scalars['Boolean']['output']>;
  deleteCloudflareVideo?: Maybe<Scalars['Boolean']['output']>;
  formBlockCreate: FormBlock;
  formBlockUpdate?: Maybe<FormBlock>;
  hostCreate: Host;
  hostDelete: Host;
  hostUpdate: Host;
  iconBlockCreate: IconBlock;
  iconBlockUpdate: IconBlock;
  imageBlockCreate: ImageBlock;
  imageBlockUpdate: ImageBlock;
  integrationDelete: Integration;
  integrationGrowthSpacesCreate: IntegrationGrowthSpaces;
  integrationGrowthSpacesUpdate: IntegrationGrowthSpaces;
  journeyCollectionCreate: JourneyCollection;
  journeyCollectionDelete: JourneyCollection;
  journeyCollectionUpdate: JourneyCollection;
  journeyCreate: Journey;
  journeyDuplicate: Journey;
  /** Sets journey status to featured */
  journeyFeature?: Maybe<Journey>;
  journeyNotificationUpdate: JourneyNotification;
  journeyProfileCreate: JourneyProfile;
  journeyProfileOnboardingFormComplete: JourneyProfile;
  journeyProfileUpdate: JourneyProfile;
  /** Sets journey status to published */
  journeyPublish?: Maybe<Journey>;
  /** Updates template */
  journeyTemplate: Journey;
  journeyUpdate: Journey;
  journeyViewEventCreate: JourneyViewEvent;
  /** Sets journeys statuses to archived */
  journeysArchive?: Maybe<Array<Maybe<Journey>>>;
  /** Sets journeys statuses to deleted */
  journeysDelete?: Maybe<Array<Maybe<Journey>>>;
  /** Sets journeys statuses to last active status */
  journeysRestore?: Maybe<Array<Maybe<Journey>>>;
  /** Sets journeys statuses to trashed */
  journeysTrash?: Maybe<Array<Maybe<Journey>>>;
  radioOptionBlockCreate: RadioOptionBlock;
  radioOptionBlockUpdate: RadioOptionBlock;
  radioQuestionBlockCreate: RadioQuestionBlock;
  radioQuestionBlockUpdate: RadioQuestionBlock;
  radioQuestionSubmissionEventCreate: RadioQuestionSubmissionEvent;
  signUpBlockCreate: SignUpBlock;
  signUpBlockUpdate?: Maybe<SignUpBlock>;
  signUpSubmissionEventCreate: SignUpSubmissionEvent;
  siteCreate: MutationSiteCreateResult;
  stepBlockCreate: StepBlock;
  stepBlockUpdate: StepBlock;
  stepNextEventCreate: StepNextEvent;
  stepPreviousEventCreate: StepPreviousEvent;
  stepViewEventCreate: StepViewEvent;
  teamCreate: Team;
  teamUpdate: Team;
  textResponseBlockCreate: TextResponseBlock;
  textResponseBlockUpdate?: Maybe<TextResponseBlock>;
  textResponseSubmissionEventCreate: TextResponseSubmissionEvent;
  triggerUnsplashDownload?: Maybe<Scalars['Boolean']['output']>;
  typographyBlockCreate: TypographyBlock;
  typographyBlockUpdate: TypographyBlock;
  updateJourneysEmailPreference?: Maybe<JourneysEmailPreference>;
  userImpersonate?: Maybe<Scalars['String']['output']>;
  userInviteAcceptAll: Array<UserInvite>;
  userInviteCreate?: Maybe<UserInvite>;
  userInviteRemove: UserInvite;
  userJourneyApprove: UserJourney;
  userJourneyOpen?: Maybe<UserJourney>;
  userJourneyPromote: UserJourney;
  userJourneyRemove: UserJourney;
  /** Removes all userJourneys associated with a journeyId */
  userJourneyRemoveAll: Array<UserJourney>;
  userJourneyRequest: UserJourney;
  userTeamDelete: UserTeam;
  userTeamInviteAcceptAll: Array<UserTeamInvite>;
  userTeamInviteCreate?: Maybe<UserTeamInvite>;
  userTeamInviteRemove: UserTeamInvite;
  userTeamUpdate: UserTeam;
  validateEmail?: Maybe<User>;
  videoBlockCreate: VideoBlock;
  videoBlockUpdate: VideoBlock;
  videoCollapseEventCreate: VideoCollapseEvent;
  videoCompleteEventCreate: VideoCompleteEvent;
  videoExpandEventCreate: VideoExpandEvent;
  videoPauseEventCreate: VideoPauseEvent;
  videoPlayEventCreate: VideoPlayEvent;
  videoProgressEventCreate: VideoProgressEvent;
  videoStartEventCreate: VideoStartEvent;
  /** Update a visitor */
  visitorUpdate: Visitor;
  /** Allow current user to update specific allowable fields of their visitor record */
  visitorUpdateForCurrentUser: Visitor;
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
  input?: InputMaybe<BlockUpdateActionInput>;
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
  input?: InputMaybe<ChatButtonCreateInput>;
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


export type MutationCloudflareUploadCompleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationCreateCloudflareUploadByUrlArgs = {
  url: Scalars['String']['input'];
};


export type MutationCreateCloudflareVideoUploadByFileArgs = {
  name: Scalars['String']['input'];
  uploadLength: Scalars['Int']['input'];
};


export type MutationCreateCloudflareVideoUploadByUrlArgs = {
  url: Scalars['String']['input'];
};


export type MutationCreateImageBySegmindPromptArgs = {
  model: SegmindModel;
  prompt: Scalars['String']['input'];
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


export type MutationDeleteCloudflareVideoArgs = {
  id: Scalars['ID']['input'];
};


export type MutationFormBlockCreateArgs = {
  input: FormBlockCreateInput;
};


export type MutationFormBlockUpdateArgs = {
  id: Scalars['ID']['input'];
  input: FormBlockUpdateInput;
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


export type MutationJourneyNotificationUpdateArgs = {
  input: JourneyNotificationUpdateInput;
};


export type MutationJourneyProfileUpdateArgs = {
  input: JourneyProfileUpdateInput;
};


export type MutationJourneyPublishArgs = {
  id: Scalars['ID']['input'];
};


export type MutationJourneyTemplateArgs = {
  id: Scalars['ID']['input'];
  input: JourneyTemplateInput;
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
  journeyId?: InputMaybe<Scalars['ID']['input']>;
  parentBlockId: Scalars['ID']['input'];
};


export type MutationRadioQuestionSubmissionEventCreateArgs = {
  input: RadioQuestionSubmissionEventCreateInput;
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


export type MutationStepBlockCreateArgs = {
  input: StepBlockCreateInput;
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
  input?: InputMaybe<TeamCreateInput>;
};


export type MutationTeamUpdateArgs = {
  id: Scalars['ID']['input'];
  input?: InputMaybe<TeamUpdateInput>;
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
  input?: InputMaybe<UserInviteCreateInput>;
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
  idType?: InputMaybe<IdType>;
  journeyId: Scalars['ID']['input'];
};


export type MutationUserTeamDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUserTeamInviteCreateArgs = {
  input?: InputMaybe<UserTeamInviteCreateInput>;
  teamId: Scalars['ID']['input'];
};


export type MutationUserTeamInviteRemoveArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUserTeamUpdateArgs = {
  id: Scalars['ID']['input'];
  input?: InputMaybe<UserTeamUpdateInput>;
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


export type MutationVideoExpandEventCreateArgs = {
  input: VideoExpandEventCreateInput;
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


export type MutationVideoStartEventCreateArgs = {
  input: VideoStartEventCreateInput;
};


export type MutationVisitorUpdateArgs = {
  id: Scalars['ID']['input'];
  input: VisitorUpdateInput;
};


export type MutationVisitorUpdateForCurrentUserArgs = {
  input: VisitorUpdateInput;
};

export type MutationSiteCreateResult = Error | MutationSiteCreateSuccess;

export type MutationSiteCreateSuccess = {
  __typename?: 'MutationSiteCreateSuccess';
  data: Site;
};

export type NavigateToBlockAction = Action & {
  __typename?: 'NavigateToBlockAction';
  blockId: Scalars['String']['output'];
  gtmEventName?: Maybe<Scalars['String']['output']>;
  parentBlock: Block;
  parentBlockId: Scalars['ID']['output'];
};

export type NavigateToBlockActionInput = {
  blockId: Scalars['String']['input'];
  gtmEventName?: InputMaybe<Scalars['String']['input']>;
};

export type OperatingSystem = {
  __typename?: 'OperatingSystem';
  name?: Maybe<Scalars['String']['output']>;
  version?: Maybe<Scalars['String']['output']>;
};

/** Information about pagination in a connection. */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']['output']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean']['output'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']['output']>;
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

export type PlausibleStatsAggregateResponse = {
  __typename?: 'PlausibleStatsAggregateResponse';
  /** Bounce rate percentage. */
  bounceRate?: Maybe<PlausibleStatsAggregateValue>;
  /**
   * The percentage of visitors who completed the goal. Requires an `event:goal`
   * filter or `event:goal` property in the breakdown endpoint
   */
  conversionRate?: Maybe<PlausibleStatsAggregateValue>;
  /**
   * The number of events (pageviews + custom events). When filtering by a goal,
   *  this metric corresponds to "Total Conversions" in the dashboard.
   */
  events?: Maybe<PlausibleStatsAggregateValue>;
  /** The number of pageview events. */
  pageviews?: Maybe<PlausibleStatsAggregateValue>;
  /**
   * The average time users spend on viewing a single page. Requires an
   * `event:page` filter or `event:page` property in the breakdown endpoint.
   */
  timeOnPage?: Maybe<PlausibleStatsAggregateValue>;
  /**
   * The number of pageviews divided by the number of visits.
   * Returns a floating point number. Currently only supported in Aggregate and
   * Timeseries endpoints.
   */
  viewsPerVisit?: Maybe<PlausibleStatsAggregateValue>;
  /** Visit duration in seconds. */
  visitDuration?: Maybe<PlausibleStatsAggregateValue>;
  /** The number of unique visitors. */
  visitors?: Maybe<PlausibleStatsAggregateValue>;
  /** The number of visits/sessions. */
  visits?: Maybe<PlausibleStatsAggregateValue>;
};

export type PlausibleStatsAggregateValue = {
  __typename?: 'PlausibleStatsAggregateValue';
  change?: Maybe<Scalars['Int']['output']>;
  value: Scalars['Float']['output'];
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

export type PlausibleStatsResponse = {
  __typename?: 'PlausibleStatsResponse';
  /** Bounce rate percentage. */
  bounceRate?: Maybe<Scalars['Int']['output']>;
  /**
   * The percentage of visitors who completed the goal. Requires an `event:goal`
   * filter or `event:goal` property in the breakdown endpoint
   */
  conversionRate?: Maybe<Scalars['Int']['output']>;
  /**
   * The number of events (pageviews + custom events). When filtering by a goal,
   *  this metric corresponds to "Total Conversions" in the dashboard.
   */
  events?: Maybe<Scalars['Int']['output']>;
  /** The number of pageview events. */
  pageviews?: Maybe<Scalars['Int']['output']>;
  /**
   * On breakdown queries, this is the property that was broken down by.
   * On aggregate queries, this is the date the stats are for.
   */
  property: Scalars['String']['output'];
  /**
   * The average time users spend on viewing a single page. Requires an
   * `event:page` filter or `event:page` property in the breakdown endpoint.
   */
  timeOnPage?: Maybe<Scalars['Float']['output']>;
  /**
   * The number of pageviews divided by the number of visits.
   * Returns a floating point number. Currently only supported in Aggregate and
   * Timeseries endpoints.
   */
  viewsPerVisit?: Maybe<Scalars['Float']['output']>;
  /** Visit duration in seconds. */
  visitDuration?: Maybe<Scalars['Int']['output']>;
  /** The number of unique visitors. */
  visitors?: Maybe<Scalars['Int']['output']>;
  /** The number of visits/sessions. */
  visits?: Maybe<Scalars['Int']['output']>;
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

export type PowerBiEmbed = {
  __typename?: 'PowerBiEmbed';
  /** The embed token */
  accessToken: Scalars['String']['output'];
  /** The embed URL of the report */
  embedUrl: Scalars['String']['output'];
  /** The date and time (UTC) of token expiration */
  expiration: Scalars['String']['output'];
  /** The report ID */
  reportId: Scalars['String']['output'];
  /** The name of the report */
  reportName: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  adminJourney: Journey;
  /**
   * returns all journeys that match the provided filters
   * If no team id is provided and template is not true then only returns journeys
   * where the user is not a member of a team but is an editor or owner of the
   * journey
   */
  adminJourneys: Array<Journey>;
  adminJourneysReport?: Maybe<PowerBiEmbed>;
  block: Block;
  blocks: Array<Block>;
  countries: Array<Country>;
  country?: Maybe<Country>;
  customDomain: CustomDomain;
  customDomains: Array<CustomDomain>;
  getJourneyProfile?: Maybe<JourneyProfile>;
  getMyCloudflareImages?: Maybe<Array<Maybe<CloudflareImage>>>;
  getMyCloudflareVideo?: Maybe<CloudflareVideo>;
  getMyCloudflareVideos?: Maybe<Array<Maybe<CloudflareVideo>>>;
  getUserRole?: Maybe<UserRole>;
  hosts: Array<Host>;
  integrations: Array<Integration>;
  journey: Journey;
  journeyCollection: JourneyCollection;
  journeyCollections: Array<Maybe<JourneyCollection>>;
  /** Get a JourneyVisitor count by JourneyVisitorFilter */
  journeyVisitorCount: Scalars['Int']['output'];
  /** Get a list of Visitor Information by Journey */
  journeyVisitorsConnection: JourneyVisitorsConnection;
  journeys: Array<Journey>;
  journeysEmailPreference?: Maybe<JourneysEmailPreference>;
  journeysPlausibleStatsAggregate: PlausibleStatsAggregateResponse;
  /**
   * This endpoint allows you to break down your stats by some property.
   * If you are familiar with SQL family databases, this endpoint corresponds to
   * running `GROUP BY` on a certain property in your stats, then ordering by the
   * count.
   * Check out the [properties](https://plausible.io/docs/stats-api#properties)
   * section for a reference of all the properties you can use in this query.
   * This endpoint can be used to fetch data for `Top sources`, `Top pages`,
   * `Top countries` and similar reports.
   * Currently, it is only possible to break down on one property at a time.
   * Using a list of properties with one query is not supported. So if you want
   * a breakdown by both `event:page` and `visit:source` for example, you would
   * have to make multiple queries (break down on one property and filter on
   * another) and then manually/programmatically group the results together in one
   * report. This also applies for breaking down by time periods. To get a daily
   * breakdown for every page, you would have to break down on `event:page` and
   * make multiple queries for each date.
   */
  journeysPlausibleStatsBreakdown: Array<PlausibleStatsResponse>;
  journeysPlausibleStatsRealtimeVisitors: Scalars['Int']['output'];
  /**
   * This endpoint provides timeseries data over a certain time period.
   * If you are familiar with the Plausible dashboard, this endpoint
   * corresponds to the main visitor graph.
   */
  journeysPlausibleStatsTimeseries: Array<PlausibleStatsResponse>;
  language?: Maybe<Language>;
  languages: Array<Language>;
  listUnsplashCollectionPhotos: Array<UnsplashPhoto>;
  me?: Maybe<User>;
  searchUnsplashPhotos: UnsplashQueryResponse;
  tags: Array<Tag>;
  team: Team;
  teams: Array<Team>;
  user?: Maybe<User>;
  userByEmail?: Maybe<User>;
  userInvites?: Maybe<Array<UserInvite>>;
  userTeam: UserTeam;
  userTeamInvites: Array<UserTeamInvite>;
  userTeams: Array<UserTeam>;
  video?: Maybe<Video>;
  videos: Array<Video>;
  /** Get a single visitor */
  visitor: Visitor;
  /** A list of visitors that are connected with a specific team. */
  visitorsConnection: VisitorsConnection;
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


export type QueryBlockArgs = {
  id: Scalars['ID']['input'];
};


export type QueryBlocksArgs = {
  where?: InputMaybe<BlocksFilter>;
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


export type QueryGetMyCloudflareVideoArgs = {
  id: Scalars['ID']['input'];
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


export type QueryJourneyVisitorCountArgs = {
  filter: JourneyVisitorFilter;
};


export type QueryJourneyVisitorsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filter: JourneyVisitorFilter;
  first?: InputMaybe<Scalars['Int']['input']>;
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


export type QuerySearchUnsplashPhotosArgs = {
  collections?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  color?: InputMaybe<UnsplashColor>;
  contentFilter?: InputMaybe<UnsplashContentFilter>;
  orderBy?: InputMaybe<UnsplashOrderBy>;
  orientation?: InputMaybe<UnsplashPhotoOrientation>;
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
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


export type QueryVideosArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<VideosFilter>;
};


export type QueryVisitorArgs = {
  id: Scalars['ID']['input'];
};


export type QueryVisitorsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  teamId?: InputMaybe<Scalars['String']['input']>;
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

export type RadioQuestionSubmissionEvent = Event & {
  __typename?: 'RadioQuestionSubmissionEvent';
  /** time event was created */
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  /** ID of the journey that the radioQuestionBlock belongs to */
  journeyId: Scalars['ID']['output'];
  /** stepName of the parent stepBlock */
  label?: Maybe<Scalars['String']['output']>;
  /** label of the selected radioOptionBlock */
  value?: Maybe<Scalars['String']['output']>;
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
  /** time event was created */
  createdAt: Scalars['DateTime']['output'];
  /** email from the signUpBlock form */
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  /** ID of the journey that the block belongs to */
  journeyId: Scalars['ID']['output'];
  /** null for signUpSubmissionEvent */
  label?: Maybe<Scalars['String']['output']>;
  /** name from the signUpBlock form */
  value?: Maybe<Scalars['String']['output']>;
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

export type StepBlockUpdateInput = {
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

export type StepNextEvent = Event & {
  __typename?: 'StepNextEvent';
  /** time event was created */
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  /** ID of the journey that the stepBlock belongs to */
  journeyId: Scalars['ID']['output'];
  /** stepName of the stepBlock */
  label?: Maybe<Scalars['String']['output']>;
  /** stepName of the next stepBlock */
  value?: Maybe<Scalars['String']['output']>;
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

export type StepPreviousEvent = Event & {
  __typename?: 'StepPreviousEvent';
  /** time event was created */
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  /** ID of the journey that the stepBlock belongs to */
  journeyId: Scalars['ID']['output'];
  /** stepName of the current stepBlock */
  label?: Maybe<Scalars['String']['output']>;
  /** stepName of the previous stepBlock */
  value?: Maybe<Scalars['String']['output']>;
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

export type StepViewEvent = Event & {
  __typename?: 'StepViewEvent';
  /** time event was created */
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  /** ID of the journey that the stepBlock belongs to */
  journeyId: Scalars['ID']['output'];
  /** null for stepViewEvent */
  label?: Maybe<Scalars['String']['output']>;
  /** stepName of the stepBlock */
  value?: Maybe<Scalars['String']['output']>;
};

export type StepViewEventCreateInput = {
  /** Id of the current StepBlock */
  blockId: Scalars['ID']['input'];
  /** ID should be unique Event UUID (Provided for optimistic mutation result matching) */
  id?: InputMaybe<Scalars['ID']['input']>;
  /** stepName of the current stepBlock */
  value?: InputMaybe<Scalars['String']['input']>;
};

export type Tag = {
  __typename?: 'Tag';
  id: Scalars['ID']['output'];
  name: Array<Translation>;
  parentId?: Maybe<Scalars['ID']['output']>;
  service?: Maybe<Service>;
};

export type Team = {
  __typename?: 'Team';
  createdAt: Scalars['DateTime']['output'];
  customDomains: Array<CustomDomain>;
  id: Scalars['ID']['output'];
  integrations: Array<Integration>;
  publicTitle?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userTeams: Array<UserTeam>;
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
  routeId?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<TextResponseType>;
};

export type TextResponseSubmissionEvent = Event & {
  __typename?: 'TextResponseSubmissionEvent';
  /** the id of the block this event originates from */
  blockId?: Maybe<Scalars['String']['output']>;
  /** time event was created */
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  /** ID of the journey that the buttonBlock belongs to */
  journeyId: Scalars['ID']['output'];
  /** stepName of the parent stepBlock */
  label?: Maybe<Scalars['String']['output']>;
  /** response from the TextResponseBlock form */
  value?: Maybe<Scalars['String']['output']>;
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

export type Translation = {
  __typename?: 'Translation';
  language: Language;
  primary: Scalars['Boolean']['output'];
  value: Scalars['String']['output'];
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
  variant?: Maybe<TypographyVariant>;
};

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
  Latest = 'latest',
  Relevant = 'relevant'
}

export type UnsplashPhoto = {
  __typename?: 'UnsplashPhoto';
  alt_description?: Maybe<Scalars['String']['output']>;
  blur_hash: Scalars['String']['output'];
  categories?: Maybe<Array<Scalars['String']['output']>>;
  color?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['String']['output'];
  current_user_collections: Array<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  height: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  liked_by_user: Scalars['Boolean']['output'];
  likes: Scalars['Int']['output'];
  links: UnsplashPhotoLinks;
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
  accepted_tos: Scalars['Boolean']['output'];
  bio?: Maybe<Scalars['String']['output']>;
  first_name?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  instagram_username?: Maybe<Scalars['String']['output']>;
  last_name?: Maybe<Scalars['String']['output']>;
  links: UnsplashUserLinks;
  location?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  portfolio_url?: Maybe<Scalars['String']['output']>;
  profile_image?: Maybe<UnsplashUserImage>;
  total_collections: Scalars['Int']['output'];
  total_likes: Scalars['Int']['output'];
  total_photos: Scalars['Int']['output'];
  twitter_username?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['String']['output']>;
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
  lastName?: Maybe<Scalars['String']['output']>;
  superAdmin?: Maybe<Scalars['Boolean']['output']>;
};

/** These types are a subset provided by the @types/ua-parser-js library. */
export type UserAgent = {
  __typename?: 'UserAgent';
  browser: Browser;
  device: Device;
  os: OperatingSystem;
};

export type UserInvite = {
  __typename?: 'UserInvite';
  acceptedAt?: Maybe<Scalars['DateTime']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  journeyId: Scalars['ID']['output'];
  removedAt?: Maybe<Scalars['DateTime']['output']>;
  senderId: Scalars['ID']['output'];
};

export type UserInviteCreateInput = {
  email: Scalars['String']['input'];
};

export type UserJourney = {
  __typename?: 'UserJourney';
  id: Scalars['ID']['output'];
  journey?: Maybe<Journey>;
  journeyId: Scalars['ID']['output'];
  journeyNotification?: Maybe<JourneyNotification>;
  /** Date time of when the journey was first opened */
  openedAt?: Maybe<Scalars['DateTime']['output']>;
  role: UserJourneyRole;
  user?: Maybe<User>;
  userId: Scalars['ID']['output'];
};

export enum UserJourneyRole {
  Editor = 'editor',
  InviteRequested = 'inviteRequested',
  Owner = 'owner'
}

export type UserRole = {
  __typename?: 'UserRole';
  id: Scalars['ID']['output'];
  roles?: Maybe<Array<Role>>;
  userId: Scalars['ID']['output'];
};

export type UserTeam = {
  __typename?: 'UserTeam';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  journeyNotification?: Maybe<JourneyNotification>;
  role: UserTeamRole;
  updatedAt: Scalars['DateTime']['output'];
  user: User;
};


export type UserTeamJourneyNotificationArgs = {
  journeyId: Scalars['ID']['input'];
};

export type UserTeamFilterInput = {
  role?: InputMaybe<Array<UserTeamRole>>;
};

export type UserTeamInvite = {
  __typename?: 'UserTeamInvite';
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  teamId: Scalars['ID']['output'];
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
  bibleCitations: Array<BibleCitation>;
  children: Array<Video>;
  /** the number value of the amount of children on a video */
  childrenCount: Scalars['Int']['output'];
  description: Array<Translation>;
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  imageAlt: Array<Translation>;
  label: VideoLabel;
  noIndex?: Maybe<Scalars['Boolean']['output']>;
  primaryLanguageId: Scalars['ID']['output'];
  /** slug is a permanent link to the video. */
  slug: Scalars['String']['output'];
  snippet: Array<Translation>;
  studyQuestions: Array<Translation>;
  subtitles: Array<VideoSubtitle>;
  title: Array<Translation>;
  variant?: Maybe<VideoVariant>;
  variantLanguages: Array<Language>;
  variantLanguagesCount: Scalars['Int']['output'];
  variantLanguagesWithSlug: Array<LanguageWithSlug>;
};


export type VideoDescriptionArgs = {
  languageId?: InputMaybe<Scalars['ID']['input']>;
  primary?: InputMaybe<Scalars['Boolean']['input']>;
};


export type VideoImageAltArgs = {
  languageId?: InputMaybe<Scalars['ID']['input']>;
  primary?: InputMaybe<Scalars['Boolean']['input']>;
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

export type VideoBlock = Block & {
  __typename?: 'VideoBlock';
  /** action that should be performed when the video ends */
  action?: Maybe<Action>;
  autoplay?: Maybe<Scalars['Boolean']['output']>;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   */
  description?: Maybe<Scalars['String']['output']>;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   * duration in seconds.
   */
  duration?: Maybe<Scalars['Int']['output']>;
  /** endAt dictates at which point of time the video should end */
  endAt?: Maybe<Scalars['Int']['output']>;
  fullsize?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   */
  image?: Maybe<Scalars['String']['output']>;
  journeyId: Scalars['ID']['output'];
  muted?: Maybe<Scalars['Boolean']['output']>;
  /** how the video should display within the VideoBlock */
  objectFit?: Maybe<VideoBlockObjectFit>;
  parentBlockId?: Maybe<Scalars['ID']['output']>;
  parentOrder?: Maybe<Scalars['Int']['output']>;
  /**
   * posterBlockId is present if a child block should be used as a poster.
   * This child block should not be rendered normally, instead it should be used
   * as the video poster. PosterBlock should be of type ImageBlock.
   */
  posterBlockId?: Maybe<Scalars['ID']['output']>;
  /**
   * internal source: videoId, videoVariantLanguageId, and video present
   * youTube source: videoId, title, description, and duration present
   */
  source: VideoBlockSource;
  /** startAt dictates at which point of time the video should start playing */
  startAt?: Maybe<Scalars['Int']['output']>;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field.
   * For other sources this is automatically populated.
   */
  title?: Maybe<Scalars['String']['output']>;
  /**
   * internal source videos: video is only populated when videoID and
   * videoVariantLanguageId are present
   */
  video?: Maybe<Video>;
  /**
   * internal source videos: videoId and videoVariantLanguageId both need to be set
   * to select a video.
   * For other sources only videoId needs to be set.
   */
  videoId?: Maybe<Scalars['ID']['output']>;
  /**
   * internal source videos: videoId and videoVariantLanguageId both need to be set
   * to select a video.
   * For other sources only videoId needs to be set.
   */
  videoVariantLanguageId?: Maybe<Scalars['ID']['output']>;
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

export type VideoCollapseEvent = Event & {
  __typename?: 'VideoCollapseEvent';
  /** time event was created */
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  /** ID of the journey that the videoBlock belongs to */
  journeyId: Scalars['ID']['output'];
  /** title of the video */
  label?: Maybe<Scalars['String']['output']>;
  /** duration of the video played when the VideoCollapseEvent is triggered */
  position?: Maybe<Scalars['Float']['output']>;
  /** source of the video (based on the source in the value field) */
  source?: Maybe<VideoBlockSource>;
  /** source of the video */
  value?: Maybe<Scalars['String']['output']>;
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

export type VideoCompleteEvent = Event & {
  __typename?: 'VideoCompleteEvent';
  /** time event was created */
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  /** ID of the journey that the videoBlock belongs to */
  journeyId: Scalars['ID']['output'];
  /** title of the video */
  label?: Maybe<Scalars['String']['output']>;
  /** duration of the video played when the VideoCompleteEvent is triggered */
  position?: Maybe<Scalars['Float']['output']>;
  /** source of the video (based on the source in the value field) */
  source?: Maybe<VideoBlockSource>;
  /** source of the video */
  value?: Maybe<Scalars['String']['output']>;
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

export type VideoExpandEvent = Event & {
  __typename?: 'VideoExpandEvent';
  /** time event was created */
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  /** ID of the journey that the videoBlock belongs to */
  journeyId: Scalars['ID']['output'];
  /** title of the video */
  label?: Maybe<Scalars['String']['output']>;
  /** duration of the video played when the VideoExpandEvent is triggered */
  position?: Maybe<Scalars['Float']['output']>;
  /** source of the video (based on the source in the value field) */
  source?: Maybe<VideoBlockSource>;
  /** source of the video */
  value?: Maybe<Scalars['String']['output']>;
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

export type VideoPauseEvent = Event & {
  __typename?: 'VideoPauseEvent';
  /** time event was created */
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  /** ID of the journey that the videoBlock belongs to */
  journeyId: Scalars['ID']['output'];
  /** title of the video */
  label?: Maybe<Scalars['String']['output']>;
  /** duration of the video played when the VideoPauseEvent is triggered */
  position?: Maybe<Scalars['Float']['output']>;
  /** source of the video (based on the source in the value field) */
  source?: Maybe<VideoBlockSource>;
  /** source of the video */
  value?: Maybe<Scalars['String']['output']>;
};

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

export type VideoPlayEvent = Event & {
  __typename?: 'VideoPlayEvent';
  /** time event was created */
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  /** ID of the journey that the videoBlock belongs to */
  journeyId: Scalars['ID']['output'];
  /** title of the video */
  label?: Maybe<Scalars['String']['output']>;
  /** duration of the video played when the VideoPlayEvent is triggered */
  position?: Maybe<Scalars['Float']['output']>;
  /** source of the video (based on the source in the value field) */
  source?: Maybe<VideoBlockSource>;
  /** source of the video */
  value?: Maybe<Scalars['String']['output']>;
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

export type VideoProgressEvent = Event & {
  __typename?: 'VideoProgressEvent';
  /** time event was created */
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  /** ID of the journey that the videoBlock belongs to */
  journeyId: Scalars['ID']['output'];
  /** title of the video */
  label?: Maybe<Scalars['String']['output']>;
  /** duration of the video played when the VideoProgressEvent is triggered */
  position?: Maybe<Scalars['Float']['output']>;
  /** progress is a integer indicating the precentage completion from the startAt to the endAt times of the videoBlock */
  progress: Scalars['Int']['output'];
  /** source of the video (based on the source in the value field) */
  source?: Maybe<VideoBlockSource>;
  /** source of the video */
  value?: Maybe<Scalars['String']['output']>;
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

export type VideoStartEvent = Event & {
  __typename?: 'VideoStartEvent';
  /** time event was created */
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  /** ID of the journey that the videoBlock belongs to */
  journeyId: Scalars['ID']['output'];
  /** title of the video */
  label?: Maybe<Scalars['String']['output']>;
  /** duration of the video played when the VideoStartEvent is triggered */
  position?: Maybe<Scalars['Float']['output']>;
  /** source of the video (based on the source in the value field) */
  source?: Maybe<VideoBlockSource>;
  /** source of the video */
  value?: Maybe<Scalars['String']['output']>;
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

export type VideoSubtitle = {
  __typename?: 'VideoSubtitle';
  edition: Scalars['String']['output'];
  id: Scalars['String']['output'];
  languageId: Scalars['String']['output'];
  srtSrc?: Maybe<Scalars['String']['output']>;
  vttSrc?: Maybe<Scalars['String']['output']>;
};

/**
 * VideoTriggerBlock is a block that indicates the video to navigate
 * to the next block at the designated time.
 */
export type VideoTriggerBlock = Block & {
  __typename?: 'VideoTriggerBlock';
  action: Action;
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

export type VideoVariant = {
  __typename?: 'VideoVariant';
  downloads: Array<VideoVariantDownload>;
  duration: Scalars['Int']['output'];
  hls?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  language: Language;
  /** slug is a permanent link to the video variant. */
  slug: Scalars['String']['output'];
  subtitle: Array<Translation>;
  subtitleCount: Scalars['Int']['output'];
};


export type VideoVariantSubtitleArgs = {
  languageId?: InputMaybe<Scalars['ID']['input']>;
  primary?: InputMaybe<Scalars['Boolean']['input']>;
};

export type VideoVariantDownload = {
  __typename?: 'VideoVariantDownload';
  quality: VideoVariantDownloadQuality;
  size: Scalars['Float']['output'];
  url: Scalars['String']['output'];
};

export enum VideoVariantDownloadQuality {
  High = 'high',
  Low = 'low'
}

export type VideosFilter = {
  availableVariantLanguageIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  labels?: InputMaybe<Array<VideoLabel>>;
  subtitleLanguageIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
};

/** A visitor with attributes connected to a team. */
export type Visitor = {
  __typename?: 'Visitor';
  /**
   * The country code of the visitor as poulated by visitor ip address detected in
   * the JourneyViewEventCreate mutation. This field country code is converted
   * from an IP address by the @maxmind/geoip2-node library. If this field is empty
   * it is likely that the JourneyViewEventCreate mutation was not called by the
   * visitor or that the country was not able to be determined based on the
   * visitor IP address.
   */
  countryCode?: Maybe<Scalars['String']['output']>;
  /**
   * The time when the visitor created their first event on a journey connected
   * to the requested team.
   */
  createdAt: Scalars['DateTime']['output'];
  /** Duration between createdAt and lastStepViewedAt in seconds */
  duration?: Maybe<Scalars['Int']['output']>;
  /**
   * The email address of the visitor as populated by VisitorUpdate mutation or
   * SignUpEventSubmissionEventCreate mutation.
   */
  email?: Maybe<Scalars['String']['output']>;
  events: Array<Event>;
  id: Scalars['ID']['output'];
  /**
   * The last message platform the visitor called the ButtonClickEvent where the
   * url is in the format of a recognized chat platform
   */
  lastChatPlatform?: Maybe<MessagePlatform>;
  /**
   * The last time the visitor called the ButtonClickEvent mutation where the url
   * is in the format of a recognized chat platform.
   */
  lastChatStartedAt?: Maybe<Scalars['DateTime']['output']>;
  /**
   * The label of a link action button of the last time the visitor clicked a
   * link action button. Populated by ButtonClickEvent
   */
  lastLinkAction?: Maybe<Scalars['String']['output']>;
  /**
   * The selected option  of the last radio option the visitor filled out,
   * populated by RadioQuestionSubmission mutation
   */
  lastRadioOptionSubmission?: Maybe<Scalars['String']['output']>;
  /**
   * The question of the last radio option the visitor filled out,
   * populated by RadioQuestionSubmission mutation
   */
  lastRadioQuestion?: Maybe<Scalars['String']['output']>;
  /**
   * The last time the visitor called StepViewEvent mutation. It is populated when
   * the visitor is first created, and is updated by all event creation mutations.
   */
  lastStepViewedAt?: Maybe<Scalars['DateTime']['output']>;
  /**
   * The response of the last text response block the visitor filled out,
   * populated by TextResponseSubmission mutation
   */
  lastTextResponse?: Maybe<Scalars['String']['output']>;
  /**
   * Message platform the visitor wishes to be connected to us on as populated by
   * VisitorUpdate mutation or ChatOpenEventCreate mutation.
   */
  messagePlatform?: Maybe<MessagePlatform>;
  /**
   * ID of the visitor as set by VisitorUpdate mutation. This could be a phone
   * number, user id or other unique identifier provided by the message platform.
   */
  messagePlatformId?: Maybe<Scalars['String']['output']>;
  /**
   * The name of the visitor as populated by VisitorUpdate mutation or
   * SignUpEventSubmissionEventCreate mutation.
   */
  name?: Maybe<Scalars['String']['output']>;
  /** Private notes of the visitor as set by VisitorUpdate mutation. */
  notes?: Maybe<Scalars['String']['output']>;
  /** The url visitor was referred from */
  referrer?: Maybe<Scalars['String']['output']>;
  /** Status of the visitor as populated by VisitorUpdate mutation. */
  status?: Maybe<VisitorStatus>;
  /**
   * The user agent of the visitor as poulated by the visitor's user-agent string
   * detected in the JourneyViewEventCreate mutation. This field is enriched
   * by data from the ua-parser-js library. If this field is empty it is likely
   * that the JourneyViewEventCreate mutation was not called by the visitor.
   */
  userAgent?: Maybe<UserAgent>;
};

/** An edge in a connection. */
export type VisitorEdge = {
  __typename?: 'VisitorEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: Visitor;
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

/** A list of visitors connected with a team. */
export type VisitorsConnection = {
  __typename?: 'VisitorsConnection';
  /** A list of edges. */
  edges: Array<VisitorEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

export enum Join__Graph {
  Analytics = 'ANALYTICS',
  Journeys = 'JOURNEYS',
  Languages = 'LANGUAGES',
  Media = 'MEDIA',
  Tags = 'TAGS',
  Users = 'USERS',
  Videos = 'VIDEOS'
}

export enum Link__Purpose {
  /** `EXECUTION` features provide metadata necessary for operation execution. */
  Execution = 'EXECUTION',
  /** `SECURITY` features provide metadata necessary to securely resolve fields. */
  Security = 'SECURITY'
}

export type SiteCreateMutationVariables = Exact<{
  input: SiteCreateInput;
}>;


export type SiteCreateMutation = { __typename?: 'Mutation', siteCreate: { __typename: 'Error', message: string } | { __typename?: 'MutationSiteCreateSuccess', data: { __typename: 'Site', id: string, domain: string, memberships: Array<{ __typename: 'SiteMembership', id: string, role: string }>, goals: Array<{ __typename: 'SiteGoal', id: string, eventName?: string | null }>, sharedLinks: Array<{ __typename: 'SiteSharedLink', id: string, slug: string }> } } };


export const SiteCreateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SiteCreate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SiteCreateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"siteCreate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Error"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MutationSiteCreateSuccess"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"domain"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"memberships"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"goals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"eventName"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sharedLinks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<SiteCreateMutation, SiteCreateMutationVariables>;
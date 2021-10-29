/* eslint-disable */
import { GraphQLResolveInfo } from 'graphql';
import { Block as BlockType, Response as ResponseType } from '.prisma/api-journeys-client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Action = {
  gtmEventName?: Maybe<Scalars['String']>;
};

export type Block = {
  id: Scalars['ID'];
  parentBlockId?: Maybe<Scalars['ID']>;
};

export type ButtonBlock = Block & {
  __typename?: 'ButtonBlock';
  action?: Maybe<Action>;
  color?: Maybe<ButtonColor>;
  endIcon?: Maybe<Icon>;
  id: Scalars['ID'];
  label: Scalars['String'];
  parentBlockId?: Maybe<Scalars['ID']>;
  size?: Maybe<ButtonSize>;
  startIcon?: Maybe<Icon>;
  variant?: Maybe<ButtonVariant>;
};

export type ButtonColor =
  | 'error'
  | 'inherit'
  | 'primary'
  | 'secondary';

export type ButtonSize =
  | 'large'
  | 'medium'
  | 'small';

export type ButtonVariant =
  | 'contained'
  | 'text';

export type CardBlock = Block & {
  __typename?: 'CardBlock';
  /** backgroundColor should be a HEX color value e.g #FFFFFF for white. */
  backgroundColor?: Maybe<Scalars['String']>;
  /**
   * coverBlockId is present if a child block should be used as a cover.
   * This child block should not be rendered normally, instead it should be used
   * as a background. Blocks are often of type ImageBlock or VideoBlock.
   */
  coverBlockId?: Maybe<Scalars['ID']>;
  /**
   * fullscreen should control how the coverBlock is displayed. When fullscreen
   * is set to true the coverBlock Image should be displayed as a blur in the
   * background.
   */
  fullscreen: Scalars['Boolean'];
  id: Scalars['ID'];
  parentBlockId?: Maybe<Scalars['ID']>;
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

export type Icon = {
  __typename?: 'Icon';
  color?: Maybe<IconColor>;
  name: IconName;
  size?: Maybe<IconSize>;
};

export type IconColor =
  | 'action'
  | 'disabled'
  | 'error'
  | 'inherit'
  | 'primary'
  | 'secondary';

/** IconName is equivalent to the icons found in @mui/icons-material */
export type IconName =
  | 'ArrowForward'
  | 'ChatBubbleOutline'
  | 'CheckCircle'
  | 'FormatQuote'
  | 'LiveTv'
  | 'LockOpen'
  | 'MenuBook'
  | 'PlayArrow'
  | 'RadioButtonUnchecked'
  | 'Translate';

export type IconSize =
  | 'inherit'
  | 'lg'
  | 'md'
  | 'sm'
  | 'xl';

export type ImageBlock = Block & {
  __typename?: 'ImageBlock';
  alt: Scalars['String'];
  /**
   * blurhash is a compact representation of a placeholder for an image.
   * Find a frontend implementation at https://github.com/woltapp/blurhash
   */
  blurhash: Scalars['String'];
  height: Scalars['Int'];
  id: Scalars['ID'];
  parentBlockId?: Maybe<Scalars['ID']>;
  src: Scalars['String'];
  width: Scalars['Int'];
};

export type ImageBlockCreateInput = {
  alt: Scalars['String'];
  /** ID should be unique Response UUID (Provided for optimistic mutation result matching) */
  id?: Maybe<Scalars['ID']>;
  journeyId: Scalars['ID'];
  parentBlockId?: Maybe<Scalars['ID']>;
  src: Scalars['String'];
};

export type Journey = {
  __typename?: 'Journey';
  blocks?: Maybe<Array<Block>>;
  id: Scalars['ID'];
  locale: Scalars['String'];
  published: Scalars['Boolean'];
  themeMode: ThemeMode;
  themeName: ThemeName;
  title: Scalars['String'];
};

export type JourneyCreateInput = {
  /**
   * ID should be unique Response UUID
   * (Provided for optimistic mutation result matching)
   */
  id?: Maybe<Scalars['ID']>;
  locale?: Maybe<Scalars['String']>;
  themeMode?: Maybe<ThemeMode>;
  themeName?: Maybe<ThemeName>;
  title: Scalars['String'];
};

export type LinkAction = Action & {
  __typename?: 'LinkAction';
  gtmEventName?: Maybe<Scalars['String']>;
  target?: Maybe<Scalars['String']>;
  url: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  imageBlockCreate: ImageBlock;
  journeyCreate: Journey;
  journeyPublish?: Maybe<Journey>;
  radioQuestionResponseCreate: RadioQuestionResponse;
  signUpResponseCreate: SignUpResponse;
  videoResponseCreate: VideoResponse;
};


export type MutationImageBlockCreateArgs = {
  input: ImageBlockCreateInput;
};


export type MutationJourneyCreateArgs = {
  input: JourneyCreateInput;
};


export type MutationJourneyPublishArgs = {
  id: Scalars['ID'];
};


export type MutationRadioQuestionResponseCreateArgs = {
  input: RadioQuestionResponseCreateInput;
};


export type MutationSignUpResponseCreateArgs = {
  input: SignUpResponseCreateInput;
};


export type MutationVideoResponseCreateArgs = {
  input: VideoResponseCreateInput;
};

/**
 * NavigateAction is an Action that navigates to the nextBlockId field set on the
 * closest ancestor StepBlock.
 */
export type NavigateAction = Action & {
  __typename?: 'NavigateAction';
  gtmEventName?: Maybe<Scalars['String']>;
};

export type NavigateToBlockAction = Action & {
  __typename?: 'NavigateToBlockAction';
  blockId: Scalars['String'];
  gtmEventName?: Maybe<Scalars['String']>;
};

export type NavigateToJourneyAction = Action & {
  __typename?: 'NavigateToJourneyAction';
  gtmEventName?: Maybe<Scalars['String']>;
  journeyId: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  journey?: Maybe<Journey>;
  journeys: Array<Journey>;
};


export type QueryJourneyArgs = {
  id: Scalars['ID'];
};

export type RadioOptionBlock = Block & {
  __typename?: 'RadioOptionBlock';
  action?: Maybe<Action>;
  id: Scalars['ID'];
  label: Scalars['String'];
  parentBlockId?: Maybe<Scalars['ID']>;
};

export type RadioQuestionBlock = Block & {
  __typename?: 'RadioQuestionBlock';
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  label: Scalars['String'];
  parentBlockId?: Maybe<Scalars['ID']>;
};

export type RadioQuestionResponse = Response & {
  __typename?: 'RadioQuestionResponse';
  block?: Maybe<RadioQuestionBlock>;
  id: Scalars['ID'];
  radioOptionBlockId: Scalars['ID'];
  userId: Scalars['ID'];
};

export type RadioQuestionResponseCreateInput = {
  blockId: Scalars['ID'];
  /** ID should be unique Response UUID (Provided for optimistic mutation result matching) */
  id?: Maybe<Scalars['ID']>;
  radioOptionBlockId: Scalars['ID'];
};

export type Response = {
  id: Scalars['ID'];
  userId: Scalars['ID'];
};

export type SignUpBlock = Block & {
  __typename?: 'SignUpBlock';
  action?: Maybe<Action>;
  id: Scalars['ID'];
  parentBlockId?: Maybe<Scalars['ID']>;
  submitIcon?: Maybe<Icon>;
  submitLabel?: Maybe<Scalars['String']>;
};

export type SignUpResponse = Response & {
  __typename?: 'SignUpResponse';
  block?: Maybe<SignUpBlock>;
  email: Scalars['String'];
  id: Scalars['ID'];
  name: Scalars['String'];
  userId: Scalars['ID'];
};

export type SignUpResponseCreateInput = {
  blockId: Scalars['ID'];
  email: Scalars['String'];
  /** ID should be unique Response UUID (Provided for optimistic mutation result matching) */
  id?: Maybe<Scalars['ID']>;
  name: Scalars['String'];
};

export type StepBlock = Block & {
  __typename?: 'StepBlock';
  id: Scalars['ID'];
  /**
   * locked will be set to true if the user should not be able to manually
   * advance to the next step.
   */
  locked: Scalars['Boolean'];
  /**
   * nextBlockId contains the preferred block to navigate to when a
   * NavigateAction occurs or if the user manually tries to advance to the next
   * step. If no nextBlockId is set it can be assumed that this step represents
   * the end of the current journey.
   */
  nextBlockId?: Maybe<Scalars['ID']>;
  parentBlockId?: Maybe<Scalars['ID']>;
};

export type ThemeMode =
  | 'dark'
  | 'light';

export type ThemeName =
  | 'base';

export type TriggerBlock = Block & {
  __typename?: 'TriggerBlock';
  action: Action;
  id: Scalars['ID'];
  parentBlockId?: Maybe<Scalars['ID']>;
  triggerStart: Scalars['Int'];
};

export type TypographyAlign =
  | 'center'
  | 'left'
  | 'right';

export type TypographyBlock = Block & {
  __typename?: 'TypographyBlock';
  align?: Maybe<TypographyAlign>;
  color?: Maybe<TypographyColor>;
  content: Scalars['String'];
  id: Scalars['ID'];
  parentBlockId?: Maybe<Scalars['ID']>;
  variant?: Maybe<TypographyVariant>;
};

export type TypographyColor =
  | 'error'
  | 'primary'
  | 'secondary';

export type TypographyVariant =
  | 'body1'
  | 'body2'
  | 'caption'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'overline'
  | 'subtitle1'
  | 'subtitle2';

export type Video = {
  src: Scalars['String'];
};

export type VideoArclight = Video & {
  __typename?: 'VideoArclight';
  languageId: Scalars['String'];
  mediaComponentId: Scalars['String'];
  src: Scalars['String'];
};

export type VideoBlock = Block & {
  __typename?: 'VideoBlock';
  autoplay?: Maybe<Scalars['Boolean']>;
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  parentBlockId?: Maybe<Scalars['ID']>;
  startAt?: Maybe<Scalars['Int']>;
  title: Scalars['String'];
  video?: Maybe<Video>;
  volume?: Maybe<Scalars['Int']>;
};

export type VideoGeneric = Video & {
  __typename?: 'VideoGeneric';
  src: Scalars['String'];
};

export type VideoResponse = Response & {
  __typename?: 'VideoResponse';
  block?: Maybe<VideoBlock>;
  id: Scalars['ID'];
  position?: Maybe<Scalars['Float']>;
  state: VideoResponseStateEnum;
  userId: Scalars['ID'];
};

export type VideoResponseCreateInput = {
  blockId: Scalars['ID'];
  /** ID should be unique Response UUID (Provided for optimistic mutation result matching) */
  id?: Maybe<Scalars['ID']>;
  position?: Maybe<Scalars['Float']>;
  state: VideoResponseStateEnum;
};

export type VideoResponseStateEnum =
  | 'FINISHED'
  | 'PAUSED'
  | 'PLAYING';



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Action: ResolversTypes['LinkAction'] | ResolversTypes['NavigateAction'] | ResolversTypes['NavigateToBlockAction'] | ResolversTypes['NavigateToJourneyAction'];
  Block: ResolverTypeWrapper<BlockType>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  ButtonBlock: ResolverTypeWrapper<BlockType>;
  ButtonColor: ButtonColor;
  ButtonSize: ButtonSize;
  ButtonVariant: ButtonVariant;
  CardBlock: ResolverTypeWrapper<BlockType>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Icon: ResolverTypeWrapper<Icon>;
  IconColor: IconColor;
  IconName: IconName;
  IconSize: IconSize;
  ImageBlock: ResolverTypeWrapper<BlockType>;
  ImageBlockCreateInput: ImageBlockCreateInput;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Journey: ResolverTypeWrapper<Omit<Journey, 'blocks'> & { blocks?: Maybe<Array<ResolversTypes['Block']>> }>;
  JourneyCreateInput: JourneyCreateInput;
  LinkAction: ResolverTypeWrapper<LinkAction>;
  Mutation: ResolverTypeWrapper<{}>;
  NavigateAction: ResolverTypeWrapper<NavigateAction>;
  NavigateToBlockAction: ResolverTypeWrapper<NavigateToBlockAction>;
  NavigateToJourneyAction: ResolverTypeWrapper<NavigateToJourneyAction>;
  Query: ResolverTypeWrapper<{}>;
  RadioOptionBlock: ResolverTypeWrapper<BlockType>;
  RadioQuestionBlock: ResolverTypeWrapper<BlockType>;
  RadioQuestionResponse: ResolverTypeWrapper<ResponseType>;
  RadioQuestionResponseCreateInput: RadioQuestionResponseCreateInput;
  Response: ResolversTypes['RadioQuestionResponse'] | ResolversTypes['SignUpResponse'] | ResolversTypes['VideoResponse'];
  SignUpBlock: ResolverTypeWrapper<BlockType>;
  SignUpResponse: ResolverTypeWrapper<ResponseType>;
  SignUpResponseCreateInput: SignUpResponseCreateInput;
  StepBlock: ResolverTypeWrapper<BlockType>;
  String: ResolverTypeWrapper<Scalars['String']>;
  ThemeMode: ThemeMode;
  ThemeName: ThemeName;
  TriggerBlock: ResolverTypeWrapper<BlockType>;
  TypographyAlign: TypographyAlign;
  TypographyBlock: ResolverTypeWrapper<BlockType>;
  TypographyColor: TypographyColor;
  TypographyVariant: TypographyVariant;
  Video: ResolversTypes['VideoArclight'] | ResolversTypes['VideoGeneric'];
  VideoArclight: ResolverTypeWrapper<VideoArclight>;
  VideoBlock: ResolverTypeWrapper<BlockType>;
  VideoGeneric: ResolverTypeWrapper<VideoGeneric>;
  VideoResponse: ResolverTypeWrapper<ResponseType>;
  VideoResponseCreateInput: VideoResponseCreateInput;
  VideoResponseStateEnum: VideoResponseStateEnum;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Action: ResolversParentTypes['LinkAction'] | ResolversParentTypes['NavigateAction'] | ResolversParentTypes['NavigateToBlockAction'] | ResolversParentTypes['NavigateToJourneyAction'];
  Block: BlockType;
  Boolean: Scalars['Boolean'];
  ButtonBlock: BlockType;
  CardBlock: BlockType;
  Float: Scalars['Float'];
  ID: Scalars['ID'];
  Icon: Icon;
  ImageBlock: BlockType;
  ImageBlockCreateInput: ImageBlockCreateInput;
  Int: Scalars['Int'];
  Journey: Omit<Journey, 'blocks'> & { blocks?: Maybe<Array<ResolversParentTypes['Block']>> };
  JourneyCreateInput: JourneyCreateInput;
  LinkAction: LinkAction;
  Mutation: {};
  NavigateAction: NavigateAction;
  NavigateToBlockAction: NavigateToBlockAction;
  NavigateToJourneyAction: NavigateToJourneyAction;
  Query: {};
  RadioOptionBlock: BlockType;
  RadioQuestionBlock: BlockType;
  RadioQuestionResponse: ResponseType;
  RadioQuestionResponseCreateInput: RadioQuestionResponseCreateInput;
  Response: ResolversParentTypes['RadioQuestionResponse'] | ResolversParentTypes['SignUpResponse'] | ResolversParentTypes['VideoResponse'];
  SignUpBlock: BlockType;
  SignUpResponse: ResponseType;
  SignUpResponseCreateInput: SignUpResponseCreateInput;
  StepBlock: BlockType;
  String: Scalars['String'];
  TriggerBlock: BlockType;
  TypographyBlock: BlockType;
  Video: ResolversParentTypes['VideoArclight'] | ResolversParentTypes['VideoGeneric'];
  VideoArclight: VideoArclight;
  VideoBlock: BlockType;
  VideoGeneric: VideoGeneric;
  VideoResponse: ResponseType;
  VideoResponseCreateInput: VideoResponseCreateInput;
};

export type ActionResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['Action'] = ResolversParentTypes['Action']> = {
  __resolveType: TypeResolveFn<'LinkAction' | 'NavigateAction' | 'NavigateToBlockAction' | 'NavigateToJourneyAction', ParentType, ContextType>;
  gtmEventName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type BlockResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['Block'] = ResolversParentTypes['Block']> = {
  __resolveType: TypeResolveFn<'ButtonBlock' | 'CardBlock' | 'ImageBlock' | 'RadioOptionBlock' | 'RadioQuestionBlock' | 'SignUpBlock' | 'StepBlock' | 'TriggerBlock' | 'TypographyBlock' | 'VideoBlock', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  parentBlockId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
};

export type ButtonBlockResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['ButtonBlock'] = ResolversParentTypes['ButtonBlock']> = {
  action?: Resolver<Maybe<ResolversTypes['Action']>, ParentType, ContextType>;
  color?: Resolver<Maybe<ResolversTypes['ButtonColor']>, ParentType, ContextType>;
  endIcon?: Resolver<Maybe<ResolversTypes['Icon']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  parentBlockId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  size?: Resolver<Maybe<ResolversTypes['ButtonSize']>, ParentType, ContextType>;
  startIcon?: Resolver<Maybe<ResolversTypes['Icon']>, ParentType, ContextType>;
  variant?: Resolver<Maybe<ResolversTypes['ButtonVariant']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CardBlockResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['CardBlock'] = ResolversParentTypes['CardBlock']> = {
  backgroundColor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  coverBlockId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  fullscreen?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  parentBlockId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  themeMode?: Resolver<Maybe<ResolversTypes['ThemeMode']>, ParentType, ContextType>;
  themeName?: Resolver<Maybe<ResolversTypes['ThemeName']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IconResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['Icon'] = ResolversParentTypes['Icon']> = {
  color?: Resolver<Maybe<ResolversTypes['IconColor']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['IconName'], ParentType, ContextType>;
  size?: Resolver<Maybe<ResolversTypes['IconSize']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ImageBlockResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['ImageBlock'] = ResolversParentTypes['ImageBlock']> = {
  alt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  blurhash?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  height?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  parentBlockId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  src?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  width?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type JourneyResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['Journey'] = ResolversParentTypes['Journey']> = {
  blocks?: Resolver<Maybe<Array<ResolversTypes['Block']>>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  locale?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  published?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  themeMode?: Resolver<ResolversTypes['ThemeMode'], ParentType, ContextType>;
  themeName?: Resolver<ResolversTypes['ThemeName'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LinkActionResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['LinkAction'] = ResolversParentTypes['LinkAction']> = {
  gtmEventName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  target?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  imageBlockCreate?: Resolver<ResolversTypes['ImageBlock'], ParentType, ContextType, RequireFields<MutationImageBlockCreateArgs, 'input'>>;
  journeyCreate?: Resolver<ResolversTypes['Journey'], ParentType, ContextType, RequireFields<MutationJourneyCreateArgs, 'input'>>;
  journeyPublish?: Resolver<Maybe<ResolversTypes['Journey']>, ParentType, ContextType, RequireFields<MutationJourneyPublishArgs, 'id'>>;
  radioQuestionResponseCreate?: Resolver<ResolversTypes['RadioQuestionResponse'], ParentType, ContextType, RequireFields<MutationRadioQuestionResponseCreateArgs, 'input'>>;
  signUpResponseCreate?: Resolver<ResolversTypes['SignUpResponse'], ParentType, ContextType, RequireFields<MutationSignUpResponseCreateArgs, 'input'>>;
  videoResponseCreate?: Resolver<ResolversTypes['VideoResponse'], ParentType, ContextType, RequireFields<MutationVideoResponseCreateArgs, 'input'>>;
};

export type NavigateActionResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['NavigateAction'] = ResolversParentTypes['NavigateAction']> = {
  gtmEventName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NavigateToBlockActionResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['NavigateToBlockAction'] = ResolversParentTypes['NavigateToBlockAction']> = {
  blockId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  gtmEventName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NavigateToJourneyActionResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['NavigateToJourneyAction'] = ResolversParentTypes['NavigateToJourneyAction']> = {
  gtmEventName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  journeyId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  journey?: Resolver<Maybe<ResolversTypes['Journey']>, ParentType, ContextType, RequireFields<QueryJourneyArgs, 'id'>>;
  journeys?: Resolver<Array<ResolversTypes['Journey']>, ParentType, ContextType>;
};

export type RadioOptionBlockResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['RadioOptionBlock'] = ResolversParentTypes['RadioOptionBlock']> = {
  action?: Resolver<Maybe<ResolversTypes['Action']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  parentBlockId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RadioQuestionBlockResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['RadioQuestionBlock'] = ResolversParentTypes['RadioQuestionBlock']> = {
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  parentBlockId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RadioQuestionResponseResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['RadioQuestionResponse'] = ResolversParentTypes['RadioQuestionResponse']> = {
  block?: Resolver<Maybe<ResolversTypes['RadioQuestionBlock']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  radioOptionBlockId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ResponseResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['Response'] = ResolversParentTypes['Response']> = {
  __resolveType: TypeResolveFn<'RadioQuestionResponse' | 'SignUpResponse' | 'VideoResponse', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export type SignUpBlockResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['SignUpBlock'] = ResolversParentTypes['SignUpBlock']> = {
  action?: Resolver<Maybe<ResolversTypes['Action']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  parentBlockId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  submitIcon?: Resolver<Maybe<ResolversTypes['Icon']>, ParentType, ContextType>;
  submitLabel?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SignUpResponseResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['SignUpResponse'] = ResolversParentTypes['SignUpResponse']> = {
  block?: Resolver<Maybe<ResolversTypes['SignUpBlock']>, ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StepBlockResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['StepBlock'] = ResolversParentTypes['StepBlock']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  locked?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  nextBlockId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  parentBlockId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TriggerBlockResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['TriggerBlock'] = ResolversParentTypes['TriggerBlock']> = {
  action?: Resolver<ResolversTypes['Action'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  parentBlockId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  triggerStart?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TypographyBlockResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['TypographyBlock'] = ResolversParentTypes['TypographyBlock']> = {
  align?: Resolver<Maybe<ResolversTypes['TypographyAlign']>, ParentType, ContextType>;
  color?: Resolver<Maybe<ResolversTypes['TypographyColor']>, ParentType, ContextType>;
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  parentBlockId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  variant?: Resolver<Maybe<ResolversTypes['TypographyVariant']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VideoResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['Video'] = ResolversParentTypes['Video']> = {
  __resolveType: TypeResolveFn<'VideoArclight' | 'VideoGeneric', ParentType, ContextType>;
  src?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type VideoArclightResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['VideoArclight'] = ResolversParentTypes['VideoArclight']> = {
  languageId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  mediaComponentId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  src?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VideoBlockResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['VideoBlock'] = ResolversParentTypes['VideoBlock']> = {
  autoplay?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  parentBlockId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  startAt?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  video?: Resolver<Maybe<ResolversTypes['Video']>, ParentType, ContextType>;
  volume?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VideoGenericResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['VideoGeneric'] = ResolversParentTypes['VideoGeneric']> = {
  src?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VideoResponseResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['VideoResponse'] = ResolversParentTypes['VideoResponse']> = {
  block?: Resolver<Maybe<ResolversTypes['VideoBlock']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  position?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  state?: Resolver<ResolversTypes['VideoResponseStateEnum'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = GraphQLModules.Context> = {
  Action?: ActionResolvers<ContextType>;
  Block?: BlockResolvers<ContextType>;
  ButtonBlock?: ButtonBlockResolvers<ContextType>;
  CardBlock?: CardBlockResolvers<ContextType>;
  Icon?: IconResolvers<ContextType>;
  ImageBlock?: ImageBlockResolvers<ContextType>;
  Journey?: JourneyResolvers<ContextType>;
  LinkAction?: LinkActionResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  NavigateAction?: NavigateActionResolvers<ContextType>;
  NavigateToBlockAction?: NavigateToBlockActionResolvers<ContextType>;
  NavigateToJourneyAction?: NavigateToJourneyActionResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RadioOptionBlock?: RadioOptionBlockResolvers<ContextType>;
  RadioQuestionBlock?: RadioQuestionBlockResolvers<ContextType>;
  RadioQuestionResponse?: RadioQuestionResponseResolvers<ContextType>;
  Response?: ResponseResolvers<ContextType>;
  SignUpBlock?: SignUpBlockResolvers<ContextType>;
  SignUpResponse?: SignUpResponseResolvers<ContextType>;
  StepBlock?: StepBlockResolvers<ContextType>;
  TriggerBlock?: TriggerBlockResolvers<ContextType>;
  TypographyBlock?: TypographyBlockResolvers<ContextType>;
  Video?: VideoResolvers<ContextType>;
  VideoArclight?: VideoArclightResolvers<ContextType>;
  VideoBlock?: VideoBlockResolvers<ContextType>;
  VideoGeneric?: VideoGenericResolvers<ContextType>;
  VideoResponse?: VideoResponseResolvers<ContextType>;
};


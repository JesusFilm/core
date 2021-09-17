/* eslint-disable */
import { IconName } from '../modules/block/icon-enums';
import { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type EnumResolverSignature<T, AllowedValues = any> = { [key in keyof T]?: AllowedValues };
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
  id: Scalars['ID'];
  parentBlockId?: Maybe<Scalars['ID']>;
  label: Scalars['String'];
  variant?: Maybe<ButtonBlockVariant>;
  color?: Maybe<ButtonColor>;
  size?: Maybe<ButtonSize>;
  startIcon?: Maybe<Icon>;
  endIcon?: Maybe<Icon>;
  action?: Maybe<Action>;
};

export type ButtonBlockVariant =
  | 'text'
  | 'outlined'
  | 'contained';

export type ButtonColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'info'
  | 'warning'
  | 'inherit';

export type ButtonSize =
  | 'small'
  | 'medium'
  | 'large';

export type Icon = {
  __typename?: 'Icon';
  name: IconName;
  color?: Maybe<IconColor>;
  fontSize?: Maybe<Scalars['String']>;
};

export type IconColor =
  | 'primary'
  | 'secondary'
  | 'action'
  | 'error'
  | 'disabled'
  | 'inherit';

export { IconName };

export type Journey = {
  __typename?: 'Journey';
  blocks?: Maybe<Array<Block>>;
  id: Scalars['ID'];
  published: Scalars['Boolean'];
  title: Scalars['String'];
};

export type LinkAction = Action & {
  __typename?: 'LinkAction';
  gtmEventName?: Maybe<Scalars['String']>;
  url: Scalars['String'];
  target?: Maybe<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  journeyCreate: Journey;
  journeyPublish?: Maybe<Journey>;
};


export type MutationJourneyCreateArgs = {
  title: Scalars['String'];
};


export type MutationJourneyPublishArgs = {
  id: Scalars['ID'];
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
  gtmEventName?: Maybe<Scalars['String']>;
  blockId: Scalars['String'];
};

export type NavigateToJourneyAction = Action & {
  __typename?: 'NavigateToJourneyAction';
  gtmEventName?: Maybe<Scalars['String']>;
  journeyId: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  journeys: Array<Journey>;
  journey?: Maybe<Journey>;
};


export type QueryJourneyArgs = {
  id: Scalars['ID'];
};

export type RadioOptionBlock = Block & {
  __typename?: 'RadioOptionBlock';
  id: Scalars['ID'];
  parentBlockId?: Maybe<Scalars['ID']>;
  label: Scalars['String'];
  action?: Maybe<Action>;
};

export type RadioQuestionBlock = Block & {
  __typename?: 'RadioQuestionBlock';
  id: Scalars['ID'];
  parentBlockId?: Maybe<Scalars['ID']>;
  label: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  variant?: Maybe<RadioQuestionVariant>;
};

export type RadioQuestionVariant =
  | 'LIGHT'
  | 'DARK';

export type StepBlock = Block & {
  __typename?: 'StepBlock';
  id: Scalars['ID'];
  /**
   * nextBlockId contains the preferred block to navigate to when a
   * NavigateAction occurs or if the user manually tries to advance to the next
   * step. If no nextBlockId is set it can be assumed that this step represents
   * the end of the current journey.
   */
  nextBlockId?: Maybe<Scalars['ID']>;
  /**
   * locked will be set to true if the user should not be able to manually
   * advance to the next step.
   */
  locked: Scalars['Boolean'];
  parentBlockId?: Maybe<Scalars['ID']>;
};

export type VideoBlock = Block & {
  __typename?: 'VideoBlock';
  id: Scalars['ID'];
  parentBlockId?: Maybe<Scalars['ID']>;
  src: Scalars['String'];
  title: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  provider: VideoProviderEnum;
};

export type VideoProviderEnum =
  | 'YOUTUBE'
  | 'VIMEO'
  | 'ARCLIGHT';



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
  String: ResolverTypeWrapper<Scalars['String']>;
  Block: ResolversTypes['ButtonBlock'] | ResolversTypes['RadioOptionBlock'] | ResolversTypes['RadioQuestionBlock'] | ResolversTypes['StepBlock'] | ResolversTypes['VideoBlock'];
  ID: ResolverTypeWrapper<Scalars['ID']>;
  ButtonBlock: ResolverTypeWrapper<ButtonBlock>;
  ButtonBlockVariant: ButtonBlockVariant;
  ButtonColor: ButtonColor;
  ButtonSize: ButtonSize;
  Icon: ResolverTypeWrapper<Icon>;
  IconColor: IconColor;
  IconName: IconName;
  Journey: ResolverTypeWrapper<Journey>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  LinkAction: ResolverTypeWrapper<LinkAction>;
  Mutation: ResolverTypeWrapper<{}>;
  NavigateAction: ResolverTypeWrapper<NavigateAction>;
  NavigateToBlockAction: ResolverTypeWrapper<NavigateToBlockAction>;
  NavigateToJourneyAction: ResolverTypeWrapper<NavigateToJourneyAction>;
  Query: ResolverTypeWrapper<{}>;
  RadioOptionBlock: ResolverTypeWrapper<RadioOptionBlock>;
  RadioQuestionBlock: ResolverTypeWrapper<RadioQuestionBlock>;
  RadioQuestionVariant: RadioQuestionVariant;
  StepBlock: ResolverTypeWrapper<StepBlock>;
  VideoBlock: ResolverTypeWrapper<VideoBlock>;
  VideoProviderEnum: VideoProviderEnum;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Action: ResolversParentTypes['LinkAction'] | ResolversParentTypes['NavigateAction'] | ResolversParentTypes['NavigateToBlockAction'] | ResolversParentTypes['NavigateToJourneyAction'];
  String: Scalars['String'];
  Block: ResolversParentTypes['ButtonBlock'] | ResolversParentTypes['RadioOptionBlock'] | ResolversParentTypes['RadioQuestionBlock'] | ResolversParentTypes['StepBlock'] | ResolversParentTypes['VideoBlock'];
  ID: Scalars['ID'];
  ButtonBlock: ButtonBlock;
  Icon: Icon;
  Journey: Journey;
  Boolean: Scalars['Boolean'];
  LinkAction: LinkAction;
  Mutation: {};
  NavigateAction: NavigateAction;
  NavigateToBlockAction: NavigateToBlockAction;
  NavigateToJourneyAction: NavigateToJourneyAction;
  Query: {};
  RadioOptionBlock: RadioOptionBlock;
  RadioQuestionBlock: RadioQuestionBlock;
  StepBlock: StepBlock;
  VideoBlock: VideoBlock;
};

export type ActionResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['Action'] = ResolversParentTypes['Action']> = {
  __resolveType: TypeResolveFn<'LinkAction' | 'NavigateAction' | 'NavigateToBlockAction' | 'NavigateToJourneyAction', ParentType, ContextType>;
  gtmEventName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type BlockResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['Block'] = ResolversParentTypes['Block']> = {
  __resolveType: TypeResolveFn<'ButtonBlock' | 'RadioOptionBlock' | 'RadioQuestionBlock' | 'StepBlock' | 'VideoBlock', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  parentBlockId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
};

export type ButtonBlockResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['ButtonBlock'] = ResolversParentTypes['ButtonBlock']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  parentBlockId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  variant?: Resolver<Maybe<ResolversTypes['ButtonBlockVariant']>, ParentType, ContextType>;
  color?: Resolver<Maybe<ResolversTypes['ButtonColor']>, ParentType, ContextType>;
  size?: Resolver<Maybe<ResolversTypes['ButtonSize']>, ParentType, ContextType>;
  startIcon?: Resolver<Maybe<ResolversTypes['Icon']>, ParentType, ContextType>;
  endIcon?: Resolver<Maybe<ResolversTypes['Icon']>, ParentType, ContextType>;
  action?: Resolver<Maybe<ResolversTypes['Action']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IconResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['Icon'] = ResolversParentTypes['Icon']> = {
  name?: Resolver<ResolversTypes['IconName'], ParentType, ContextType>;
  color?: Resolver<Maybe<ResolversTypes['IconColor']>, ParentType, ContextType>;
  fontSize?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IconNameResolvers = EnumResolverSignature<{ PlayArrow?: any, Translate?: any, CheckCircle?: any, RadioButtonUnchecked?: any, FormatQuote?: any, LockOpen?: any, ArrowForward?: any, ChatBubbleOutline?: any, LiveTv?: any, MenuBook?: any }, ResolversTypes['IconName']>;

export type JourneyResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['Journey'] = ResolversParentTypes['Journey']> = {
  blocks?: Resolver<Maybe<Array<ResolversTypes['Block']>>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  published?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LinkActionResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['LinkAction'] = ResolversParentTypes['LinkAction']> = {
  gtmEventName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  target?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  journeyCreate?: Resolver<ResolversTypes['Journey'], ParentType, ContextType, RequireFields<MutationJourneyCreateArgs, 'title'>>;
  journeyPublish?: Resolver<Maybe<ResolversTypes['Journey']>, ParentType, ContextType, RequireFields<MutationJourneyPublishArgs, 'id'>>;
};

export type NavigateActionResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['NavigateAction'] = ResolversParentTypes['NavigateAction']> = {
  gtmEventName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NavigateToBlockActionResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['NavigateToBlockAction'] = ResolversParentTypes['NavigateToBlockAction']> = {
  gtmEventName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  blockId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NavigateToJourneyActionResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['NavigateToJourneyAction'] = ResolversParentTypes['NavigateToJourneyAction']> = {
  gtmEventName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  journeyId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  journeys?: Resolver<Array<ResolversTypes['Journey']>, ParentType, ContextType>;
  journey?: Resolver<Maybe<ResolversTypes['Journey']>, ParentType, ContextType, RequireFields<QueryJourneyArgs, 'id'>>;
};

export type RadioOptionBlockResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['RadioOptionBlock'] = ResolversParentTypes['RadioOptionBlock']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  parentBlockId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  action?: Resolver<Maybe<ResolversTypes['Action']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RadioQuestionBlockResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['RadioQuestionBlock'] = ResolversParentTypes['RadioQuestionBlock']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  parentBlockId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  variant?: Resolver<Maybe<ResolversTypes['RadioQuestionVariant']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StepBlockResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['StepBlock'] = ResolversParentTypes['StepBlock']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  nextBlockId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  locked?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  parentBlockId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VideoBlockResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['VideoBlock'] = ResolversParentTypes['VideoBlock']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  parentBlockId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  src?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  provider?: Resolver<ResolversTypes['VideoProviderEnum'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = GraphQLModules.Context> = {
  Action?: ActionResolvers<ContextType>;
  Block?: BlockResolvers<ContextType>;
  ButtonBlock?: ButtonBlockResolvers<ContextType>;
  Icon?: IconResolvers<ContextType>;
  IconName?: IconNameResolvers;
  Journey?: JourneyResolvers<ContextType>;
  LinkAction?: LinkActionResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  NavigateAction?: NavigateActionResolvers<ContextType>;
  NavigateToBlockAction?: NavigateToBlockActionResolvers<ContextType>;
  NavigateToJourneyAction?: NavigateToJourneyActionResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RadioOptionBlock?: RadioOptionBlockResolvers<ContextType>;
  RadioQuestionBlock?: RadioQuestionBlockResolvers<ContextType>;
  StepBlock?: StepBlockResolvers<ContextType>;
  VideoBlock?: VideoBlockResolvers<ContextType>;
};


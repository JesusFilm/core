/* eslint-disable */
import { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
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
  radioQuestionBlockResponseCreate: Scalars['ID'];
  signupBlockResponseCreate: Scalars['ID'];
  userSessionCreate: Scalars['ID'];
  videoBlockResponseCreate: Scalars['ID'];
};


export type MutationJourneyCreateArgs = {
  title: Scalars['String'];
};


export type MutationJourneyPublishArgs = {
  id: Scalars['ID'];
};


export type MutationRadioQuestionBlockResponseCreateArgs = {
  userSessionId: Scalars['ID'];
  blockId: Scalars['ID'];
  selectedResponseBlockId: Scalars['ID'];
};


export type MutationSignupBlockResponseCreateArgs = {
  userSessionId: Scalars['ID'];
  blockId: Scalars['ID'];
  name: Scalars['String'];
  email: Scalars['String'];
};


export type MutationUserSessionCreateArgs = {
  journeyId: Scalars['ID'];
};


export type MutationVideoBlockResponseCreateArgs = {
  userSessionId: Scalars['ID'];
  blockId: Scalars['ID'];
  position: Scalars['Float'];
  state: VideoBlockResponseStateEnum;
};

export type NavigateAction = Action & {
  __typename?: 'NavigateAction';
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

export type VideoBlockResponseStateEnum =
  | 'PLAYING'
  | 'PAUSED'
  | 'FINISHED';

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
  Action: ResolversTypes['LinkAction'] | ResolversTypes['NavigateAction'] | ResolversTypes['NavigateToJourneyAction'];
  String: ResolverTypeWrapper<Scalars['String']>;
  Block: ResolversTypes['RadioOptionBlock'] | ResolversTypes['RadioQuestionBlock'] | ResolversTypes['StepBlock'] | ResolversTypes['VideoBlock'];
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Journey: ResolverTypeWrapper<Journey>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  LinkAction: ResolverTypeWrapper<LinkAction>;
  Mutation: ResolverTypeWrapper<{}>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  NavigateAction: ResolverTypeWrapper<NavigateAction>;
  NavigateToJourneyAction: ResolverTypeWrapper<NavigateToJourneyAction>;
  Query: ResolverTypeWrapper<{}>;
  RadioOptionBlock: ResolverTypeWrapper<RadioOptionBlock>;
  RadioQuestionBlock: ResolverTypeWrapper<RadioQuestionBlock>;
  RadioQuestionVariant: RadioQuestionVariant;
  StepBlock: ResolverTypeWrapper<StepBlock>;
  VideoBlock: ResolverTypeWrapper<VideoBlock>;
  VideoBlockResponseStateEnum: VideoBlockResponseStateEnum;
  VideoProviderEnum: VideoProviderEnum;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Action: ResolversParentTypes['LinkAction'] | ResolversParentTypes['NavigateAction'] | ResolversParentTypes['NavigateToJourneyAction'];
  String: Scalars['String'];
  Block: ResolversParentTypes['RadioOptionBlock'] | ResolversParentTypes['RadioQuestionBlock'] | ResolversParentTypes['StepBlock'] | ResolversParentTypes['VideoBlock'];
  ID: Scalars['ID'];
  Journey: Journey;
  Boolean: Scalars['Boolean'];
  LinkAction: LinkAction;
  Mutation: {};
  Float: Scalars['Float'];
  NavigateAction: NavigateAction;
  NavigateToJourneyAction: NavigateToJourneyAction;
  Query: {};
  RadioOptionBlock: RadioOptionBlock;
  RadioQuestionBlock: RadioQuestionBlock;
  StepBlock: StepBlock;
  VideoBlock: VideoBlock;
};

export type ActionResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['Action'] = ResolversParentTypes['Action']> = {
  __resolveType: TypeResolveFn<'LinkAction' | 'NavigateAction' | 'NavigateToJourneyAction', ParentType, ContextType>;
  gtmEventName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type BlockResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['Block'] = ResolversParentTypes['Block']> = {
  __resolveType: TypeResolveFn<'RadioOptionBlock' | 'RadioQuestionBlock' | 'StepBlock' | 'VideoBlock', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  parentBlockId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
};

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
  radioQuestionBlockResponseCreate?: Resolver<ResolversTypes['ID'], ParentType, ContextType, RequireFields<MutationRadioQuestionBlockResponseCreateArgs, 'userSessionId' | 'blockId' | 'selectedResponseBlockId'>>;
  signupBlockResponseCreate?: Resolver<ResolversTypes['ID'], ParentType, ContextType, RequireFields<MutationSignupBlockResponseCreateArgs, 'userSessionId' | 'blockId' | 'name' | 'email'>>;
  userSessionCreate?: Resolver<ResolversTypes['ID'], ParentType, ContextType, RequireFields<MutationUserSessionCreateArgs, 'journeyId'>>;
  videoBlockResponseCreate?: Resolver<ResolversTypes['ID'], ParentType, ContextType, RequireFields<MutationVideoBlockResponseCreateArgs, 'userSessionId' | 'blockId' | 'position' | 'state'>>;
};

export type NavigateActionResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['NavigateAction'] = ResolversParentTypes['NavigateAction']> = {
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
  Journey?: JourneyResolvers<ContextType>;
  LinkAction?: LinkActionResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  NavigateAction?: NavigateActionResolvers<ContextType>;
  NavigateToJourneyAction?: NavigateToJourneyActionResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RadioOptionBlock?: RadioOptionBlockResolvers<ContextType>;
  RadioQuestionBlock?: RadioQuestionBlockResolvers<ContextType>;
  StepBlock?: StepBlockResolvers<ContextType>;
  VideoBlock?: VideoBlockResolvers<ContextType>;
};


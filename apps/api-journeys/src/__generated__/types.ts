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
  radioQuestionResponseCreate: RadioQuestionResponse;
  signupResponseCreate: SignupResponse;
  videoResponseCreate: VideoResponse;
};


export type MutationJourneyCreateArgs = {
  title: Scalars['String'];
};


export type MutationJourneyPublishArgs = {
  id: Scalars['ID'];
};


export type MutationRadioQuestionResponseCreateArgs = {
  input: RadioQuestionResponseCreateInput;
};


export type MutationSignupResponseCreateArgs = {
  input: SignupResponseCreateInput;
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

export type RadioQuestionResponse = Response & {
  __typename?: 'RadioQuestionResponse';
  block: RadioQuestionBlock;
  id: Scalars['ID'];
  radioOptionBlockId: Scalars['ID'];
  userId: Scalars['ID'];
};

export type RadioQuestionResponseCreateInput = {
  /** ID should be unique Response UUID (Provided for optimistic mutation result matching) */
  id?: Maybe<Scalars['ID']>;
  blockId: Scalars['ID'];
  radioOptionBlockId: Scalars['ID'];
};

export type RadioQuestionVariant =
  | 'LIGHT'
  | 'DARK';

export type Response = {
  id: Scalars['ID'];
  userId: Scalars['ID'];
};

export type SignupBlock = Block & {
  __typename?: 'SignupBlock';
  id: Scalars['ID'];
  parentBlockId?: Maybe<Scalars['ID']>;
};

export type SignupResponse = Response & {
  __typename?: 'SignupResponse';
  block: SignupBlock;
  email: Scalars['String'];
  id: Scalars['ID'];
  name: Scalars['String'];
  userId: Scalars['ID'];
};

export type SignupResponseCreateInput = {
  /** ID should be unique Response UUID (Provided for optimistic mutation result matching) */
  id?: Maybe<Scalars['ID']>;
  blockId: Scalars['ID'];
  name: Scalars['String'];
  email: Scalars['String'];
};

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
  volume?: Maybe<Scalars['Int']>;
  autoplay?: Maybe<Scalars['Boolean']>;
};

export type VideoResponse = Response & {
  __typename?: 'VideoResponse';
  block: VideoBlock;
  id: Scalars['ID'];
  state: VideoResponseStateEnum;
  userId: Scalars['ID'];
};

export type VideoResponseCreateInput = {
  /** ID should be unique Response UUID (Provided for optimistic mutation result matching) */
  id?: Maybe<Scalars['ID']>;
  blockId: Scalars['ID'];
  state: VideoResponseStateEnum;
};

export type VideoResponseStateEnum =
  | 'PLAYING'
  | 'PAUSED'
  | 'FINISHED';



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
  Block: ResolverTypeWrapper<BlockType>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Journey: ResolverTypeWrapper<Omit<Journey, 'blocks'> & { blocks?: Maybe<Array<ResolversTypes['Block']>> }>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
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
  RadioQuestionVariant: RadioQuestionVariant;
  Response: ResolversTypes['RadioQuestionResponse'] | ResolversTypes['SignupResponse'] | ResolversTypes['VideoResponse'];
  SignupBlock: ResolverTypeWrapper<SignupBlock>;
  SignupResponse: ResolverTypeWrapper<ResponseType>;
  SignupResponseCreateInput: SignupResponseCreateInput;
  StepBlock: ResolverTypeWrapper<BlockType>;
  VideoBlock: ResolverTypeWrapper<BlockType>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  VideoResponse: ResolverTypeWrapper<ResponseType>;
  VideoResponseCreateInput: VideoResponseCreateInput;
  VideoResponseStateEnum: VideoResponseStateEnum;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Action: ResolversParentTypes['LinkAction'] | ResolversParentTypes['NavigateAction'] | ResolversParentTypes['NavigateToBlockAction'] | ResolversParentTypes['NavigateToJourneyAction'];
  String: Scalars['String'];
  Block: BlockType;
  ID: Scalars['ID'];
  Journey: Omit<Journey, 'blocks'> & { blocks?: Maybe<Array<ResolversParentTypes['Block']>> };
  Boolean: Scalars['Boolean'];
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
  Response: ResolversParentTypes['RadioQuestionResponse'] | ResolversParentTypes['SignupResponse'] | ResolversParentTypes['VideoResponse'];
  SignupBlock: SignupBlock;
  SignupResponse: ResponseType;
  SignupResponseCreateInput: SignupResponseCreateInput;
  StepBlock: BlockType;
  VideoBlock: BlockType;
  Int: Scalars['Int'];
  VideoResponse: ResponseType;
  VideoResponseCreateInput: VideoResponseCreateInput;
};

export type ActionResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['Action'] = ResolversParentTypes['Action']> = {
  __resolveType: TypeResolveFn<'LinkAction' | 'NavigateAction' | 'NavigateToBlockAction' | 'NavigateToJourneyAction', ParentType, ContextType>;
  gtmEventName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type BlockResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['Block'] = ResolversParentTypes['Block']> = {
  __resolveType: TypeResolveFn<'RadioOptionBlock' | 'RadioQuestionBlock' | 'SignupBlock' | 'StepBlock' | 'VideoBlock', ParentType, ContextType>;
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
  radioQuestionResponseCreate?: Resolver<ResolversTypes['RadioQuestionResponse'], ParentType, ContextType, RequireFields<MutationRadioQuestionResponseCreateArgs, 'input'>>;
  signupResponseCreate?: Resolver<ResolversTypes['SignupResponse'], ParentType, ContextType, RequireFields<MutationSignupResponseCreateArgs, 'input'>>;
  videoResponseCreate?: Resolver<ResolversTypes['VideoResponse'], ParentType, ContextType, RequireFields<MutationVideoResponseCreateArgs, 'input'>>;
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

export type RadioQuestionResponseResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['RadioQuestionResponse'] = ResolversParentTypes['RadioQuestionResponse']> = {
  block?: Resolver<ResolversTypes['RadioQuestionBlock'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  radioOptionBlockId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ResponseResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['Response'] = ResolversParentTypes['Response']> = {
  __resolveType: TypeResolveFn<'RadioQuestionResponse' | 'SignupResponse' | 'VideoResponse', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export type SignupBlockResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['SignupBlock'] = ResolversParentTypes['SignupBlock']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  parentBlockId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SignupResponseResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['SignupResponse'] = ResolversParentTypes['SignupResponse']> = {
  block?: Resolver<ResolversTypes['SignupBlock'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
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
  volume?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  autoplay?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VideoResponseResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['VideoResponse'] = ResolversParentTypes['VideoResponse']> = {
  block?: Resolver<ResolversTypes['VideoBlock'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  state?: Resolver<ResolversTypes['VideoResponseStateEnum'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = GraphQLModules.Context> = {
  Action?: ActionResolvers<ContextType>;
  Block?: BlockResolvers<ContextType>;
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
  SignupBlock?: SignupBlockResolvers<ContextType>;
  SignupResponse?: SignupResponseResolvers<ContextType>;
  StepBlock?: StepBlockResolvers<ContextType>;
  VideoBlock?: VideoBlockResolvers<ContextType>;
  VideoResponse?: VideoResponseResolvers<ContextType>;
};


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
  id: Scalars['ID'];
  image?: Maybe<Scalars['String']>;
  label: Scalars['String'];
  parentBlockId?: Maybe<Scalars['ID']>;
};

export type RadioQuestionBlock = Block & {
  __typename?: 'RadioQuestionBlock';
  description: Scalars['String'];
  id: Scalars['ID'];
  label: Scalars['String'];
  parentBlockId?: Maybe<Scalars['ID']>;
  variant?: Maybe<RadioQuestionVariant>;
};

export type RadioQuestionVariant =
  | 'DARK'
  | 'LIGHT';

export type StepBlock = Block & {
  __typename?: 'StepBlock';
  id: Scalars['ID'];
  parentBlockId?: Maybe<Scalars['ID']>;
};

export type VideoBlock = Block & {
  __typename?: 'VideoBlock';
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  parentBlockId?: Maybe<Scalars['ID']>;
  provider?: Maybe<VideoProviderEnum>;
  src: Scalars['String'];
  title: Scalars['String'];
};

export type VideoProviderEnum =
  | 'ARCLIGHT'
  | 'VIMEO'
  | 'YOUTUBE';



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
  Block: ResolversTypes['RadioOptionBlock'] | ResolversTypes['RadioQuestionBlock'] | ResolversTypes['StepBlock'] | ResolversTypes['VideoBlock'];
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Journey: ResolverTypeWrapper<Journey>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  RadioOptionBlock: ResolverTypeWrapper<RadioOptionBlock>;
  RadioQuestionBlock: ResolverTypeWrapper<RadioQuestionBlock>;
  RadioQuestionVariant: RadioQuestionVariant;
  StepBlock: ResolverTypeWrapper<StepBlock>;
  String: ResolverTypeWrapper<Scalars['String']>;
  VideoBlock: ResolverTypeWrapper<VideoBlock>;
  VideoProviderEnum: VideoProviderEnum;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Block: ResolversParentTypes['RadioOptionBlock'] | ResolversParentTypes['RadioQuestionBlock'] | ResolversParentTypes['StepBlock'] | ResolversParentTypes['VideoBlock'];
  Boolean: Scalars['Boolean'];
  ID: Scalars['ID'];
  Journey: Journey;
  Mutation: {};
  Query: {};
  RadioOptionBlock: RadioOptionBlock;
  RadioQuestionBlock: RadioQuestionBlock;
  StepBlock: StepBlock;
  String: Scalars['String'];
  VideoBlock: VideoBlock;
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

export type MutationResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  journeyCreate?: Resolver<ResolversTypes['Journey'], ParentType, ContextType, RequireFields<MutationJourneyCreateArgs, 'title'>>;
  journeyPublish?: Resolver<Maybe<ResolversTypes['Journey']>, ParentType, ContextType, RequireFields<MutationJourneyPublishArgs, 'id'>>;
};

export type QueryResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  journey?: Resolver<Maybe<ResolversTypes['Journey']>, ParentType, ContextType, RequireFields<QueryJourneyArgs, 'id'>>;
  journeys?: Resolver<Array<ResolversTypes['Journey']>, ParentType, ContextType>;
};

export type RadioOptionBlockResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['RadioOptionBlock'] = ResolversParentTypes['RadioOptionBlock']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  parentBlockId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RadioQuestionBlockResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['RadioQuestionBlock'] = ResolversParentTypes['RadioQuestionBlock']> = {
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  parentBlockId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  variant?: Resolver<Maybe<ResolversTypes['RadioQuestionVariant']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StepBlockResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['StepBlock'] = ResolversParentTypes['StepBlock']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  parentBlockId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VideoBlockResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['VideoBlock'] = ResolversParentTypes['VideoBlock']> = {
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  parentBlockId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  provider?: Resolver<Maybe<ResolversTypes['VideoProviderEnum']>, ParentType, ContextType>;
  src?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = GraphQLModules.Context> = {
  Block?: BlockResolvers<ContextType>;
  Journey?: JourneyResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RadioOptionBlock?: RadioOptionBlockResolvers<ContextType>;
  RadioQuestionBlock?: RadioQuestionBlockResolvers<ContextType>;
  StepBlock?: StepBlockResolvers<ContextType>;
  VideoBlock?: VideoBlockResolvers<ContextType>;
};


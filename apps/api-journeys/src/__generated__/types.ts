/* eslint-disable */
import { GraphQLResolveInfo } from 'graphql';
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

export type BaseBlock = {
  id: Scalars['ID'];
  parent?: Maybe<Block>;
};

export type Block = StepBlock | VideoBlock | RadioQuestionBlock | RadioOptionBlock;

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
  journeys: Array<Journey>;
  journey?: Maybe<Journey>;
};


export type QueryJourneyArgs = {
  id: Scalars['ID'];
};

export type RadioOptionBlock = BaseBlock & {
  __typename?: 'RadioOptionBlock';
  id: Scalars['ID'];
  parent?: Maybe<Block>;
  option: Scalars['String'];
  image: Scalars['String'];
};

export type RadioQuestionBlock = BaseBlock & {
  __typename?: 'RadioQuestionBlock';
  id: Scalars['ID'];
  parent?: Maybe<Block>;
  question: Scalars['String'];
};

export type StepBlock = BaseBlock & {
  __typename?: 'StepBlock';
  id: Scalars['ID'];
  parent?: Maybe<Block>;
};

export type VideoBlock = BaseBlock & {
  __typename?: 'VideoBlock';
  id: Scalars['ID'];
  parent?: Maybe<Block>;
  src: Scalars['String'];
  title: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  provider?: Maybe<VideoProviderEnum>;
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
  BaseBlock: ResolversTypes['RadioOptionBlock'] | ResolversTypes['RadioQuestionBlock'] | ResolversTypes['StepBlock'] | ResolversTypes['VideoBlock'];
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Block: ResolversTypes['StepBlock'] | ResolversTypes['VideoBlock'] | ResolversTypes['RadioQuestionBlock'] | ResolversTypes['RadioOptionBlock'];
  Journey: ResolverTypeWrapper<Omit<Journey, 'blocks'> & { blocks?: Maybe<Array<ResolversTypes['Block']>> }>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  RadioOptionBlock: ResolverTypeWrapper<Omit<RadioOptionBlock, 'parent'> & { parent?: Maybe<ResolversTypes['Block']> }>;
  RadioQuestionBlock: ResolverTypeWrapper<Omit<RadioQuestionBlock, 'parent'> & { parent?: Maybe<ResolversTypes['Block']> }>;
  StepBlock: ResolverTypeWrapper<Omit<StepBlock, 'parent'> & { parent?: Maybe<ResolversTypes['Block']> }>;
  VideoBlock: ResolverTypeWrapper<Omit<VideoBlock, 'parent'> & { parent?: Maybe<ResolversTypes['Block']> }>;
  VideoProviderEnum: VideoProviderEnum;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  BaseBlock: ResolversParentTypes['RadioOptionBlock'] | ResolversParentTypes['RadioQuestionBlock'] | ResolversParentTypes['StepBlock'] | ResolversParentTypes['VideoBlock'];
  ID: Scalars['ID'];
  Block: ResolversParentTypes['StepBlock'] | ResolversParentTypes['VideoBlock'] | ResolversParentTypes['RadioQuestionBlock'] | ResolversParentTypes['RadioOptionBlock'];
  Journey: Omit<Journey, 'blocks'> & { blocks?: Maybe<Array<ResolversParentTypes['Block']>> };
  Boolean: Scalars['Boolean'];
  String: Scalars['String'];
  Mutation: {};
  Query: {};
  RadioOptionBlock: Omit<RadioOptionBlock, 'parent'> & { parent?: Maybe<ResolversParentTypes['Block']> };
  RadioQuestionBlock: Omit<RadioQuestionBlock, 'parent'> & { parent?: Maybe<ResolversParentTypes['Block']> };
  StepBlock: Omit<StepBlock, 'parent'> & { parent?: Maybe<ResolversParentTypes['Block']> };
  VideoBlock: Omit<VideoBlock, 'parent'> & { parent?: Maybe<ResolversParentTypes['Block']> };
};

export type BaseBlockResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['BaseBlock'] = ResolversParentTypes['BaseBlock']> = {
  __resolveType: TypeResolveFn<'RadioOptionBlock' | 'RadioQuestionBlock' | 'StepBlock' | 'VideoBlock', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  parent?: Resolver<Maybe<ResolversTypes['Block']>, ParentType, ContextType>;
};

export type BlockResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['Block'] = ResolversParentTypes['Block']> = {
  __resolveType: TypeResolveFn<'StepBlock' | 'VideoBlock' | 'RadioQuestionBlock' | 'RadioOptionBlock', ParentType, ContextType>;
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
  journeys?: Resolver<Array<ResolversTypes['Journey']>, ParentType, ContextType>;
  journey?: Resolver<Maybe<ResolversTypes['Journey']>, ParentType, ContextType, RequireFields<QueryJourneyArgs, 'id'>>;
};

export type RadioOptionBlockResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['RadioOptionBlock'] = ResolversParentTypes['RadioOptionBlock']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  parent?: Resolver<Maybe<ResolversTypes['Block']>, ParentType, ContextType>;
  option?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  image?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RadioQuestionBlockResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['RadioQuestionBlock'] = ResolversParentTypes['RadioQuestionBlock']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  parent?: Resolver<Maybe<ResolversTypes['Block']>, ParentType, ContextType>;
  question?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StepBlockResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['StepBlock'] = ResolversParentTypes['StepBlock']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  parent?: Resolver<Maybe<ResolversTypes['Block']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VideoBlockResolvers<ContextType = GraphQLModules.Context, ParentType extends ResolversParentTypes['VideoBlock'] = ResolversParentTypes['VideoBlock']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  parent?: Resolver<Maybe<ResolversTypes['Block']>, ParentType, ContextType>;
  src?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  provider?: Resolver<Maybe<ResolversTypes['VideoProviderEnum']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = GraphQLModules.Context> = {
  BaseBlock?: BaseBlockResolvers<ContextType>;
  Block?: BlockResolvers<ContextType>;
  Journey?: JourneyResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RadioOptionBlock?: RadioOptionBlockResolvers<ContextType>;
  RadioQuestionBlock?: RadioQuestionBlockResolvers<ContextType>;
  StepBlock?: StepBlockResolvers<ContextType>;
  VideoBlock?: VideoBlockResolvers<ContextType>;
};


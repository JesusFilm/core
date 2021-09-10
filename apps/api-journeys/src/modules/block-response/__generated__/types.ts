/* eslint-disable */
import * as Types from "../../../__generated__/types";
import * as gm from "graphql-modules";
export namespace BlockResponseModule {
  interface DefinedFields {
    Mutation: 'journeySessionCreate' | 'signupBlockResponseCreate' | 'videoBlockResponseCreate' | 'radioQuestionBlockResponseCreate';
  };
  
  interface DefinedEnumValues {
    VideoBlockResponseStateEnum: 'PLAYING' | 'PAUSED' | 'FINISHED';
  };
  
  export type VideoBlockResponseStateEnum = DefinedEnumValues['VideoBlockResponseStateEnum'];
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
  
  export type MutationResolvers = Pick<Types.MutationResolvers, DefinedFields['Mutation']>;
  
  export interface Resolvers {
    Mutation?: MutationResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    Mutation?: {
      '*'?: gm.Middleware[];
      journeySessionCreate?: gm.Middleware[];
      signupBlockResponseCreate?: gm.Middleware[];
      videoBlockResponseCreate?: gm.Middleware[];
      radioQuestionBlockResponseCreate?: gm.Middleware[];
    };
  };
}
/* eslint-disable */
import * as Types from "../../../__generated__/types";
import * as gm from "graphql-modules";
export namespace BlockResponseModule {
  interface DefinedFields {
    JourneySession: 'journey' | 'name' | 'email';
    Mutation: 'journeySessionCreate' | 'signupBlockResponseCreate' | 'videoBlockResponseCreate' | 'radioQuestionBlockResponseCreate';
  };
  
  interface DefinedEnumValues {
    VideoBlockResponseStateEnum: 'PLAYING' | 'PAUSED' | 'FINISHED';
  };
  
  export type JourneySession = Pick<Types.JourneySession, DefinedFields['JourneySession']>;
  export type Journey = Types.Journey;
  export type VideoBlockResponseStateEnum = DefinedEnumValues['VideoBlockResponseStateEnum'];
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
  
  export type JourneySessionResolvers = Pick<Types.JourneySessionResolvers, DefinedFields['JourneySession'] | '__isTypeOf'>;
  export type MutationResolvers = Pick<Types.MutationResolvers, DefinedFields['Mutation']>;
  
  export interface Resolvers {
    JourneySession?: JourneySessionResolvers;
    Mutation?: MutationResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    JourneySession?: {
      '*'?: gm.Middleware[];
      journey?: gm.Middleware[];
      name?: gm.Middleware[];
      email?: gm.Middleware[];
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
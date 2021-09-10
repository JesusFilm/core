/* eslint-disable */
import * as Types from "../../../__generated__/types";
import * as gm from "graphql-modules";
export namespace BlockResponseModule {
  interface DefinedFields {
    JourneySession: 'journey' | 'name' | 'email' | 'blockResponses';
    SignupBlockResponse: 'journeySession' | 'block' | 'name' | 'email';
    VideoBlockResponse: 'journeySession' | 'block' | 'position' | 'state';
    RadioQuestionBlockResponse: 'journeySession' | 'block' | 'selectedOption';
    Mutation: 'journeySessionCreate' | 'blockResponseCreate';
    BlockResponse: 'journeySession' | 'block';
  };
  
  interface DefinedEnumValues {
    VideoBlockResponseStateEnum: 'PLAYING' | 'PAUSED' | 'FINISHED';
  };
  
  export type JourneySession = Pick<Types.JourneySession, DefinedFields['JourneySession']>;
  export type Journey = Types.Journey;
  export type BlockResponse = Pick<Types.BlockResponse, DefinedFields['BlockResponse']>;
  export type Block = Types.Block;
  export type SignupBlockResponse = Pick<Types.SignupBlockResponse, DefinedFields['SignupBlockResponse']>;
  export type VideoBlockResponse = Pick<Types.VideoBlockResponse, DefinedFields['VideoBlockResponse']>;
  export type VideoBlockResponseStateEnum = DefinedEnumValues['VideoBlockResponseStateEnum'];
  export type RadioQuestionBlockResponse = Pick<Types.RadioQuestionBlockResponse, DefinedFields['RadioQuestionBlockResponse']>;
  export type RadioOptionBlock = Types.RadioOptionBlock;
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
  
  export type JourneySessionResolvers = Pick<Types.JourneySessionResolvers, DefinedFields['JourneySession'] | '__isTypeOf'>;
  export type SignupBlockResponseResolvers = Pick<Types.SignupBlockResponseResolvers, DefinedFields['SignupBlockResponse'] | '__isTypeOf'>;
  export type VideoBlockResponseResolvers = Pick<Types.VideoBlockResponseResolvers, DefinedFields['VideoBlockResponse'] | '__isTypeOf'>;
  export type RadioQuestionBlockResponseResolvers = Pick<Types.RadioQuestionBlockResponseResolvers, DefinedFields['RadioQuestionBlockResponse'] | '__isTypeOf'>;
  export type MutationResolvers = Pick<Types.MutationResolvers, DefinedFields['Mutation']>;
  export type BlockResponseResolvers = Pick<Types.BlockResponseResolvers, DefinedFields['BlockResponse']>;
  
  export interface Resolvers {
    JourneySession?: JourneySessionResolvers;
    SignupBlockResponse?: SignupBlockResponseResolvers;
    VideoBlockResponse?: VideoBlockResponseResolvers;
    RadioQuestionBlockResponse?: RadioQuestionBlockResponseResolvers;
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
      blockResponses?: gm.Middleware[];
    };
    SignupBlockResponse?: {
      '*'?: gm.Middleware[];
      journeySession?: gm.Middleware[];
      block?: gm.Middleware[];
      name?: gm.Middleware[];
      email?: gm.Middleware[];
    };
    VideoBlockResponse?: {
      '*'?: gm.Middleware[];
      journeySession?: gm.Middleware[];
      block?: gm.Middleware[];
      position?: gm.Middleware[];
      state?: gm.Middleware[];
    };
    RadioQuestionBlockResponse?: {
      '*'?: gm.Middleware[];
      journeySession?: gm.Middleware[];
      block?: gm.Middleware[];
      selectedOption?: gm.Middleware[];
    };
    Mutation?: {
      '*'?: gm.Middleware[];
      journeySessionCreate?: gm.Middleware[];
      blockResponseCreate?: gm.Middleware[];
    };
  };
}
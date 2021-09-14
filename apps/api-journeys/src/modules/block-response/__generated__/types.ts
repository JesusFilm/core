/* eslint-disable */
import * as Types from "../../../__generated__/types";
import * as gm from "graphql-modules";
export namespace BlockResponseModule {
  interface DefinedFields {
    Mutation: 'signupBlockResponseCreate' | 'videoBlockResponseCreate' | 'radioQuestionBlockResponseCreate';
  };
  
  interface DefinedEnumValues {
    VideoBlockResponseStateEnum: 'PLAYING' | 'PAUSED' | 'FINISHED';
  };
  
  interface DefinedInputFields {
    SignupBlockResponseInput: 'userSessionId' | 'blockId' | 'name' | 'email';
    VideoBlockResponseInput: 'userSessionId' | 'blockId' | 'position' | 'state';
    RadioQuestionBlockResponseInput: 'userSessionId' | 'blockId' | 'selectedResponseBlockId';
  };
  
  export type VideoBlockResponseStateEnum = DefinedEnumValues['VideoBlockResponseStateEnum'];
  export type SignupBlockResponseInput = Pick<Types.SignupBlockResponseInput, DefinedInputFields['SignupBlockResponseInput']>;
  export type VideoBlockResponseInput = Pick<Types.VideoBlockResponseInput, DefinedInputFields['VideoBlockResponseInput']>;
  export type RadioQuestionBlockResponseInput = Pick<Types.RadioQuestionBlockResponseInput, DefinedInputFields['RadioQuestionBlockResponseInput']>;
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
      signupBlockResponseCreate?: gm.Middleware[];
      videoBlockResponseCreate?: gm.Middleware[];
      radioQuestionBlockResponseCreate?: gm.Middleware[];
    };
  };
}
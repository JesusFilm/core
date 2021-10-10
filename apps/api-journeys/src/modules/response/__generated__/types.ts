/* eslint-disable */
import * as Types from "../../../__generated__/types";
import * as gm from "graphql-modules";
export namespace ResponseModule {
  interface DefinedFields {
    RadioQuestionResponse: 'id' | 'userId' | 'radioOptionBlockId';
    VideoResponse: 'id' | 'userId' | 'state';
    Mutation: 'radioQuestionResponseCreate' | 'videoResponseCreate';
    Response: 'id' | 'userId';
  };
  
  interface DefinedEnumValues {
    VideoResponseStateEnum: 'PLAYING' | 'PAUSED' | 'FINISHED';
  };
  
  interface DefinedInputFields {
    RadioQuestionResponseCreateInput: 'id' | 'blockId' | 'radioOptionBlockId';
    VideoResponseCreateInput: 'id' | 'blockId' | 'state';
  };
  
  export type RadioQuestionResponseCreateInput = Pick<Types.RadioQuestionResponseCreateInput, DefinedInputFields['RadioQuestionResponseCreateInput']>;
  export type VideoResponseStateEnum = DefinedEnumValues['VideoResponseStateEnum'];
  export type VideoResponseCreateInput = Pick<Types.VideoResponseCreateInput, DefinedInputFields['VideoResponseCreateInput']>;
  export type Response = Pick<Types.Response, DefinedFields['Response']>;
  export type RadioQuestionResponse = Pick<Types.RadioQuestionResponse, DefinedFields['RadioQuestionResponse']>;
  export type VideoResponse = Pick<Types.VideoResponse, DefinedFields['VideoResponse']>;
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
  
  export type RadioQuestionResponseResolvers = Pick<Types.RadioQuestionResponseResolvers, DefinedFields['RadioQuestionResponse'] | '__isTypeOf'>;
  export type VideoResponseResolvers = Pick<Types.VideoResponseResolvers, DefinedFields['VideoResponse'] | '__isTypeOf'>;
  export type MutationResolvers = Pick<Types.MutationResolvers, DefinedFields['Mutation']>;
  export type ResponseResolvers = Pick<Types.ResponseResolvers, DefinedFields['Response']>;
  
  export interface Resolvers {
    RadioQuestionResponse?: RadioQuestionResponseResolvers;
    VideoResponse?: VideoResponseResolvers;
    Mutation?: MutationResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    RadioQuestionResponse?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      userId?: gm.Middleware[];
      radioOptionBlockId?: gm.Middleware[];
    };
    VideoResponse?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      userId?: gm.Middleware[];
      state?: gm.Middleware[];
    };
    Mutation?: {
      '*'?: gm.Middleware[];
      radioQuestionResponseCreate?: gm.Middleware[];
      videoResponseCreate?: gm.Middleware[];
    };
  };
}
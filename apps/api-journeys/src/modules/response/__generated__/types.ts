/* eslint-disable */
import * as Types from "../../../__generated__/types";
import * as gm from "graphql-modules";
export namespace ResponseModule {
  interface DefinedFields {
    RadioQuestionResponse: 'id' | 'userId' | 'radioOptionBlockId';
    SignUpResponse: 'id' | 'userId' | 'name' | 'email';
    VideoResponse: 'id' | 'userId' | 'state';
    Mutation: 'signUpResponseCreate' | 'radioQuestionResponseCreate' | 'videoResponseCreate';
    Response: 'id' | 'userId';
  };
  
  interface DefinedEnumValues {
    VideoResponseStateEnum: 'PLAYING' | 'PAUSED' | 'FINISHED';
  };
  
  interface DefinedInputFields {
    RadioQuestionResponseCreateInput: 'id' | 'blockId' | 'radioOptionBlockId';
    SignUpResponseCreateInput: 'id' | 'blockId' | 'name' | 'email';
    VideoResponseCreateInput: 'id' | 'blockId' | 'state';
  };
  
  export type RadioQuestionResponseCreateInput = Pick<Types.RadioQuestionResponseCreateInput, DefinedInputFields['RadioQuestionResponseCreateInput']>;
  export type SignUpResponseCreateInput = Pick<Types.SignUpResponseCreateInput, DefinedInputFields['SignUpResponseCreateInput']>;
  export type VideoResponseStateEnum = DefinedEnumValues['VideoResponseStateEnum'];
  export type VideoResponseCreateInput = Pick<Types.VideoResponseCreateInput, DefinedInputFields['VideoResponseCreateInput']>;
  export type Response = Pick<Types.Response, DefinedFields['Response']>;
  export type RadioQuestionResponse = Pick<Types.RadioQuestionResponse, DefinedFields['RadioQuestionResponse']>;
  export type SignUpResponse = Pick<Types.SignUpResponse, DefinedFields['SignUpResponse']>;
  export type VideoResponse = Pick<Types.VideoResponse, DefinedFields['VideoResponse']>;
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
  
  export type RadioQuestionResponseResolvers = Pick<Types.RadioQuestionResponseResolvers, DefinedFields['RadioQuestionResponse'] | '__isTypeOf'>;
  export type SignUpResponseResolvers = Pick<Types.SignUpResponseResolvers, DefinedFields['SignUpResponse'] | '__isTypeOf'>;
  export type VideoResponseResolvers = Pick<Types.VideoResponseResolvers, DefinedFields['VideoResponse'] | '__isTypeOf'>;
  export type MutationResolvers = Pick<Types.MutationResolvers, DefinedFields['Mutation']>;
  export type ResponseResolvers = Pick<Types.ResponseResolvers, DefinedFields['Response']>;
  
  export interface Resolvers {
    RadioQuestionResponse?: RadioQuestionResponseResolvers;
    SignUpResponse?: SignUpResponseResolvers;
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
    SignUpResponse?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      userId?: gm.Middleware[];
      name?: gm.Middleware[];
      email?: gm.Middleware[];
    };
    VideoResponse?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      userId?: gm.Middleware[];
      state?: gm.Middleware[];
    };
    Mutation?: {
      '*'?: gm.Middleware[];
      signUpResponseCreate?: gm.Middleware[];
      radioQuestionResponseCreate?: gm.Middleware[];
      videoResponseCreate?: gm.Middleware[];
    };
  };
}
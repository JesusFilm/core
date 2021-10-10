/* eslint-disable */
import * as Types from "../../../__generated__/types";
import * as gm from "graphql-modules";
export namespace ResponseModule {
  interface DefinedFields {
    VideoResponse: 'id' | 'userId' | 'state';
    Mutation: 'videoResponseCreate';
    Response: 'id' | 'userId';
  };
  
  interface DefinedEnumValues {
    VideoResponseStateEnum: 'PLAYING' | 'PAUSED' | 'FINISHED';
  };
  
  interface DefinedInputFields {
    VideoResponseCreateInput: 'id' | 'blockId' | 'state';
  };
  
  export type VideoResponseStateEnum = DefinedEnumValues['VideoResponseStateEnum'];
  export type VideoResponseCreateInput = Pick<Types.VideoResponseCreateInput, DefinedInputFields['VideoResponseCreateInput']>;
  export type Response = Pick<Types.Response, DefinedFields['Response']>;
  export type VideoResponse = Pick<Types.VideoResponse, DefinedFields['VideoResponse']>;
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
  
  export type VideoResponseResolvers = Pick<Types.VideoResponseResolvers, DefinedFields['VideoResponse'] | '__isTypeOf'>;
  export type MutationResolvers = Pick<Types.MutationResolvers, DefinedFields['Mutation']>;
  export type ResponseResolvers = Pick<Types.ResponseResolvers, DefinedFields['Response']>;
  
  export interface Resolvers {
    VideoResponse?: VideoResponseResolvers;
    Mutation?: MutationResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    VideoResponse?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      userId?: gm.Middleware[];
      state?: gm.Middleware[];
    };
    Mutation?: {
      '*'?: gm.Middleware[];
      videoResponseCreate?: gm.Middleware[];
    };
  };
}
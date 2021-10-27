/* eslint-disable */
import * as Types from "../../../__generated__/types";
import * as gm from "graphql-modules";
export namespace VideoModule {
  interface DefinedFields {
    VideoBlock: 'id' | 'parentBlockId' | 'mediaComponentId' | 'languageId' | 'src' | 'title' | 'startAt' | 'description' | 'volume' | 'autoplay';
    VideoResponse: 'id' | 'userId' | 'state' | 'position' | 'block';
    Mutation: 'videoResponseCreate';
  };
  
  interface DefinedEnumValues {
    VideoResponseStateEnum: 'PLAYING' | 'PAUSED' | 'FINISHED';
  };
  
  interface DefinedInputFields {
    VideoResponseCreateInput: 'id' | 'blockId' | 'state' | 'position';
  };
  
  export type VideoResponseStateEnum = DefinedEnumValues['VideoResponseStateEnum'];
  export type VideoResponseCreateInput = Pick<Types.VideoResponseCreateInput, DefinedInputFields['VideoResponseCreateInput']>;
  export type VideoBlock = Pick<Types.VideoBlock, DefinedFields['VideoBlock']>;
  export type Block = Types.Block;
  export type VideoResponse = Pick<Types.VideoResponse, DefinedFields['VideoResponse']>;
  export type Response = Types.Response;
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
  
  export type VideoBlockResolvers = Pick<Types.VideoBlockResolvers, DefinedFields['VideoBlock'] | '__isTypeOf'>;
  export type VideoResponseResolvers = Pick<Types.VideoResponseResolvers, DefinedFields['VideoResponse'] | '__isTypeOf'>;
  export type MutationResolvers = Pick<Types.MutationResolvers, DefinedFields['Mutation']>;
  
  export interface Resolvers {
    VideoBlock?: VideoBlockResolvers;
    VideoResponse?: VideoResponseResolvers;
    Mutation?: MutationResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    VideoBlock?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      parentBlockId?: gm.Middleware[];
      mediaComponentId?: gm.Middleware[];
      languageId?: gm.Middleware[];
      src?: gm.Middleware[];
      title?: gm.Middleware[];
      startAt?: gm.Middleware[];
      description?: gm.Middleware[];
      volume?: gm.Middleware[];
      autoplay?: gm.Middleware[];
    };
    VideoResponse?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      userId?: gm.Middleware[];
      state?: gm.Middleware[];
      position?: gm.Middleware[];
      block?: gm.Middleware[];
    };
    Mutation?: {
      '*'?: gm.Middleware[];
      videoResponseCreate?: gm.Middleware[];
    };
  };
}
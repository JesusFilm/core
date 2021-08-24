/* eslint-disable */
import * as Types from "../../../__generated__/types";
import * as gm from "graphql-modules";
export namespace BlockModule {
  interface DefinedFields {
    StepBlock: 'id' | 'parent';
    VideoBlock: 'id' | 'parent' | 'src' | 'title' | 'description' | 'provider';
    RadioQuestionBlock: 'id' | 'parent' | 'question';
    RadioOptionBlock: 'id' | 'parent' | 'option' | 'image';
    Journey: 'blocks';
    BaseBlock: 'id' | 'parent';
  };
  
  interface DefinedEnumValues {
    VideoProviderEnum: 'YOUTUBE' | 'VIMEO' | 'ARCLIGHT';
  };
  
  export type Journey = Types.Journey;
  export type Block = Types.Block;
  export type StepBlock = Pick<Types.StepBlock, DefinedFields['StepBlock']>;
  export type VideoBlock = Pick<Types.VideoBlock, DefinedFields['VideoBlock']>;
  export type RadioQuestionBlock = Pick<Types.RadioQuestionBlock, DefinedFields['RadioQuestionBlock']>;
  export type RadioOptionBlock = Pick<Types.RadioOptionBlock, DefinedFields['RadioOptionBlock']>;
  export type BaseBlock = Pick<Types.BaseBlock, DefinedFields['BaseBlock']>;
  export type VideoProviderEnum = DefinedEnumValues['VideoProviderEnum'];
  
  export type StepBlockResolvers = Pick<Types.StepBlockResolvers, DefinedFields['StepBlock'] | '__isTypeOf'>;
  export type VideoBlockResolvers = Pick<Types.VideoBlockResolvers, DefinedFields['VideoBlock'] | '__isTypeOf'>;
  export type RadioQuestionBlockResolvers = Pick<Types.RadioQuestionBlockResolvers, DefinedFields['RadioQuestionBlock'] | '__isTypeOf'>;
  export type RadioOptionBlockResolvers = Pick<Types.RadioOptionBlockResolvers, DefinedFields['RadioOptionBlock'] | '__isTypeOf'>;
  export type JourneyResolvers = Pick<Types.JourneyResolvers, DefinedFields['Journey']>;
  export type BaseBlockResolvers = Pick<Types.BaseBlockResolvers, DefinedFields['BaseBlock']>;
  
  export interface Resolvers {
    StepBlock?: StepBlockResolvers;
    VideoBlock?: VideoBlockResolvers;
    RadioQuestionBlock?: RadioQuestionBlockResolvers;
    RadioOptionBlock?: RadioOptionBlockResolvers;
    Journey?: JourneyResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    Journey?: {
      '*'?: gm.Middleware[];
      blocks?: gm.Middleware[];
    };
    StepBlock?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      parent?: gm.Middleware[];
    };
    VideoBlock?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      parent?: gm.Middleware[];
      src?: gm.Middleware[];
      title?: gm.Middleware[];
      description?: gm.Middleware[];
      provider?: gm.Middleware[];
    };
    RadioQuestionBlock?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      parent?: gm.Middleware[];
      question?: gm.Middleware[];
    };
    RadioOptionBlock?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      parent?: gm.Middleware[];
      option?: gm.Middleware[];
      image?: gm.Middleware[];
    };
  };
}
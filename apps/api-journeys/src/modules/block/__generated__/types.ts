/* eslint-disable */
import * as Types from "../../../__generated__/types";
import * as gm from "graphql-modules";
export namespace BlockModule {
  interface DefinedFields {
    StepBlock: 'id' | 'parentBlockId';
    VideoBlock: 'id' | 'parentBlockId' | 'src' | 'title' | 'description' | 'provider';
    RadioQuestionBlock: 'id' | 'parentBlockId' | 'label' | 'description' | 'variant';
    RadioOptionBlock: 'id' | 'parentBlockId' | 'label' | 'image';
    Journey: 'blocks';
    Block: 'id' | 'parentBlockId';
  };
  
  interface DefinedEnumValues {
    VideoProviderEnum: 'YOUTUBE' | 'VIMEO' | 'ARCLIGHT';
    RadioQuestionVariant: 'LIGHT' | 'DARK';
  };
  
  export type Journey = Types.Journey;
  export type Block = Pick<Types.Block, DefinedFields['Block']>;
  export type StepBlock = Pick<Types.StepBlock, DefinedFields['StepBlock']>;
  export type VideoBlock = Pick<Types.VideoBlock, DefinedFields['VideoBlock']>;
  export type VideoProviderEnum = DefinedEnumValues['VideoProviderEnum'];
  export type RadioQuestionVariant = DefinedEnumValues['RadioQuestionVariant'];
  export type RadioQuestionBlock = Pick<Types.RadioQuestionBlock, DefinedFields['RadioQuestionBlock']>;
  export type RadioOptionBlock = Pick<Types.RadioOptionBlock, DefinedFields['RadioOptionBlock']>;
  
  export type StepBlockResolvers = Pick<Types.StepBlockResolvers, DefinedFields['StepBlock'] | '__isTypeOf'>;
  export type VideoBlockResolvers = Pick<Types.VideoBlockResolvers, DefinedFields['VideoBlock'] | '__isTypeOf'>;
  export type RadioQuestionBlockResolvers = Pick<Types.RadioQuestionBlockResolvers, DefinedFields['RadioQuestionBlock'] | '__isTypeOf'>;
  export type RadioOptionBlockResolvers = Pick<Types.RadioOptionBlockResolvers, DefinedFields['RadioOptionBlock'] | '__isTypeOf'>;
  export type JourneyResolvers = Pick<Types.JourneyResolvers, DefinedFields['Journey']>;
  export type BlockResolvers = Pick<Types.BlockResolvers, DefinedFields['Block']>;
  
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
      parentBlockId?: gm.Middleware[];
    };
    VideoBlock?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      parentBlockId?: gm.Middleware[];
      src?: gm.Middleware[];
      title?: gm.Middleware[];
      description?: gm.Middleware[];
      provider?: gm.Middleware[];
    };
    RadioQuestionBlock?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      parentBlockId?: gm.Middleware[];
      label?: gm.Middleware[];
      description?: gm.Middleware[];
      variant?: gm.Middleware[];
    };
    RadioOptionBlock?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      parentBlockId?: gm.Middleware[];
      label?: gm.Middleware[];
      image?: gm.Middleware[];
    };
  };
}
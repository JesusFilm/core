/* eslint-disable */
import * as Types from "../../../__generated__/types";
import * as gm from "graphql-modules";
export namespace ImageModule {
  interface DefinedFields {
    ImageBlock: 'id' | 'parentBlockId' | 'src' | 'width' | 'height' | 'alt' | 'blurhash';
    Mutation: 'imageBlockCreate';
    Journey: 'primaryImageBlock';
  };
  
  interface DefinedInputFields {
    ImageBlockCreateInput: 'id' | 'parentBlockId' | 'journeyId' | 'src' | 'alt';
  };
  
  export type ImageBlockCreateInput = Pick<Types.ImageBlockCreateInput, DefinedInputFields['ImageBlockCreateInput']>;
  export type ImageBlock = Pick<Types.ImageBlock, DefinedFields['ImageBlock']>;
  export type Block = Types.Block;
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
  export type Journey = Types.Journey;
  
  export type ImageBlockResolvers = Pick<Types.ImageBlockResolvers, DefinedFields['ImageBlock'] | '__isTypeOf'>;
  export type MutationResolvers = Pick<Types.MutationResolvers, DefinedFields['Mutation']>;
  export type JourneyResolvers = Pick<Types.JourneyResolvers, DefinedFields['Journey']>;
  
  export interface Resolvers {
    ImageBlock?: ImageBlockResolvers;
    Mutation?: MutationResolvers;
    Journey?: JourneyResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    ImageBlock?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      parentBlockId?: gm.Middleware[];
      src?: gm.Middleware[];
      width?: gm.Middleware[];
      height?: gm.Middleware[];
      alt?: gm.Middleware[];
      blurhash?: gm.Middleware[];
    };
    Mutation?: {
      '*'?: gm.Middleware[];
      imageBlockCreate?: gm.Middleware[];
    };
    Journey?: {
      '*'?: gm.Middleware[];
      primaryImageBlock?: gm.Middleware[];
    };
  };
}
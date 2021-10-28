/* eslint-disable */
import * as Types from "../../../__generated__/types";
import * as gm from "graphql-modules";
export namespace ImageModule {
  interface DefinedFields {
    ImageBlock: 'id' | 'parentBlockId' | 'src' | 'width' | 'height' | 'alt';
    Journey: 'primaryImageBlock';
  };
  
  export type ImageBlock = Pick<Types.ImageBlock, DefinedFields['ImageBlock']>;
  export type Block = Types.Block;
  export type Journey = Types.Journey;
  
  export type ImageBlockResolvers = Pick<Types.ImageBlockResolvers, DefinedFields['ImageBlock'] | '__isTypeOf'>;
  export type JourneyResolvers = Pick<Types.JourneyResolvers, DefinedFields['Journey']>;
  
  export interface Resolvers {
    ImageBlock?: ImageBlockResolvers;
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
    };
    Journey?: {
      '*'?: gm.Middleware[];
      primaryImageBlock?: gm.Middleware[];
    };
  };
}
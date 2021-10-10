/* eslint-disable */
import * as Types from "../../../__generated__/types";
import * as gm from "graphql-modules";
export namespace ImageModule {
  interface DefinedFields {
    ImageBlock: 'id' | 'parentBlockId' | 'src' | 'width' | 'height' | 'alt';
  };
  
  export type ImageBlock = Pick<Types.ImageBlock, DefinedFields['ImageBlock']>;
  export type Block = Types.Block;
  
  export type ImageBlockResolvers = Pick<Types.ImageBlockResolvers, DefinedFields['ImageBlock'] | '__isTypeOf'>;
  
  export interface Resolvers {
    ImageBlock?: ImageBlockResolvers;
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
  };
}
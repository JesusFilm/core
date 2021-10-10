/* eslint-disable */
import * as Types from "../../../__generated__/types";
import * as gm from "graphql-modules";
export namespace BlockModule {
  interface DefinedFields {
    Journey: 'blocks';
    Block: 'id' | 'parentBlockId';
  };
  
  export type Block = Pick<Types.Block, DefinedFields['Block']>;
  export type Journey = Types.Journey;
  
  export type JourneyResolvers = Pick<Types.JourneyResolvers, DefinedFields['Journey']>;
  export type BlockResolvers = Pick<Types.BlockResolvers, DefinedFields['Block']>;
  
  export interface Resolvers {
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
  };
}
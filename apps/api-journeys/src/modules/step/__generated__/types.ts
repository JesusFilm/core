/* eslint-disable */
import * as Types from "../../../__generated__/types";
import * as gm from "graphql-modules";
export namespace StepModule {
  interface DefinedFields {
    StepBlock: 'id' | 'nextBlockId' | 'locked' | 'parentBlockId';
  };
  
  export type StepBlock = Pick<Types.StepBlock, DefinedFields['StepBlock']>;
  export type Block = Types.Block;
  
  export type StepBlockResolvers = Pick<Types.StepBlockResolvers, DefinedFields['StepBlock'] | '__isTypeOf'>;
  
  export interface Resolvers {
    StepBlock?: StepBlockResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    StepBlock?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      nextBlockId?: gm.Middleware[];
      locked?: gm.Middleware[];
      parentBlockId?: gm.Middleware[];
    };
  };
}
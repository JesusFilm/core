/* eslint-disable */
import * as Types from "../../../__generated__/types";
import * as gm from "graphql-modules";
export namespace TriggerModule {
  interface DefinedFields {
    TriggerBlock: 'id' | 'parentBlockId' | 'triggerStart' | 'action';
  };
  
  export type TriggerBlock = Pick<Types.TriggerBlock, DefinedFields['TriggerBlock']>;
  export type Action = Types.Action;
  export type Block = Types.Block;
  
  export type TriggerBlockResolvers = Pick<Types.TriggerBlockResolvers, DefinedFields['TriggerBlock'] | '__isTypeOf'>;
  
  export interface Resolvers {
    TriggerBlock?: TriggerBlockResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    TriggerBlock?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      parentBlockId?: gm.Middleware[];
      triggerStart?: gm.Middleware[];
      action?: gm.Middleware[];
    };
  };
}
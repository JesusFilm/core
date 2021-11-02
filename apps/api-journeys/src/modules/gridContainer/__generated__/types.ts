/* eslint-disable */
import * as Types from "../../../__generated__/types";
import * as gm from "graphql-modules";
export namespace GridContainerModule {
  interface DefinedFields {
    GridContainerBlock: 'id' | 'parentBlockId' | 'spacing' | 'direction' | 'justifyContent' | 'alignItems';
  };
  
  interface DefinedEnumValues {
    GridDirection: 'columnReverse' | 'column' | 'row' | 'rowReverse';
    GridJustifyContent: 'flexStart' | 'flexEnd' | 'center';
    GridAlignItems: 'baseline' | 'flexStart' | 'flexEnd' | 'center';
  };
  
  export type GridDirection = DefinedEnumValues['GridDirection'];
  export type GridJustifyContent = DefinedEnumValues['GridJustifyContent'];
  export type GridAlignItems = DefinedEnumValues['GridAlignItems'];
  export type GridContainerBlock = Pick<Types.GridContainerBlock, DefinedFields['GridContainerBlock']>;
  export type Block = Types.Block;
  
  export type GridContainerBlockResolvers = Pick<Types.GridContainerBlockResolvers, DefinedFields['GridContainerBlock'] | '__isTypeOf'>;
  
  export interface Resolvers {
    GridContainerBlock?: GridContainerBlockResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    GridContainerBlock?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      parentBlockId?: gm.Middleware[];
      spacing?: gm.Middleware[];
      direction?: gm.Middleware[];
      justifyContent?: gm.Middleware[];
      alignItems?: gm.Middleware[];
    };
  };
}
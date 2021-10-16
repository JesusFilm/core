/* eslint-disable */
import * as Types from "../../../__generated__/types";
import * as gm from "graphql-modules";
export namespace ButtonModule {
  interface DefinedFields {
    ButtonBlock: 'id' | 'parentBlockId' | 'label' | 'variant' | 'color' | 'size' | 'startIcon' | 'endIcon' | 'action';
  };
  
  interface DefinedEnumValues {
    ButtonVariant: 'text' | 'contained';
    ButtonColor: 'primary' | 'secondary' | 'error' | 'inherit';
    ButtonSize: 'small' | 'medium' | 'large';
  };
  
  export type ButtonVariant = DefinedEnumValues['ButtonVariant'];
  export type ButtonColor = DefinedEnumValues['ButtonColor'];
  export type ButtonSize = DefinedEnumValues['ButtonSize'];
  export type ButtonBlock = Pick<Types.ButtonBlock, DefinedFields['ButtonBlock']>;
  export type Icon = Types.Icon;
  export type Action = Types.Action;
  export type Block = Types.Block;
  
  export type ButtonBlockResolvers = Pick<Types.ButtonBlockResolvers, DefinedFields['ButtonBlock'] | '__isTypeOf'>;
  
  export interface Resolvers {
    ButtonBlock?: ButtonBlockResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    ButtonBlock?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      parentBlockId?: gm.Middleware[];
      label?: gm.Middleware[];
      variant?: gm.Middleware[];
      color?: gm.Middleware[];
      size?: gm.Middleware[];
      startIcon?: gm.Middleware[];
      endIcon?: gm.Middleware[];
      action?: gm.Middleware[];
    };
  };
}
/* eslint-disable */
import * as Types from "../../../__generated__/types";
import * as gm from "graphql-modules";
export namespace IconModule {
  interface DefinedFields {
    Icon: 'name' | 'color' | 'size';
  };
  
  interface DefinedEnumValues {
    IconName: 'PlayArrow' | 'Translate' | 'CheckCircle' | 'RadioButtonUnchecked' | 'FormatQuote' | 'LockOpen' | 'ArrowForward' | 'ChatBubbleOutline' | 'LiveTv' | 'MenuBook' | 'ChevronRight' | 'BeenhereRounded' | 'SendRounded' | 'SubscriptionsRounded' | 'ContactSupport';
    IconColor: 'primary' | 'secondary' | 'action' | 'error' | 'disabled' | 'inherit';
    IconSize: 'sm' | 'md' | 'lg' | 'xl' | 'inherit';
  };
  
  export type IconName = DefinedEnumValues['IconName'];
  export type IconColor = DefinedEnumValues['IconColor'];
  export type IconSize = DefinedEnumValues['IconSize'];
  export type Icon = Pick<Types.Icon, DefinedFields['Icon']>;
  
  export type IconResolvers = Pick<Types.IconResolvers, DefinedFields['Icon'] | '__isTypeOf'>;
  
  export interface Resolvers {
    Icon?: IconResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    Icon?: {
      '*'?: gm.Middleware[];
      name?: gm.Middleware[];
      color?: gm.Middleware[];
      size?: gm.Middleware[];
    };
  };
}
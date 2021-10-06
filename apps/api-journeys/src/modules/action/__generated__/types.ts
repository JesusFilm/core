/* eslint-disable */
import * as Types from "../../../__generated__/types";
import * as gm from "graphql-modules";
export namespace ActionModule {
  interface DefinedFields {
    NavigateAction: 'gtmEventName';
    NavigateToBlockAction: 'gtmEventName' | 'blockId';
    NavigateToJourneyAction: 'gtmEventName' | 'journeyId';
    LinkAction: 'gtmEventName' | 'url' | 'target';
    ButtonBlock: 'action';
    RadioOptionBlock: 'action';
    SignUpBlock: 'action';
    Action: 'gtmEventName';
  };
  
  export type Action = Pick<Types.Action, DefinedFields['Action']>;
  export type NavigateAction = Pick<Types.NavigateAction, DefinedFields['NavigateAction']>;
  export type NavigateToBlockAction = Pick<Types.NavigateToBlockAction, DefinedFields['NavigateToBlockAction']>;
  export type NavigateToJourneyAction = Pick<Types.NavigateToJourneyAction, DefinedFields['NavigateToJourneyAction']>;
  export type LinkAction = Pick<Types.LinkAction, DefinedFields['LinkAction']>;
  export type ButtonBlock = Types.ButtonBlock;
  export type RadioOptionBlock = Types.RadioOptionBlock;
  export type SignUpBlock = Types.SignUpBlock;
  
  export type NavigateActionResolvers = Pick<Types.NavigateActionResolvers, DefinedFields['NavigateAction'] | '__isTypeOf'>;
  export type NavigateToBlockActionResolvers = Pick<Types.NavigateToBlockActionResolvers, DefinedFields['NavigateToBlockAction'] | '__isTypeOf'>;
  export type NavigateToJourneyActionResolvers = Pick<Types.NavigateToJourneyActionResolvers, DefinedFields['NavigateToJourneyAction'] | '__isTypeOf'>;
  export type LinkActionResolvers = Pick<Types.LinkActionResolvers, DefinedFields['LinkAction'] | '__isTypeOf'>;
  export type ButtonBlockResolvers = Pick<Types.ButtonBlockResolvers, DefinedFields['ButtonBlock']>;
  export type RadioOptionBlockResolvers = Pick<Types.RadioOptionBlockResolvers, DefinedFields['RadioOptionBlock']>;
  export type SignUpBlockResolvers = Pick<Types.SignUpBlockResolvers, DefinedFields['SignUpBlock']>;
  export type ActionResolvers = Pick<Types.ActionResolvers, DefinedFields['Action']>;
  
  export interface Resolvers {
    NavigateAction?: NavigateActionResolvers;
    NavigateToBlockAction?: NavigateToBlockActionResolvers;
    NavigateToJourneyAction?: NavigateToJourneyActionResolvers;
    LinkAction?: LinkActionResolvers;
    ButtonBlock?: ButtonBlockResolvers;
    RadioOptionBlock?: RadioOptionBlockResolvers;
    SignUpBlock?: SignUpBlockResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    NavigateAction?: {
      '*'?: gm.Middleware[];
      gtmEventName?: gm.Middleware[];
    };
    NavigateToBlockAction?: {
      '*'?: gm.Middleware[];
      gtmEventName?: gm.Middleware[];
      blockId?: gm.Middleware[];
    };
    NavigateToJourneyAction?: {
      '*'?: gm.Middleware[];
      gtmEventName?: gm.Middleware[];
      journeyId?: gm.Middleware[];
    };
    LinkAction?: {
      '*'?: gm.Middleware[];
      gtmEventName?: gm.Middleware[];
      url?: gm.Middleware[];
      target?: gm.Middleware[];
    };
    ButtonBlock?: {
      '*'?: gm.Middleware[];
      action?: gm.Middleware[];
    };
    RadioOptionBlock?: {
      '*'?: gm.Middleware[];
      action?: gm.Middleware[];
    };
    SignUpBlock?: {
      '*'?: gm.Middleware[];
      action?: gm.Middleware[];
    };
  };
}
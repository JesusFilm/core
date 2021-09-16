/* eslint-disable */
import * as Types from "../../../__generated__/types";
import * as gm from "graphql-modules";
export namespace BlockModule {
  interface DefinedFields {
    StepBlock: 'id' | 'nextBlockId' | 'locked' | 'parentBlockId';
    VideoBlock: 'id' | 'parentBlockId' | 'src' | 'title' | 'description' | 'provider';
    RadioQuestionBlock: 'id' | 'parentBlockId' | 'label' | 'description' | 'variant';
    NavigateAction: 'gtmEventName';
    NavigateToBlockAction: 'gtmEventName' | 'blockId';
    NavigateToJourneyAction: 'gtmEventName' | 'journeyId';
    LinkAction: 'gtmEventName' | 'url' | 'target';
    RadioOptionBlock: 'id' | 'parentBlockId' | 'label' | 'action';
    Icon: 'name' | 'color' | 'size';
    ButtonBlock: 'id' | 'parentBlockId' | 'label' | 'variant' | 'color' | 'size' | 'startIcon' | 'endIcon' | 'action';
    Journey: 'blocks';
    Block: 'id' | 'parentBlockId';
    Action: 'gtmEventName';
  };
  
  interface DefinedEnumValues {
    VideoProviderEnum: 'YOUTUBE' | 'VIMEO' | 'ARCLIGHT';
    RadioQuestionVariant: 'LIGHT' | 'DARK';
    IconName: 'PlayArrow' | 'Translate' | 'CheckCircle' | 'RadioButtonUnchecked' | 'FormatQuote' | 'LockOpen' | 'ArrowForward' | 'ChatBubbleOutline' | 'LiveTv' | 'MenuBook';
    IconColor: 'primary' | 'secondary' | 'action' | 'error' | 'disabled';
    IconSize: 'small' | 'medium' | 'large' | 'inherit';
    ButtonBlockVariant: 'text' | 'outlined' | 'contained';
    ButtonColor: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' | 'inherit';
    ButtonSize: 'small' | 'medium' | 'large';
  };
  
  export type Journey = Types.Journey;
  export type Block = Pick<Types.Block, DefinedFields['Block']>;
  export type StepBlock = Pick<Types.StepBlock, DefinedFields['StepBlock']>;
  export type VideoProviderEnum = DefinedEnumValues['VideoProviderEnum'];
  export type VideoBlock = Pick<Types.VideoBlock, DefinedFields['VideoBlock']>;
  export type RadioQuestionVariant = DefinedEnumValues['RadioQuestionVariant'];
  export type RadioQuestionBlock = Pick<Types.RadioQuestionBlock, DefinedFields['RadioQuestionBlock']>;
  export type Action = Pick<Types.Action, DefinedFields['Action']>;
  export type NavigateAction = Pick<Types.NavigateAction, DefinedFields['NavigateAction']>;
  export type NavigateToBlockAction = Pick<Types.NavigateToBlockAction, DefinedFields['NavigateToBlockAction']>;
  export type NavigateToJourneyAction = Pick<Types.NavigateToJourneyAction, DefinedFields['NavigateToJourneyAction']>;
  export type LinkAction = Pick<Types.LinkAction, DefinedFields['LinkAction']>;
  export type RadioOptionBlock = Pick<Types.RadioOptionBlock, DefinedFields['RadioOptionBlock']>;
  export type IconName = DefinedEnumValues['IconName'];
  export type IconColor = DefinedEnumValues['IconColor'];
  export type IconSize = DefinedEnumValues['IconSize'];
  export type Icon = Pick<Types.Icon, DefinedFields['Icon']>;
  export type ButtonBlockVariant = DefinedEnumValues['ButtonBlockVariant'];
  export type ButtonColor = DefinedEnumValues['ButtonColor'];
  export type ButtonSize = DefinedEnumValues['ButtonSize'];
  export type ButtonBlock = Pick<Types.ButtonBlock, DefinedFields['ButtonBlock']>;
  
  export type StepBlockResolvers = Pick<Types.StepBlockResolvers, DefinedFields['StepBlock'] | '__isTypeOf'>;
  export type VideoBlockResolvers = Pick<Types.VideoBlockResolvers, DefinedFields['VideoBlock'] | '__isTypeOf'>;
  export type RadioQuestionBlockResolvers = Pick<Types.RadioQuestionBlockResolvers, DefinedFields['RadioQuestionBlock'] | '__isTypeOf'>;
  export type NavigateActionResolvers = Pick<Types.NavigateActionResolvers, DefinedFields['NavigateAction'] | '__isTypeOf'>;
  export type NavigateToBlockActionResolvers = Pick<Types.NavigateToBlockActionResolvers, DefinedFields['NavigateToBlockAction'] | '__isTypeOf'>;
  export type NavigateToJourneyActionResolvers = Pick<Types.NavigateToJourneyActionResolvers, DefinedFields['NavigateToJourneyAction'] | '__isTypeOf'>;
  export type LinkActionResolvers = Pick<Types.LinkActionResolvers, DefinedFields['LinkAction'] | '__isTypeOf'>;
  export type RadioOptionBlockResolvers = Pick<Types.RadioOptionBlockResolvers, DefinedFields['RadioOptionBlock'] | '__isTypeOf'>;
  export type IconResolvers = Pick<Types.IconResolvers, DefinedFields['Icon'] | '__isTypeOf'>;
  export type ButtonBlockResolvers = Pick<Types.ButtonBlockResolvers, DefinedFields['ButtonBlock'] | '__isTypeOf'>;
  export type JourneyResolvers = Pick<Types.JourneyResolvers, DefinedFields['Journey']>;
  export type BlockResolvers = Pick<Types.BlockResolvers, DefinedFields['Block']>;
  export type ActionResolvers = Pick<Types.ActionResolvers, DefinedFields['Action']>;
  
  export interface Resolvers {
    StepBlock?: StepBlockResolvers;
    VideoBlock?: VideoBlockResolvers;
    RadioQuestionBlock?: RadioQuestionBlockResolvers;
    NavigateAction?: NavigateActionResolvers;
    NavigateToBlockAction?: NavigateToBlockActionResolvers;
    NavigateToJourneyAction?: NavigateToJourneyActionResolvers;
    LinkAction?: LinkActionResolvers;
    RadioOptionBlock?: RadioOptionBlockResolvers;
    Icon?: IconResolvers;
    ButtonBlock?: ButtonBlockResolvers;
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
    StepBlock?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      nextBlockId?: gm.Middleware[];
      locked?: gm.Middleware[];
      parentBlockId?: gm.Middleware[];
    };
    VideoBlock?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      parentBlockId?: gm.Middleware[];
      src?: gm.Middleware[];
      title?: gm.Middleware[];
      description?: gm.Middleware[];
      provider?: gm.Middleware[];
    };
    RadioQuestionBlock?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      parentBlockId?: gm.Middleware[];
      label?: gm.Middleware[];
      description?: gm.Middleware[];
      variant?: gm.Middleware[];
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
    RadioOptionBlock?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      parentBlockId?: gm.Middleware[];
      label?: gm.Middleware[];
      action?: gm.Middleware[];
    };
    Icon?: {
      '*'?: gm.Middleware[];
      name?: gm.Middleware[];
      color?: gm.Middleware[];
      size?: gm.Middleware[];
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
/* eslint-disable */
import * as Types from "../../../__generated__/types";
import * as gm from "graphql-modules";
export namespace BlockModule {
  interface DefinedFields {
    NavigateAction: 'gtmEventName';
    NavigateToBlockAction: 'gtmEventName' | 'blockId';
    NavigateToJourneyAction: 'gtmEventName' | 'journeyId';
    LinkAction: 'gtmEventName' | 'url' | 'target';
    RadioOptionBlock: 'id' | 'parentBlockId' | 'label' | 'action';
    RadioQuestionBlock: 'id' | 'parentBlockId' | 'label' | 'description' | 'variant';
    SignupBlock: 'id' | 'parentBlockId' | 'action';
    StepBlock: 'id' | 'nextBlockId' | 'locked' | 'parentBlockId';
    TypographyBlock: 'id' | 'parentBlockId' | 'content' | 'variant' | 'color' | 'align';
    VideoBlock: 'id' | 'parentBlockId' | 'src' | 'title' | 'description' | 'volume' | 'autoplay';
    Icon: 'name' | 'color' | 'size';
    ButtonBlock: 'id' | 'parentBlockId' | 'label' | 'variant' | 'color' | 'size' | 'startIcon' | 'endIcon' | 'action';
    Journey: 'blocks';
    RadioQuestionResponse: 'block';
    SignupResponse: 'block';
    VideoResponse: 'block';
    Action: 'gtmEventName';
    Block: 'id' | 'parentBlockId';
  };
  
  interface DefinedEnumValues {
    RadioQuestionVariant: 'LIGHT' | 'DARK';
    TypographyVariant: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2' | 'caption' | 'overline';
    TypographyColor: 'primary' | 'secondary' | 'error';
    TypographyAlign: 'left' | 'center' | 'right';
    IconName: 'PlayArrow' | 'Translate' | 'CheckCircle' | 'RadioButtonUnchecked' | 'FormatQuote' | 'LockOpen' | 'ArrowForward' | 'ChatBubbleOutline' | 'LiveTv' | 'MenuBook';
    IconColor: 'primary' | 'secondary' | 'action' | 'error' | 'disabled' | 'inherit';
    IconSize: 'sm' | 'md' | 'lg' | 'xl' | 'inherit';
    ButtonVariant: 'text' | 'contained';
    ButtonColor: 'primary' | 'secondary' | 'error' | 'inherit';
    ButtonSize: 'small' | 'medium' | 'large';
  };
  
  export type Action = Pick<Types.Action, DefinedFields['Action']>;
  export type NavigateAction = Pick<Types.NavigateAction, DefinedFields['NavigateAction']>;
  export type NavigateToBlockAction = Pick<Types.NavigateToBlockAction, DefinedFields['NavigateToBlockAction']>;
  export type NavigateToJourneyAction = Pick<Types.NavigateToJourneyAction, DefinedFields['NavigateToJourneyAction']>;
  export type LinkAction = Pick<Types.LinkAction, DefinedFields['LinkAction']>;
  export type Block = Pick<Types.Block, DefinedFields['Block']>;
  export type RadioOptionBlock = Pick<Types.RadioOptionBlock, DefinedFields['RadioOptionBlock']>;
  export type RadioQuestionVariant = DefinedEnumValues['RadioQuestionVariant'];
  export type RadioQuestionBlock = Pick<Types.RadioQuestionBlock, DefinedFields['RadioQuestionBlock']>;
  export type SignupBlock = Pick<Types.SignupBlock, DefinedFields['SignupBlock']>;
  export type StepBlock = Pick<Types.StepBlock, DefinedFields['StepBlock']>;
  export type TypographyVariant = DefinedEnumValues['TypographyVariant'];
  export type TypographyColor = DefinedEnumValues['TypographyColor'];
  export type TypographyAlign = DefinedEnumValues['TypographyAlign'];
  export type TypographyBlock = Pick<Types.TypographyBlock, DefinedFields['TypographyBlock']>;
  export type VideoBlock = Pick<Types.VideoBlock, DefinedFields['VideoBlock']>;
  export type Journey = Types.Journey;
  export type RadioQuestionResponse = Types.RadioQuestionResponse;
  export type SignupResponse = Types.SignupResponse;
  export type VideoResponse = Types.VideoResponse;
  export type IconName = DefinedEnumValues['IconName'];
  export type IconColor = DefinedEnumValues['IconColor'];
  export type IconSize = DefinedEnumValues['IconSize'];
  export type Icon = Pick<Types.Icon, DefinedFields['Icon']>;
  export type ButtonVariant = DefinedEnumValues['ButtonVariant'];
  export type ButtonColor = DefinedEnumValues['ButtonColor'];
  export type ButtonSize = DefinedEnumValues['ButtonSize'];
  export type ButtonBlock = Pick<Types.ButtonBlock, DefinedFields['ButtonBlock']>;
  
  export type NavigateActionResolvers = Pick<Types.NavigateActionResolvers, DefinedFields['NavigateAction'] | '__isTypeOf'>;
  export type NavigateToBlockActionResolvers = Pick<Types.NavigateToBlockActionResolvers, DefinedFields['NavigateToBlockAction'] | '__isTypeOf'>;
  export type NavigateToJourneyActionResolvers = Pick<Types.NavigateToJourneyActionResolvers, DefinedFields['NavigateToJourneyAction'] | '__isTypeOf'>;
  export type LinkActionResolvers = Pick<Types.LinkActionResolvers, DefinedFields['LinkAction'] | '__isTypeOf'>;
  export type RadioOptionBlockResolvers = Pick<Types.RadioOptionBlockResolvers, DefinedFields['RadioOptionBlock'] | '__isTypeOf'>;
  export type RadioQuestionBlockResolvers = Pick<Types.RadioQuestionBlockResolvers, DefinedFields['RadioQuestionBlock'] | '__isTypeOf'>;
  export type SignupBlockResolvers = Pick<Types.SignupBlockResolvers, DefinedFields['SignupBlock'] | '__isTypeOf'>;
  export type StepBlockResolvers = Pick<Types.StepBlockResolvers, DefinedFields['StepBlock'] | '__isTypeOf'>;
  export type TypographyBlockResolvers = Pick<Types.TypographyBlockResolvers, DefinedFields['TypographyBlock'] | '__isTypeOf'>;
  export type VideoBlockResolvers = Pick<Types.VideoBlockResolvers, DefinedFields['VideoBlock'] | '__isTypeOf'>;
  export type IconResolvers = Pick<Types.IconResolvers, DefinedFields['Icon'] | '__isTypeOf'>;
  export type ButtonBlockResolvers = Pick<Types.ButtonBlockResolvers, DefinedFields['ButtonBlock'] | '__isTypeOf'>;
  export type JourneyResolvers = Pick<Types.JourneyResolvers, DefinedFields['Journey']>;
  export type RadioQuestionResponseResolvers = Pick<Types.RadioQuestionResponseResolvers, DefinedFields['RadioQuestionResponse']>;
  export type SignupResponseResolvers = Pick<Types.SignupResponseResolvers, DefinedFields['SignupResponse']>;
  export type VideoResponseResolvers = Pick<Types.VideoResponseResolvers, DefinedFields['VideoResponse']>;
  export type ActionResolvers = Pick<Types.ActionResolvers, DefinedFields['Action']>;
  export type BlockResolvers = Pick<Types.BlockResolvers, DefinedFields['Block']>;
  
  export interface Resolvers {
    NavigateAction?: NavigateActionResolvers;
    NavigateToBlockAction?: NavigateToBlockActionResolvers;
    NavigateToJourneyAction?: NavigateToJourneyActionResolvers;
    LinkAction?: LinkActionResolvers;
    RadioOptionBlock?: RadioOptionBlockResolvers;
    RadioQuestionBlock?: RadioQuestionBlockResolvers;
    SignupBlock?: SignupBlockResolvers;
    StepBlock?: StepBlockResolvers;
    TypographyBlock?: TypographyBlockResolvers;
    VideoBlock?: VideoBlockResolvers;
    Icon?: IconResolvers;
    ButtonBlock?: ButtonBlockResolvers;
    Journey?: JourneyResolvers;
    RadioQuestionResponse?: RadioQuestionResponseResolvers;
    SignupResponse?: SignupResponseResolvers;
    VideoResponse?: VideoResponseResolvers;
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
    RadioOptionBlock?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      parentBlockId?: gm.Middleware[];
      label?: gm.Middleware[];
      action?: gm.Middleware[];
    };
    RadioQuestionBlock?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      parentBlockId?: gm.Middleware[];
      label?: gm.Middleware[];
      description?: gm.Middleware[];
      variant?: gm.Middleware[];
    };
    SignupBlock?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      parentBlockId?: gm.Middleware[];
      action?: gm.Middleware[];
    };
    StepBlock?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      nextBlockId?: gm.Middleware[];
      locked?: gm.Middleware[];
      parentBlockId?: gm.Middleware[];
    };
    TypographyBlock?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      parentBlockId?: gm.Middleware[];
      content?: gm.Middleware[];
      variant?: gm.Middleware[];
      color?: gm.Middleware[];
      align?: gm.Middleware[];
    };
    VideoBlock?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      parentBlockId?: gm.Middleware[];
      src?: gm.Middleware[];
      title?: gm.Middleware[];
      description?: gm.Middleware[];
      volume?: gm.Middleware[];
      autoplay?: gm.Middleware[];
    };
    Journey?: {
      '*'?: gm.Middleware[];
      blocks?: gm.Middleware[];
    };
    RadioQuestionResponse?: {
      '*'?: gm.Middleware[];
      block?: gm.Middleware[];
    };
    SignupResponse?: {
      '*'?: gm.Middleware[];
      block?: gm.Middleware[];
    };
    VideoResponse?: {
      '*'?: gm.Middleware[];
      block?: gm.Middleware[];
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
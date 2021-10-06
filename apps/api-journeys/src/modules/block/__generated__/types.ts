/* eslint-disable */
import * as Types from "../../../__generated__/types";
import * as gm from "graphql-modules";
export namespace BlockModule {
  interface DefinedFields {
    Icon: 'name' | 'color' | 'size';
    ButtonBlock: 'id' | 'parentBlockId' | 'label' | 'variant' | 'color' | 'size' | 'startIcon' | 'endIcon' | 'action';
    CardBlock: 'id' | 'parentBlockId' | 'backgroundColor' | 'coverBlockId' | 'themeMode' | 'themeName';
    ImageBlock: 'id' | 'parentBlockId' | 'src' | 'width' | 'height' | 'alt';
    RadioOptionBlock: 'id' | 'parentBlockId' | 'label' | 'action';
    RadioQuestionBlock: 'id' | 'parentBlockId' | 'label' | 'description';
    SignUpBlock: 'id' | 'parentBlockId' | 'action' | 'submitIcon' | 'submitLabel';
    StepBlock: 'id' | 'nextBlockId' | 'locked' | 'parentBlockId';
    TypographyBlock: 'id' | 'parentBlockId' | 'content' | 'variant' | 'color' | 'align';
    VideoBlock: 'id' | 'parentBlockId' | 'src' | 'title' | 'description' | 'volume' | 'autoplay';
    Journey: 'blocks';
    RadioQuestionResponse: 'block';
    SignUpResponse: 'block';
    VideoResponse: 'block';
    Block: 'id' | 'parentBlockId';
  };
  
  interface DefinedEnumValues {
    IconName: 'PlayArrow' | 'Translate' | 'CheckCircle' | 'RadioButtonUnchecked' | 'FormatQuote' | 'LockOpen' | 'ArrowForward' | 'ChatBubbleOutline' | 'LiveTv' | 'MenuBook';
    IconColor: 'primary' | 'secondary' | 'action' | 'error' | 'disabled' | 'inherit';
    IconSize: 'sm' | 'md' | 'lg' | 'xl' | 'inherit';
    ButtonVariant: 'text' | 'contained';
    ButtonColor: 'primary' | 'secondary' | 'error' | 'inherit';
    ButtonSize: 'small' | 'medium' | 'large';
    TypographyVariant: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2' | 'caption' | 'overline';
    TypographyColor: 'primary' | 'secondary' | 'error';
    TypographyAlign: 'left' | 'center' | 'right';
  };
  
  export type Block = Pick<Types.Block, DefinedFields['Block']>;
  export type IconName = DefinedEnumValues['IconName'];
  export type IconColor = DefinedEnumValues['IconColor'];
  export type IconSize = DefinedEnumValues['IconSize'];
  export type Icon = Pick<Types.Icon, DefinedFields['Icon']>;
  export type ButtonVariant = DefinedEnumValues['ButtonVariant'];
  export type ButtonColor = DefinedEnumValues['ButtonColor'];
  export type ButtonSize = DefinedEnumValues['ButtonSize'];
  export type ButtonBlock = Pick<Types.ButtonBlock, DefinedFields['ButtonBlock']>;
  export type Action = Types.Action;
  export type CardBlock = Pick<Types.CardBlock, DefinedFields['CardBlock']>;
  export type ThemeMode = Types.ThemeMode;
  export type ThemeName = Types.ThemeName;
  export type ImageBlock = Pick<Types.ImageBlock, DefinedFields['ImageBlock']>;
  export type RadioOptionBlock = Pick<Types.RadioOptionBlock, DefinedFields['RadioOptionBlock']>;
  export type RadioQuestionBlock = Pick<Types.RadioQuestionBlock, DefinedFields['RadioQuestionBlock']>;
  export type SignUpBlock = Pick<Types.SignUpBlock, DefinedFields['SignUpBlock']>;
  export type StepBlock = Pick<Types.StepBlock, DefinedFields['StepBlock']>;
  export type TypographyVariant = DefinedEnumValues['TypographyVariant'];
  export type TypographyColor = DefinedEnumValues['TypographyColor'];
  export type TypographyAlign = DefinedEnumValues['TypographyAlign'];
  export type TypographyBlock = Pick<Types.TypographyBlock, DefinedFields['TypographyBlock']>;
  export type VideoBlock = Pick<Types.VideoBlock, DefinedFields['VideoBlock']>;
  export type Journey = Types.Journey;
  export type RadioQuestionResponse = Types.RadioQuestionResponse;
  export type SignUpResponse = Types.SignUpResponse;
  export type VideoResponse = Types.VideoResponse;
  
  export type IconResolvers = Pick<Types.IconResolvers, DefinedFields['Icon'] | '__isTypeOf'>;
  export type ButtonBlockResolvers = Pick<Types.ButtonBlockResolvers, DefinedFields['ButtonBlock'] | '__isTypeOf'>;
  export type CardBlockResolvers = Pick<Types.CardBlockResolvers, DefinedFields['CardBlock'] | '__isTypeOf'>;
  export type ImageBlockResolvers = Pick<Types.ImageBlockResolvers, DefinedFields['ImageBlock'] | '__isTypeOf'>;
  export type RadioOptionBlockResolvers = Pick<Types.RadioOptionBlockResolvers, DefinedFields['RadioOptionBlock'] | '__isTypeOf'>;
  export type RadioQuestionBlockResolvers = Pick<Types.RadioQuestionBlockResolvers, DefinedFields['RadioQuestionBlock'] | '__isTypeOf'>;
  export type SignUpBlockResolvers = Pick<Types.SignUpBlockResolvers, DefinedFields['SignUpBlock'] | '__isTypeOf'>;
  export type StepBlockResolvers = Pick<Types.StepBlockResolvers, DefinedFields['StepBlock'] | '__isTypeOf'>;
  export type TypographyBlockResolvers = Pick<Types.TypographyBlockResolvers, DefinedFields['TypographyBlock'] | '__isTypeOf'>;
  export type VideoBlockResolvers = Pick<Types.VideoBlockResolvers, DefinedFields['VideoBlock'] | '__isTypeOf'>;
  export type JourneyResolvers = Pick<Types.JourneyResolvers, DefinedFields['Journey']>;
  export type RadioQuestionResponseResolvers = Pick<Types.RadioQuestionResponseResolvers, DefinedFields['RadioQuestionResponse']>;
  export type SignUpResponseResolvers = Pick<Types.SignUpResponseResolvers, DefinedFields['SignUpResponse']>;
  export type VideoResponseResolvers = Pick<Types.VideoResponseResolvers, DefinedFields['VideoResponse']>;
  export type BlockResolvers = Pick<Types.BlockResolvers, DefinedFields['Block']>;
  
  export interface Resolvers {
    Icon?: IconResolvers;
    ButtonBlock?: ButtonBlockResolvers;
    CardBlock?: CardBlockResolvers;
    ImageBlock?: ImageBlockResolvers;
    RadioOptionBlock?: RadioOptionBlockResolvers;
    RadioQuestionBlock?: RadioQuestionBlockResolvers;
    SignUpBlock?: SignUpBlockResolvers;
    StepBlock?: StepBlockResolvers;
    TypographyBlock?: TypographyBlockResolvers;
    VideoBlock?: VideoBlockResolvers;
    Journey?: JourneyResolvers;
    RadioQuestionResponse?: RadioQuestionResponseResolvers;
    SignUpResponse?: SignUpResponseResolvers;
    VideoResponse?: VideoResponseResolvers;
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
    CardBlock?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      parentBlockId?: gm.Middleware[];
      backgroundColor?: gm.Middleware[];
      coverBlockId?: gm.Middleware[];
      themeMode?: gm.Middleware[];
      themeName?: gm.Middleware[];
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
    };
    SignUpBlock?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      parentBlockId?: gm.Middleware[];
      action?: gm.Middleware[];
      submitIcon?: gm.Middleware[];
      submitLabel?: gm.Middleware[];
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
    SignUpResponse?: {
      '*'?: gm.Middleware[];
      block?: gm.Middleware[];
    };
    VideoResponse?: {
      '*'?: gm.Middleware[];
      block?: gm.Middleware[];
    };
  };
}
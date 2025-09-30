/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ButtonVariant, ButtonColor, ButtonSize, ButtonAlignment, ThemeMode, ThemeName, IconName, IconSize, IconColor, TextResponseType, TypographyAlign, TypographyColor, TypographyVariant, VideoBlockSource, VideoBlockObjectFit } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CardPollRestore
// ====================================================

export interface CardPollRestore_imageRestore_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardPollRestore_imageRestore_ButtonBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_imageRestore_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_imageRestore_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_imageRestore_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_imageRestore_ButtonBlock_action = CardPollRestore_imageRestore_ButtonBlock_action_PhoneAction | CardPollRestore_imageRestore_ButtonBlock_action_NavigateToBlockAction | CardPollRestore_imageRestore_ButtonBlock_action_LinkAction | CardPollRestore_imageRestore_ButtonBlock_action_EmailAction;

export interface CardPollRestore_imageRestore_ButtonBlock_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface CardPollRestore_imageRestore_ButtonBlock {
  __typename: "ButtonBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  buttonVariant: ButtonVariant | null;
  buttonColor: ButtonColor | null;
  size: ButtonSize | null;
  startIconId: string | null;
  endIconId: string | null;
  submitEnabled: boolean | null;
  action: CardPollRestore_imageRestore_ButtonBlock_action | null;
  settings: CardPollRestore_imageRestore_ButtonBlock_settings | null;
}

export interface CardPollRestore_imageRestore_CardBlock {
  __typename: "CardBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * backgroundColor should be a HEX color value e.g #FFFFFF for white.
   */
  backgroundColor: string | null;
  /**
   * backdropBlur should be a number representing blur amount in pixels e.g 20.
   */
  backdropBlur: number | null;
  /**
   * coverBlockId is present if a child block should be used as a cover.
   * This child block should not be rendered normally, instead it should be used
   * as a background. Blocks are often of type ImageBlock or VideoBlock.
   */
  coverBlockId: string | null;
  /**
   * themeMode can override journey themeMode. If nothing is set then use
   * themeMode from journey
   */
  themeMode: ThemeMode | null;
  /**
   * themeName can override journey themeName. If nothing is set then use
   * themeName from journey
   */
  themeName: ThemeName | null;
  /**
   * fullscreen should control how the coverBlock is displayed. When fullscreen
   * is set to true the coverBlock Image should be displayed as a blur in the
   * background.
   */
  fullscreen: boolean;
}

export interface CardPollRestore_imageRestore_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardPollRestore_imageRestore_ImageBlock {
  __typename: "ImageBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  src: string | null;
  alt: string;
  width: number;
  height: number;
  /**
   * blurhash is a compact representation of a placeholder for an image.
   * Find a frontend implementation at https: // github.com/woltapp/blurhash
   */
  blurhash: string;
  scale: number | null;
  focalTop: number | null;
  focalLeft: number | null;
}

export interface CardPollRestore_imageRestore_RadioOptionBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_imageRestore_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_imageRestore_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_imageRestore_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_imageRestore_RadioOptionBlock_action = CardPollRestore_imageRestore_RadioOptionBlock_action_PhoneAction | CardPollRestore_imageRestore_RadioOptionBlock_action_NavigateToBlockAction | CardPollRestore_imageRestore_RadioOptionBlock_action_LinkAction | CardPollRestore_imageRestore_RadioOptionBlock_action_EmailAction;

export interface CardPollRestore_imageRestore_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardPollRestore_imageRestore_RadioOptionBlock_action | null;
  /**
   * pollOptionImageBlockId is present if a child block should be used as a poll option image.
   *       This child block should not be rendered normally, instead it should be used
   *       as a poll option image. Blocks are often of type ImageBlock
   */
  pollOptionImageBlockId: string | null;
}

export interface CardPollRestore_imageRestore_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface CardPollRestore_imageRestore_SignUpBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_imageRestore_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_imageRestore_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_imageRestore_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_imageRestore_SignUpBlock_action = CardPollRestore_imageRestore_SignUpBlock_action_PhoneAction | CardPollRestore_imageRestore_SignUpBlock_action_NavigateToBlockAction | CardPollRestore_imageRestore_SignUpBlock_action_LinkAction | CardPollRestore_imageRestore_SignUpBlock_action_EmailAction;

export interface CardPollRestore_imageRestore_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardPollRestore_imageRestore_SignUpBlock_action | null;
}

export interface CardPollRestore_imageRestore_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface CardPollRestore_imageRestore_StepBlock {
  __typename: "StepBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * locked will be set to true if the user should not be able to manually
   * advance to the next step.
   */
  locked: boolean;
  /**
   * nextBlockId contains the preferred block to navigate to, users will have to
   * manually set the next block they want to card to navigate to
   */
  nextBlockId: string | null;
  /**
   * Slug should be unique amongst all blocks
   * (server will throw BAD_USER_INPUT error if not)
   * If not required will use the current block id
   * If the generated slug is not unique the uuid will be placed
   * at the end of the slug guaranteeing uniqueness
   */
  slug: string | null;
}

export interface CardPollRestore_imageRestore_TextResponseBlock {
  __typename: "TextResponseBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  required: boolean | null;
  label: string;
  placeholder: string | null;
  hint: string | null;
  minRows: number | null;
  type: TextResponseType | null;
  routeId: string | null;
  integrationId: string | null;
}

export interface CardPollRestore_imageRestore_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardPollRestore_imageRestore_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardPollRestore_imageRestore_TypographyBlock_settings | null;
}

export interface CardPollRestore_imageRestore_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardPollRestore_imageRestore_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardPollRestore_imageRestore_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardPollRestore_imageRestore_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardPollRestore_imageRestore_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardPollRestore_imageRestore_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface CardPollRestore_imageRestore_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardPollRestore_imageRestore_VideoBlock_mediaVideo_Video_title[];
  images: CardPollRestore_imageRestore_VideoBlock_mediaVideo_Video_images[];
  variant: CardPollRestore_imageRestore_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: CardPollRestore_imageRestore_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface CardPollRestore_imageRestore_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardPollRestore_imageRestore_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardPollRestore_imageRestore_VideoBlock_mediaVideo = CardPollRestore_imageRestore_VideoBlock_mediaVideo_Video | CardPollRestore_imageRestore_VideoBlock_mediaVideo_MuxVideo | CardPollRestore_imageRestore_VideoBlock_mediaVideo_YouTube;

export interface CardPollRestore_imageRestore_VideoBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_imageRestore_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_imageRestore_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_imageRestore_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_imageRestore_VideoBlock_action = CardPollRestore_imageRestore_VideoBlock_action_PhoneAction | CardPollRestore_imageRestore_VideoBlock_action_NavigateToBlockAction | CardPollRestore_imageRestore_VideoBlock_action_LinkAction | CardPollRestore_imageRestore_VideoBlock_action_EmailAction;

export interface CardPollRestore_imageRestore_VideoBlock {
  __typename: "VideoBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  muted: boolean | null;
  autoplay: boolean | null;
  /**
   * startAt dictates at which point of time the video should start playing
   */
  startAt: number | null;
  /**
   * endAt dictates at which point of time the video should end
   */
  endAt: number | null;
  /**
   * posterBlockId is present if a child block should be used as a poster.
   * This child block should not be rendered normally, instead it should be used
   * as the video poster. PosterBlock should be of type ImageBlock.
   */
  posterBlockId: string | null;
  fullsize: boolean | null;
  /**
   * internal source videos: videoId and videoVariantLanguageId both need to be set
   * to select a video.
   * For other sources only videoId needs to be set.
   */
  videoId: string | null;
  /**
   * internal source videos: videoId and videoVariantLanguageId both need to be set
   * to select a video.
   * For other sources only videoId needs to be set.
   */
  videoVariantLanguageId: string | null;
  /**
   * internal source: videoId, videoVariantLanguageId, and video present
   * youTube source: videoId, title, description, and duration present
   */
  source: VideoBlockSource;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field.
   * For other sources this is automatically populated.
   */
  title: string | null;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   */
  description: string | null;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   */
  image: string | null;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   * duration in seconds.
   */
  duration: number | null;
  /**
   * how the video should display within the VideoBlock
   */
  objectFit: VideoBlockObjectFit | null;
  mediaVideo: CardPollRestore_imageRestore_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardPollRestore_imageRestore_VideoBlock_action | null;
}

export interface CardPollRestore_imageRestore_VideoTriggerBlock_triggerAction_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_imageRestore_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_imageRestore_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_imageRestore_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_imageRestore_VideoTriggerBlock_triggerAction = CardPollRestore_imageRestore_VideoTriggerBlock_triggerAction_PhoneAction | CardPollRestore_imageRestore_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardPollRestore_imageRestore_VideoTriggerBlock_triggerAction_LinkAction | CardPollRestore_imageRestore_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardPollRestore_imageRestore_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardPollRestore_imageRestore_VideoTriggerBlock_triggerAction;
}

export type CardPollRestore_imageRestore = CardPollRestore_imageRestore_GridContainerBlock | CardPollRestore_imageRestore_ButtonBlock | CardPollRestore_imageRestore_CardBlock | CardPollRestore_imageRestore_IconBlock | CardPollRestore_imageRestore_ImageBlock | CardPollRestore_imageRestore_RadioOptionBlock | CardPollRestore_imageRestore_RadioQuestionBlock | CardPollRestore_imageRestore_SignUpBlock | CardPollRestore_imageRestore_SpacerBlock | CardPollRestore_imageRestore_StepBlock | CardPollRestore_imageRestore_TextResponseBlock | CardPollRestore_imageRestore_TypographyBlock | CardPollRestore_imageRestore_VideoBlock | CardPollRestore_imageRestore_VideoTriggerBlock;

export interface CardPollRestore_subtitleRestore_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardPollRestore_subtitleRestore_ButtonBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_subtitleRestore_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_subtitleRestore_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_subtitleRestore_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_subtitleRestore_ButtonBlock_action = CardPollRestore_subtitleRestore_ButtonBlock_action_PhoneAction | CardPollRestore_subtitleRestore_ButtonBlock_action_NavigateToBlockAction | CardPollRestore_subtitleRestore_ButtonBlock_action_LinkAction | CardPollRestore_subtitleRestore_ButtonBlock_action_EmailAction;

export interface CardPollRestore_subtitleRestore_ButtonBlock_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface CardPollRestore_subtitleRestore_ButtonBlock {
  __typename: "ButtonBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  buttonVariant: ButtonVariant | null;
  buttonColor: ButtonColor | null;
  size: ButtonSize | null;
  startIconId: string | null;
  endIconId: string | null;
  submitEnabled: boolean | null;
  action: CardPollRestore_subtitleRestore_ButtonBlock_action | null;
  settings: CardPollRestore_subtitleRestore_ButtonBlock_settings | null;
}

export interface CardPollRestore_subtitleRestore_CardBlock {
  __typename: "CardBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * backgroundColor should be a HEX color value e.g #FFFFFF for white.
   */
  backgroundColor: string | null;
  /**
   * backdropBlur should be a number representing blur amount in pixels e.g 20.
   */
  backdropBlur: number | null;
  /**
   * coverBlockId is present if a child block should be used as a cover.
   * This child block should not be rendered normally, instead it should be used
   * as a background. Blocks are often of type ImageBlock or VideoBlock.
   */
  coverBlockId: string | null;
  /**
   * themeMode can override journey themeMode. If nothing is set then use
   * themeMode from journey
   */
  themeMode: ThemeMode | null;
  /**
   * themeName can override journey themeName. If nothing is set then use
   * themeName from journey
   */
  themeName: ThemeName | null;
  /**
   * fullscreen should control how the coverBlock is displayed. When fullscreen
   * is set to true the coverBlock Image should be displayed as a blur in the
   * background.
   */
  fullscreen: boolean;
}

export interface CardPollRestore_subtitleRestore_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardPollRestore_subtitleRestore_ImageBlock {
  __typename: "ImageBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  src: string | null;
  alt: string;
  width: number;
  height: number;
  /**
   * blurhash is a compact representation of a placeholder for an image.
   * Find a frontend implementation at https: // github.com/woltapp/blurhash
   */
  blurhash: string;
  scale: number | null;
  focalTop: number | null;
  focalLeft: number | null;
}

export interface CardPollRestore_subtitleRestore_RadioOptionBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_subtitleRestore_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_subtitleRestore_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_subtitleRestore_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_subtitleRestore_RadioOptionBlock_action = CardPollRestore_subtitleRestore_RadioOptionBlock_action_PhoneAction | CardPollRestore_subtitleRestore_RadioOptionBlock_action_NavigateToBlockAction | CardPollRestore_subtitleRestore_RadioOptionBlock_action_LinkAction | CardPollRestore_subtitleRestore_RadioOptionBlock_action_EmailAction;

export interface CardPollRestore_subtitleRestore_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardPollRestore_subtitleRestore_RadioOptionBlock_action | null;
  /**
   * pollOptionImageBlockId is present if a child block should be used as a poll option image.
   *       This child block should not be rendered normally, instead it should be used
   *       as a poll option image. Blocks are often of type ImageBlock
   */
  pollOptionImageBlockId: string | null;
}

export interface CardPollRestore_subtitleRestore_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface CardPollRestore_subtitleRestore_SignUpBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_subtitleRestore_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_subtitleRestore_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_subtitleRestore_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_subtitleRestore_SignUpBlock_action = CardPollRestore_subtitleRestore_SignUpBlock_action_PhoneAction | CardPollRestore_subtitleRestore_SignUpBlock_action_NavigateToBlockAction | CardPollRestore_subtitleRestore_SignUpBlock_action_LinkAction | CardPollRestore_subtitleRestore_SignUpBlock_action_EmailAction;

export interface CardPollRestore_subtitleRestore_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardPollRestore_subtitleRestore_SignUpBlock_action | null;
}

export interface CardPollRestore_subtitleRestore_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface CardPollRestore_subtitleRestore_StepBlock {
  __typename: "StepBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * locked will be set to true if the user should not be able to manually
   * advance to the next step.
   */
  locked: boolean;
  /**
   * nextBlockId contains the preferred block to navigate to, users will have to
   * manually set the next block they want to card to navigate to
   */
  nextBlockId: string | null;
  /**
   * Slug should be unique amongst all blocks
   * (server will throw BAD_USER_INPUT error if not)
   * If not required will use the current block id
   * If the generated slug is not unique the uuid will be placed
   * at the end of the slug guaranteeing uniqueness
   */
  slug: string | null;
}

export interface CardPollRestore_subtitleRestore_TextResponseBlock {
  __typename: "TextResponseBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  required: boolean | null;
  label: string;
  placeholder: string | null;
  hint: string | null;
  minRows: number | null;
  type: TextResponseType | null;
  routeId: string | null;
  integrationId: string | null;
}

export interface CardPollRestore_subtitleRestore_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardPollRestore_subtitleRestore_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardPollRestore_subtitleRestore_TypographyBlock_settings | null;
}

export interface CardPollRestore_subtitleRestore_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardPollRestore_subtitleRestore_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardPollRestore_subtitleRestore_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardPollRestore_subtitleRestore_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardPollRestore_subtitleRestore_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardPollRestore_subtitleRestore_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface CardPollRestore_subtitleRestore_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardPollRestore_subtitleRestore_VideoBlock_mediaVideo_Video_title[];
  images: CardPollRestore_subtitleRestore_VideoBlock_mediaVideo_Video_images[];
  variant: CardPollRestore_subtitleRestore_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: CardPollRestore_subtitleRestore_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface CardPollRestore_subtitleRestore_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardPollRestore_subtitleRestore_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardPollRestore_subtitleRestore_VideoBlock_mediaVideo = CardPollRestore_subtitleRestore_VideoBlock_mediaVideo_Video | CardPollRestore_subtitleRestore_VideoBlock_mediaVideo_MuxVideo | CardPollRestore_subtitleRestore_VideoBlock_mediaVideo_YouTube;

export interface CardPollRestore_subtitleRestore_VideoBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_subtitleRestore_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_subtitleRestore_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_subtitleRestore_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_subtitleRestore_VideoBlock_action = CardPollRestore_subtitleRestore_VideoBlock_action_PhoneAction | CardPollRestore_subtitleRestore_VideoBlock_action_NavigateToBlockAction | CardPollRestore_subtitleRestore_VideoBlock_action_LinkAction | CardPollRestore_subtitleRestore_VideoBlock_action_EmailAction;

export interface CardPollRestore_subtitleRestore_VideoBlock {
  __typename: "VideoBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  muted: boolean | null;
  autoplay: boolean | null;
  /**
   * startAt dictates at which point of time the video should start playing
   */
  startAt: number | null;
  /**
   * endAt dictates at which point of time the video should end
   */
  endAt: number | null;
  /**
   * posterBlockId is present if a child block should be used as a poster.
   * This child block should not be rendered normally, instead it should be used
   * as the video poster. PosterBlock should be of type ImageBlock.
   */
  posterBlockId: string | null;
  fullsize: boolean | null;
  /**
   * internal source videos: videoId and videoVariantLanguageId both need to be set
   * to select a video.
   * For other sources only videoId needs to be set.
   */
  videoId: string | null;
  /**
   * internal source videos: videoId and videoVariantLanguageId both need to be set
   * to select a video.
   * For other sources only videoId needs to be set.
   */
  videoVariantLanguageId: string | null;
  /**
   * internal source: videoId, videoVariantLanguageId, and video present
   * youTube source: videoId, title, description, and duration present
   */
  source: VideoBlockSource;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field.
   * For other sources this is automatically populated.
   */
  title: string | null;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   */
  description: string | null;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   */
  image: string | null;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   * duration in seconds.
   */
  duration: number | null;
  /**
   * how the video should display within the VideoBlock
   */
  objectFit: VideoBlockObjectFit | null;
  mediaVideo: CardPollRestore_subtitleRestore_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardPollRestore_subtitleRestore_VideoBlock_action | null;
}

export interface CardPollRestore_subtitleRestore_VideoTriggerBlock_triggerAction_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_subtitleRestore_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_subtitleRestore_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_subtitleRestore_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_subtitleRestore_VideoTriggerBlock_triggerAction = CardPollRestore_subtitleRestore_VideoTriggerBlock_triggerAction_PhoneAction | CardPollRestore_subtitleRestore_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardPollRestore_subtitleRestore_VideoTriggerBlock_triggerAction_LinkAction | CardPollRestore_subtitleRestore_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardPollRestore_subtitleRestore_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardPollRestore_subtitleRestore_VideoTriggerBlock_triggerAction;
}

export type CardPollRestore_subtitleRestore = CardPollRestore_subtitleRestore_GridContainerBlock | CardPollRestore_subtitleRestore_ButtonBlock | CardPollRestore_subtitleRestore_CardBlock | CardPollRestore_subtitleRestore_IconBlock | CardPollRestore_subtitleRestore_ImageBlock | CardPollRestore_subtitleRestore_RadioOptionBlock | CardPollRestore_subtitleRestore_RadioQuestionBlock | CardPollRestore_subtitleRestore_SignUpBlock | CardPollRestore_subtitleRestore_SpacerBlock | CardPollRestore_subtitleRestore_StepBlock | CardPollRestore_subtitleRestore_TextResponseBlock | CardPollRestore_subtitleRestore_TypographyBlock | CardPollRestore_subtitleRestore_VideoBlock | CardPollRestore_subtitleRestore_VideoTriggerBlock;

export interface CardPollRestore_titleRestore_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardPollRestore_titleRestore_ButtonBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_titleRestore_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_titleRestore_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_titleRestore_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_titleRestore_ButtonBlock_action = CardPollRestore_titleRestore_ButtonBlock_action_PhoneAction | CardPollRestore_titleRestore_ButtonBlock_action_NavigateToBlockAction | CardPollRestore_titleRestore_ButtonBlock_action_LinkAction | CardPollRestore_titleRestore_ButtonBlock_action_EmailAction;

export interface CardPollRestore_titleRestore_ButtonBlock_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface CardPollRestore_titleRestore_ButtonBlock {
  __typename: "ButtonBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  buttonVariant: ButtonVariant | null;
  buttonColor: ButtonColor | null;
  size: ButtonSize | null;
  startIconId: string | null;
  endIconId: string | null;
  submitEnabled: boolean | null;
  action: CardPollRestore_titleRestore_ButtonBlock_action | null;
  settings: CardPollRestore_titleRestore_ButtonBlock_settings | null;
}

export interface CardPollRestore_titleRestore_CardBlock {
  __typename: "CardBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * backgroundColor should be a HEX color value e.g #FFFFFF for white.
   */
  backgroundColor: string | null;
  /**
   * backdropBlur should be a number representing blur amount in pixels e.g 20.
   */
  backdropBlur: number | null;
  /**
   * coverBlockId is present if a child block should be used as a cover.
   * This child block should not be rendered normally, instead it should be used
   * as a background. Blocks are often of type ImageBlock or VideoBlock.
   */
  coverBlockId: string | null;
  /**
   * themeMode can override journey themeMode. If nothing is set then use
   * themeMode from journey
   */
  themeMode: ThemeMode | null;
  /**
   * themeName can override journey themeName. If nothing is set then use
   * themeName from journey
   */
  themeName: ThemeName | null;
  /**
   * fullscreen should control how the coverBlock is displayed. When fullscreen
   * is set to true the coverBlock Image should be displayed as a blur in the
   * background.
   */
  fullscreen: boolean;
}

export interface CardPollRestore_titleRestore_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardPollRestore_titleRestore_ImageBlock {
  __typename: "ImageBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  src: string | null;
  alt: string;
  width: number;
  height: number;
  /**
   * blurhash is a compact representation of a placeholder for an image.
   * Find a frontend implementation at https: // github.com/woltapp/blurhash
   */
  blurhash: string;
  scale: number | null;
  focalTop: number | null;
  focalLeft: number | null;
}

export interface CardPollRestore_titleRestore_RadioOptionBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_titleRestore_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_titleRestore_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_titleRestore_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_titleRestore_RadioOptionBlock_action = CardPollRestore_titleRestore_RadioOptionBlock_action_PhoneAction | CardPollRestore_titleRestore_RadioOptionBlock_action_NavigateToBlockAction | CardPollRestore_titleRestore_RadioOptionBlock_action_LinkAction | CardPollRestore_titleRestore_RadioOptionBlock_action_EmailAction;

export interface CardPollRestore_titleRestore_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardPollRestore_titleRestore_RadioOptionBlock_action | null;
  /**
   * pollOptionImageBlockId is present if a child block should be used as a poll option image.
   *       This child block should not be rendered normally, instead it should be used
   *       as a poll option image. Blocks are often of type ImageBlock
   */
  pollOptionImageBlockId: string | null;
}

export interface CardPollRestore_titleRestore_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface CardPollRestore_titleRestore_SignUpBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_titleRestore_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_titleRestore_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_titleRestore_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_titleRestore_SignUpBlock_action = CardPollRestore_titleRestore_SignUpBlock_action_PhoneAction | CardPollRestore_titleRestore_SignUpBlock_action_NavigateToBlockAction | CardPollRestore_titleRestore_SignUpBlock_action_LinkAction | CardPollRestore_titleRestore_SignUpBlock_action_EmailAction;

export interface CardPollRestore_titleRestore_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardPollRestore_titleRestore_SignUpBlock_action | null;
}

export interface CardPollRestore_titleRestore_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface CardPollRestore_titleRestore_StepBlock {
  __typename: "StepBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * locked will be set to true if the user should not be able to manually
   * advance to the next step.
   */
  locked: boolean;
  /**
   * nextBlockId contains the preferred block to navigate to, users will have to
   * manually set the next block they want to card to navigate to
   */
  nextBlockId: string | null;
  /**
   * Slug should be unique amongst all blocks
   * (server will throw BAD_USER_INPUT error if not)
   * If not required will use the current block id
   * If the generated slug is not unique the uuid will be placed
   * at the end of the slug guaranteeing uniqueness
   */
  slug: string | null;
}

export interface CardPollRestore_titleRestore_TextResponseBlock {
  __typename: "TextResponseBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  required: boolean | null;
  label: string;
  placeholder: string | null;
  hint: string | null;
  minRows: number | null;
  type: TextResponseType | null;
  routeId: string | null;
  integrationId: string | null;
}

export interface CardPollRestore_titleRestore_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardPollRestore_titleRestore_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardPollRestore_titleRestore_TypographyBlock_settings | null;
}

export interface CardPollRestore_titleRestore_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardPollRestore_titleRestore_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardPollRestore_titleRestore_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardPollRestore_titleRestore_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardPollRestore_titleRestore_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardPollRestore_titleRestore_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface CardPollRestore_titleRestore_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardPollRestore_titleRestore_VideoBlock_mediaVideo_Video_title[];
  images: CardPollRestore_titleRestore_VideoBlock_mediaVideo_Video_images[];
  variant: CardPollRestore_titleRestore_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: CardPollRestore_titleRestore_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface CardPollRestore_titleRestore_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardPollRestore_titleRestore_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardPollRestore_titleRestore_VideoBlock_mediaVideo = CardPollRestore_titleRestore_VideoBlock_mediaVideo_Video | CardPollRestore_titleRestore_VideoBlock_mediaVideo_MuxVideo | CardPollRestore_titleRestore_VideoBlock_mediaVideo_YouTube;

export interface CardPollRestore_titleRestore_VideoBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_titleRestore_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_titleRestore_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_titleRestore_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_titleRestore_VideoBlock_action = CardPollRestore_titleRestore_VideoBlock_action_PhoneAction | CardPollRestore_titleRestore_VideoBlock_action_NavigateToBlockAction | CardPollRestore_titleRestore_VideoBlock_action_LinkAction | CardPollRestore_titleRestore_VideoBlock_action_EmailAction;

export interface CardPollRestore_titleRestore_VideoBlock {
  __typename: "VideoBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  muted: boolean | null;
  autoplay: boolean | null;
  /**
   * startAt dictates at which point of time the video should start playing
   */
  startAt: number | null;
  /**
   * endAt dictates at which point of time the video should end
   */
  endAt: number | null;
  /**
   * posterBlockId is present if a child block should be used as a poster.
   * This child block should not be rendered normally, instead it should be used
   * as the video poster. PosterBlock should be of type ImageBlock.
   */
  posterBlockId: string | null;
  fullsize: boolean | null;
  /**
   * internal source videos: videoId and videoVariantLanguageId both need to be set
   * to select a video.
   * For other sources only videoId needs to be set.
   */
  videoId: string | null;
  /**
   * internal source videos: videoId and videoVariantLanguageId both need to be set
   * to select a video.
   * For other sources only videoId needs to be set.
   */
  videoVariantLanguageId: string | null;
  /**
   * internal source: videoId, videoVariantLanguageId, and video present
   * youTube source: videoId, title, description, and duration present
   */
  source: VideoBlockSource;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field.
   * For other sources this is automatically populated.
   */
  title: string | null;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   */
  description: string | null;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   */
  image: string | null;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   * duration in seconds.
   */
  duration: number | null;
  /**
   * how the video should display within the VideoBlock
   */
  objectFit: VideoBlockObjectFit | null;
  mediaVideo: CardPollRestore_titleRestore_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardPollRestore_titleRestore_VideoBlock_action | null;
}

export interface CardPollRestore_titleRestore_VideoTriggerBlock_triggerAction_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_titleRestore_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_titleRestore_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_titleRestore_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_titleRestore_VideoTriggerBlock_triggerAction = CardPollRestore_titleRestore_VideoTriggerBlock_triggerAction_PhoneAction | CardPollRestore_titleRestore_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardPollRestore_titleRestore_VideoTriggerBlock_triggerAction_LinkAction | CardPollRestore_titleRestore_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardPollRestore_titleRestore_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardPollRestore_titleRestore_VideoTriggerBlock_triggerAction;
}

export type CardPollRestore_titleRestore = CardPollRestore_titleRestore_GridContainerBlock | CardPollRestore_titleRestore_ButtonBlock | CardPollRestore_titleRestore_CardBlock | CardPollRestore_titleRestore_IconBlock | CardPollRestore_titleRestore_ImageBlock | CardPollRestore_titleRestore_RadioOptionBlock | CardPollRestore_titleRestore_RadioQuestionBlock | CardPollRestore_titleRestore_SignUpBlock | CardPollRestore_titleRestore_SpacerBlock | CardPollRestore_titleRestore_StepBlock | CardPollRestore_titleRestore_TextResponseBlock | CardPollRestore_titleRestore_TypographyBlock | CardPollRestore_titleRestore_VideoBlock | CardPollRestore_titleRestore_VideoTriggerBlock;

export interface CardPollRestore_radioQuestionRestore_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardPollRestore_radioQuestionRestore_ButtonBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_radioQuestionRestore_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_radioQuestionRestore_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_radioQuestionRestore_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_radioQuestionRestore_ButtonBlock_action = CardPollRestore_radioQuestionRestore_ButtonBlock_action_PhoneAction | CardPollRestore_radioQuestionRestore_ButtonBlock_action_NavigateToBlockAction | CardPollRestore_radioQuestionRestore_ButtonBlock_action_LinkAction | CardPollRestore_radioQuestionRestore_ButtonBlock_action_EmailAction;

export interface CardPollRestore_radioQuestionRestore_ButtonBlock_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface CardPollRestore_radioQuestionRestore_ButtonBlock {
  __typename: "ButtonBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  buttonVariant: ButtonVariant | null;
  buttonColor: ButtonColor | null;
  size: ButtonSize | null;
  startIconId: string | null;
  endIconId: string | null;
  submitEnabled: boolean | null;
  action: CardPollRestore_radioQuestionRestore_ButtonBlock_action | null;
  settings: CardPollRestore_radioQuestionRestore_ButtonBlock_settings | null;
}

export interface CardPollRestore_radioQuestionRestore_CardBlock {
  __typename: "CardBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * backgroundColor should be a HEX color value e.g #FFFFFF for white.
   */
  backgroundColor: string | null;
  /**
   * backdropBlur should be a number representing blur amount in pixels e.g 20.
   */
  backdropBlur: number | null;
  /**
   * coverBlockId is present if a child block should be used as a cover.
   * This child block should not be rendered normally, instead it should be used
   * as a background. Blocks are often of type ImageBlock or VideoBlock.
   */
  coverBlockId: string | null;
  /**
   * themeMode can override journey themeMode. If nothing is set then use
   * themeMode from journey
   */
  themeMode: ThemeMode | null;
  /**
   * themeName can override journey themeName. If nothing is set then use
   * themeName from journey
   */
  themeName: ThemeName | null;
  /**
   * fullscreen should control how the coverBlock is displayed. When fullscreen
   * is set to true the coverBlock Image should be displayed as a blur in the
   * background.
   */
  fullscreen: boolean;
}

export interface CardPollRestore_radioQuestionRestore_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardPollRestore_radioQuestionRestore_ImageBlock {
  __typename: "ImageBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  src: string | null;
  alt: string;
  width: number;
  height: number;
  /**
   * blurhash is a compact representation of a placeholder for an image.
   * Find a frontend implementation at https: // github.com/woltapp/blurhash
   */
  blurhash: string;
  scale: number | null;
  focalTop: number | null;
  focalLeft: number | null;
}

export interface CardPollRestore_radioQuestionRestore_RadioOptionBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_radioQuestionRestore_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_radioQuestionRestore_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_radioQuestionRestore_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_radioQuestionRestore_RadioOptionBlock_action = CardPollRestore_radioQuestionRestore_RadioOptionBlock_action_PhoneAction | CardPollRestore_radioQuestionRestore_RadioOptionBlock_action_NavigateToBlockAction | CardPollRestore_radioQuestionRestore_RadioOptionBlock_action_LinkAction | CardPollRestore_radioQuestionRestore_RadioOptionBlock_action_EmailAction;

export interface CardPollRestore_radioQuestionRestore_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardPollRestore_radioQuestionRestore_RadioOptionBlock_action | null;
  /**
   * pollOptionImageBlockId is present if a child block should be used as a poll option image.
   *       This child block should not be rendered normally, instead it should be used
   *       as a poll option image. Blocks are often of type ImageBlock
   */
  pollOptionImageBlockId: string | null;
}

export interface CardPollRestore_radioQuestionRestore_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface CardPollRestore_radioQuestionRestore_SignUpBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_radioQuestionRestore_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_radioQuestionRestore_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_radioQuestionRestore_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_radioQuestionRestore_SignUpBlock_action = CardPollRestore_radioQuestionRestore_SignUpBlock_action_PhoneAction | CardPollRestore_radioQuestionRestore_SignUpBlock_action_NavigateToBlockAction | CardPollRestore_radioQuestionRestore_SignUpBlock_action_LinkAction | CardPollRestore_radioQuestionRestore_SignUpBlock_action_EmailAction;

export interface CardPollRestore_radioQuestionRestore_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardPollRestore_radioQuestionRestore_SignUpBlock_action | null;
}

export interface CardPollRestore_radioQuestionRestore_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface CardPollRestore_radioQuestionRestore_StepBlock {
  __typename: "StepBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * locked will be set to true if the user should not be able to manually
   * advance to the next step.
   */
  locked: boolean;
  /**
   * nextBlockId contains the preferred block to navigate to, users will have to
   * manually set the next block they want to card to navigate to
   */
  nextBlockId: string | null;
  /**
   * Slug should be unique amongst all blocks
   * (server will throw BAD_USER_INPUT error if not)
   * If not required will use the current block id
   * If the generated slug is not unique the uuid will be placed
   * at the end of the slug guaranteeing uniqueness
   */
  slug: string | null;
}

export interface CardPollRestore_radioQuestionRestore_TextResponseBlock {
  __typename: "TextResponseBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  required: boolean | null;
  label: string;
  placeholder: string | null;
  hint: string | null;
  minRows: number | null;
  type: TextResponseType | null;
  routeId: string | null;
  integrationId: string | null;
}

export interface CardPollRestore_radioQuestionRestore_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardPollRestore_radioQuestionRestore_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardPollRestore_radioQuestionRestore_TypographyBlock_settings | null;
}

export interface CardPollRestore_radioQuestionRestore_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardPollRestore_radioQuestionRestore_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardPollRestore_radioQuestionRestore_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardPollRestore_radioQuestionRestore_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardPollRestore_radioQuestionRestore_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardPollRestore_radioQuestionRestore_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface CardPollRestore_radioQuestionRestore_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardPollRestore_radioQuestionRestore_VideoBlock_mediaVideo_Video_title[];
  images: CardPollRestore_radioQuestionRestore_VideoBlock_mediaVideo_Video_images[];
  variant: CardPollRestore_radioQuestionRestore_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: CardPollRestore_radioQuestionRestore_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface CardPollRestore_radioQuestionRestore_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardPollRestore_radioQuestionRestore_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardPollRestore_radioQuestionRestore_VideoBlock_mediaVideo = CardPollRestore_radioQuestionRestore_VideoBlock_mediaVideo_Video | CardPollRestore_radioQuestionRestore_VideoBlock_mediaVideo_MuxVideo | CardPollRestore_radioQuestionRestore_VideoBlock_mediaVideo_YouTube;

export interface CardPollRestore_radioQuestionRestore_VideoBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_radioQuestionRestore_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_radioQuestionRestore_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_radioQuestionRestore_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_radioQuestionRestore_VideoBlock_action = CardPollRestore_radioQuestionRestore_VideoBlock_action_PhoneAction | CardPollRestore_radioQuestionRestore_VideoBlock_action_NavigateToBlockAction | CardPollRestore_radioQuestionRestore_VideoBlock_action_LinkAction | CardPollRestore_radioQuestionRestore_VideoBlock_action_EmailAction;

export interface CardPollRestore_radioQuestionRestore_VideoBlock {
  __typename: "VideoBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  muted: boolean | null;
  autoplay: boolean | null;
  /**
   * startAt dictates at which point of time the video should start playing
   */
  startAt: number | null;
  /**
   * endAt dictates at which point of time the video should end
   */
  endAt: number | null;
  /**
   * posterBlockId is present if a child block should be used as a poster.
   * This child block should not be rendered normally, instead it should be used
   * as the video poster. PosterBlock should be of type ImageBlock.
   */
  posterBlockId: string | null;
  fullsize: boolean | null;
  /**
   * internal source videos: videoId and videoVariantLanguageId both need to be set
   * to select a video.
   * For other sources only videoId needs to be set.
   */
  videoId: string | null;
  /**
   * internal source videos: videoId and videoVariantLanguageId both need to be set
   * to select a video.
   * For other sources only videoId needs to be set.
   */
  videoVariantLanguageId: string | null;
  /**
   * internal source: videoId, videoVariantLanguageId, and video present
   * youTube source: videoId, title, description, and duration present
   */
  source: VideoBlockSource;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field.
   * For other sources this is automatically populated.
   */
  title: string | null;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   */
  description: string | null;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   */
  image: string | null;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   * duration in seconds.
   */
  duration: number | null;
  /**
   * how the video should display within the VideoBlock
   */
  objectFit: VideoBlockObjectFit | null;
  mediaVideo: CardPollRestore_radioQuestionRestore_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardPollRestore_radioQuestionRestore_VideoBlock_action | null;
}

export interface CardPollRestore_radioQuestionRestore_VideoTriggerBlock_triggerAction_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_radioQuestionRestore_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_radioQuestionRestore_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_radioQuestionRestore_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_radioQuestionRestore_VideoTriggerBlock_triggerAction = CardPollRestore_radioQuestionRestore_VideoTriggerBlock_triggerAction_PhoneAction | CardPollRestore_radioQuestionRestore_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardPollRestore_radioQuestionRestore_VideoTriggerBlock_triggerAction_LinkAction | CardPollRestore_radioQuestionRestore_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardPollRestore_radioQuestionRestore_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardPollRestore_radioQuestionRestore_VideoTriggerBlock_triggerAction;
}

export type CardPollRestore_radioQuestionRestore = CardPollRestore_radioQuestionRestore_GridContainerBlock | CardPollRestore_radioQuestionRestore_ButtonBlock | CardPollRestore_radioQuestionRestore_CardBlock | CardPollRestore_radioQuestionRestore_IconBlock | CardPollRestore_radioQuestionRestore_ImageBlock | CardPollRestore_radioQuestionRestore_RadioOptionBlock | CardPollRestore_radioQuestionRestore_RadioQuestionBlock | CardPollRestore_radioQuestionRestore_SignUpBlock | CardPollRestore_radioQuestionRestore_SpacerBlock | CardPollRestore_radioQuestionRestore_StepBlock | CardPollRestore_radioQuestionRestore_TextResponseBlock | CardPollRestore_radioQuestionRestore_TypographyBlock | CardPollRestore_radioQuestionRestore_VideoBlock | CardPollRestore_radioQuestionRestore_VideoTriggerBlock;

export interface CardPollRestore_radioOption1Restore_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardPollRestore_radioOption1Restore_ButtonBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_radioOption1Restore_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_radioOption1Restore_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_radioOption1Restore_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_radioOption1Restore_ButtonBlock_action = CardPollRestore_radioOption1Restore_ButtonBlock_action_PhoneAction | CardPollRestore_radioOption1Restore_ButtonBlock_action_NavigateToBlockAction | CardPollRestore_radioOption1Restore_ButtonBlock_action_LinkAction | CardPollRestore_radioOption1Restore_ButtonBlock_action_EmailAction;

export interface CardPollRestore_radioOption1Restore_ButtonBlock_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface CardPollRestore_radioOption1Restore_ButtonBlock {
  __typename: "ButtonBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  buttonVariant: ButtonVariant | null;
  buttonColor: ButtonColor | null;
  size: ButtonSize | null;
  startIconId: string | null;
  endIconId: string | null;
  submitEnabled: boolean | null;
  action: CardPollRestore_radioOption1Restore_ButtonBlock_action | null;
  settings: CardPollRestore_radioOption1Restore_ButtonBlock_settings | null;
}

export interface CardPollRestore_radioOption1Restore_CardBlock {
  __typename: "CardBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * backgroundColor should be a HEX color value e.g #FFFFFF for white.
   */
  backgroundColor: string | null;
  /**
   * backdropBlur should be a number representing blur amount in pixels e.g 20.
   */
  backdropBlur: number | null;
  /**
   * coverBlockId is present if a child block should be used as a cover.
   * This child block should not be rendered normally, instead it should be used
   * as a background. Blocks are often of type ImageBlock or VideoBlock.
   */
  coverBlockId: string | null;
  /**
   * themeMode can override journey themeMode. If nothing is set then use
   * themeMode from journey
   */
  themeMode: ThemeMode | null;
  /**
   * themeName can override journey themeName. If nothing is set then use
   * themeName from journey
   */
  themeName: ThemeName | null;
  /**
   * fullscreen should control how the coverBlock is displayed. When fullscreen
   * is set to true the coverBlock Image should be displayed as a blur in the
   * background.
   */
  fullscreen: boolean;
}

export interface CardPollRestore_radioOption1Restore_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardPollRestore_radioOption1Restore_ImageBlock {
  __typename: "ImageBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  src: string | null;
  alt: string;
  width: number;
  height: number;
  /**
   * blurhash is a compact representation of a placeholder for an image.
   * Find a frontend implementation at https: // github.com/woltapp/blurhash
   */
  blurhash: string;
  scale: number | null;
  focalTop: number | null;
  focalLeft: number | null;
}

export interface CardPollRestore_radioOption1Restore_RadioOptionBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_radioOption1Restore_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_radioOption1Restore_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_radioOption1Restore_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_radioOption1Restore_RadioOptionBlock_action = CardPollRestore_radioOption1Restore_RadioOptionBlock_action_PhoneAction | CardPollRestore_radioOption1Restore_RadioOptionBlock_action_NavigateToBlockAction | CardPollRestore_radioOption1Restore_RadioOptionBlock_action_LinkAction | CardPollRestore_radioOption1Restore_RadioOptionBlock_action_EmailAction;

export interface CardPollRestore_radioOption1Restore_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardPollRestore_radioOption1Restore_RadioOptionBlock_action | null;
  /**
   * pollOptionImageBlockId is present if a child block should be used as a poll option image.
   *       This child block should not be rendered normally, instead it should be used
   *       as a poll option image. Blocks are often of type ImageBlock
   */
  pollOptionImageBlockId: string | null;
}

export interface CardPollRestore_radioOption1Restore_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface CardPollRestore_radioOption1Restore_SignUpBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_radioOption1Restore_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_radioOption1Restore_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_radioOption1Restore_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_radioOption1Restore_SignUpBlock_action = CardPollRestore_radioOption1Restore_SignUpBlock_action_PhoneAction | CardPollRestore_radioOption1Restore_SignUpBlock_action_NavigateToBlockAction | CardPollRestore_radioOption1Restore_SignUpBlock_action_LinkAction | CardPollRestore_radioOption1Restore_SignUpBlock_action_EmailAction;

export interface CardPollRestore_radioOption1Restore_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardPollRestore_radioOption1Restore_SignUpBlock_action | null;
}

export interface CardPollRestore_radioOption1Restore_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface CardPollRestore_radioOption1Restore_StepBlock {
  __typename: "StepBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * locked will be set to true if the user should not be able to manually
   * advance to the next step.
   */
  locked: boolean;
  /**
   * nextBlockId contains the preferred block to navigate to, users will have to
   * manually set the next block they want to card to navigate to
   */
  nextBlockId: string | null;
  /**
   * Slug should be unique amongst all blocks
   * (server will throw BAD_USER_INPUT error if not)
   * If not required will use the current block id
   * If the generated slug is not unique the uuid will be placed
   * at the end of the slug guaranteeing uniqueness
   */
  slug: string | null;
}

export interface CardPollRestore_radioOption1Restore_TextResponseBlock {
  __typename: "TextResponseBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  required: boolean | null;
  label: string;
  placeholder: string | null;
  hint: string | null;
  minRows: number | null;
  type: TextResponseType | null;
  routeId: string | null;
  integrationId: string | null;
}

export interface CardPollRestore_radioOption1Restore_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardPollRestore_radioOption1Restore_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardPollRestore_radioOption1Restore_TypographyBlock_settings | null;
}

export interface CardPollRestore_radioOption1Restore_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardPollRestore_radioOption1Restore_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardPollRestore_radioOption1Restore_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardPollRestore_radioOption1Restore_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardPollRestore_radioOption1Restore_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardPollRestore_radioOption1Restore_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface CardPollRestore_radioOption1Restore_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardPollRestore_radioOption1Restore_VideoBlock_mediaVideo_Video_title[];
  images: CardPollRestore_radioOption1Restore_VideoBlock_mediaVideo_Video_images[];
  variant: CardPollRestore_radioOption1Restore_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: CardPollRestore_radioOption1Restore_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface CardPollRestore_radioOption1Restore_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardPollRestore_radioOption1Restore_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardPollRestore_radioOption1Restore_VideoBlock_mediaVideo = CardPollRestore_radioOption1Restore_VideoBlock_mediaVideo_Video | CardPollRestore_radioOption1Restore_VideoBlock_mediaVideo_MuxVideo | CardPollRestore_radioOption1Restore_VideoBlock_mediaVideo_YouTube;

export interface CardPollRestore_radioOption1Restore_VideoBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_radioOption1Restore_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_radioOption1Restore_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_radioOption1Restore_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_radioOption1Restore_VideoBlock_action = CardPollRestore_radioOption1Restore_VideoBlock_action_PhoneAction | CardPollRestore_radioOption1Restore_VideoBlock_action_NavigateToBlockAction | CardPollRestore_radioOption1Restore_VideoBlock_action_LinkAction | CardPollRestore_radioOption1Restore_VideoBlock_action_EmailAction;

export interface CardPollRestore_radioOption1Restore_VideoBlock {
  __typename: "VideoBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  muted: boolean | null;
  autoplay: boolean | null;
  /**
   * startAt dictates at which point of time the video should start playing
   */
  startAt: number | null;
  /**
   * endAt dictates at which point of time the video should end
   */
  endAt: number | null;
  /**
   * posterBlockId is present if a child block should be used as a poster.
   * This child block should not be rendered normally, instead it should be used
   * as the video poster. PosterBlock should be of type ImageBlock.
   */
  posterBlockId: string | null;
  fullsize: boolean | null;
  /**
   * internal source videos: videoId and videoVariantLanguageId both need to be set
   * to select a video.
   * For other sources only videoId needs to be set.
   */
  videoId: string | null;
  /**
   * internal source videos: videoId and videoVariantLanguageId both need to be set
   * to select a video.
   * For other sources only videoId needs to be set.
   */
  videoVariantLanguageId: string | null;
  /**
   * internal source: videoId, videoVariantLanguageId, and video present
   * youTube source: videoId, title, description, and duration present
   */
  source: VideoBlockSource;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field.
   * For other sources this is automatically populated.
   */
  title: string | null;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   */
  description: string | null;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   */
  image: string | null;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   * duration in seconds.
   */
  duration: number | null;
  /**
   * how the video should display within the VideoBlock
   */
  objectFit: VideoBlockObjectFit | null;
  mediaVideo: CardPollRestore_radioOption1Restore_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardPollRestore_radioOption1Restore_VideoBlock_action | null;
}

export interface CardPollRestore_radioOption1Restore_VideoTriggerBlock_triggerAction_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_radioOption1Restore_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_radioOption1Restore_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_radioOption1Restore_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_radioOption1Restore_VideoTriggerBlock_triggerAction = CardPollRestore_radioOption1Restore_VideoTriggerBlock_triggerAction_PhoneAction | CardPollRestore_radioOption1Restore_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardPollRestore_radioOption1Restore_VideoTriggerBlock_triggerAction_LinkAction | CardPollRestore_radioOption1Restore_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardPollRestore_radioOption1Restore_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardPollRestore_radioOption1Restore_VideoTriggerBlock_triggerAction;
}

export type CardPollRestore_radioOption1Restore = CardPollRestore_radioOption1Restore_GridContainerBlock | CardPollRestore_radioOption1Restore_ButtonBlock | CardPollRestore_radioOption1Restore_CardBlock | CardPollRestore_radioOption1Restore_IconBlock | CardPollRestore_radioOption1Restore_ImageBlock | CardPollRestore_radioOption1Restore_RadioOptionBlock | CardPollRestore_radioOption1Restore_RadioQuestionBlock | CardPollRestore_radioOption1Restore_SignUpBlock | CardPollRestore_radioOption1Restore_SpacerBlock | CardPollRestore_radioOption1Restore_StepBlock | CardPollRestore_radioOption1Restore_TextResponseBlock | CardPollRestore_radioOption1Restore_TypographyBlock | CardPollRestore_radioOption1Restore_VideoBlock | CardPollRestore_radioOption1Restore_VideoTriggerBlock;

export interface CardPollRestore_radioOption2Restore_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardPollRestore_radioOption2Restore_ButtonBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_radioOption2Restore_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_radioOption2Restore_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_radioOption2Restore_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_radioOption2Restore_ButtonBlock_action = CardPollRestore_radioOption2Restore_ButtonBlock_action_PhoneAction | CardPollRestore_radioOption2Restore_ButtonBlock_action_NavigateToBlockAction | CardPollRestore_radioOption2Restore_ButtonBlock_action_LinkAction | CardPollRestore_radioOption2Restore_ButtonBlock_action_EmailAction;

export interface CardPollRestore_radioOption2Restore_ButtonBlock_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface CardPollRestore_radioOption2Restore_ButtonBlock {
  __typename: "ButtonBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  buttonVariant: ButtonVariant | null;
  buttonColor: ButtonColor | null;
  size: ButtonSize | null;
  startIconId: string | null;
  endIconId: string | null;
  submitEnabled: boolean | null;
  action: CardPollRestore_radioOption2Restore_ButtonBlock_action | null;
  settings: CardPollRestore_radioOption2Restore_ButtonBlock_settings | null;
}

export interface CardPollRestore_radioOption2Restore_CardBlock {
  __typename: "CardBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * backgroundColor should be a HEX color value e.g #FFFFFF for white.
   */
  backgroundColor: string | null;
  /**
   * backdropBlur should be a number representing blur amount in pixels e.g 20.
   */
  backdropBlur: number | null;
  /**
   * coverBlockId is present if a child block should be used as a cover.
   * This child block should not be rendered normally, instead it should be used
   * as a background. Blocks are often of type ImageBlock or VideoBlock.
   */
  coverBlockId: string | null;
  /**
   * themeMode can override journey themeMode. If nothing is set then use
   * themeMode from journey
   */
  themeMode: ThemeMode | null;
  /**
   * themeName can override journey themeName. If nothing is set then use
   * themeName from journey
   */
  themeName: ThemeName | null;
  /**
   * fullscreen should control how the coverBlock is displayed. When fullscreen
   * is set to true the coverBlock Image should be displayed as a blur in the
   * background.
   */
  fullscreen: boolean;
}

export interface CardPollRestore_radioOption2Restore_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardPollRestore_radioOption2Restore_ImageBlock {
  __typename: "ImageBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  src: string | null;
  alt: string;
  width: number;
  height: number;
  /**
   * blurhash is a compact representation of a placeholder for an image.
   * Find a frontend implementation at https: // github.com/woltapp/blurhash
   */
  blurhash: string;
  scale: number | null;
  focalTop: number | null;
  focalLeft: number | null;
}

export interface CardPollRestore_radioOption2Restore_RadioOptionBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_radioOption2Restore_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_radioOption2Restore_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_radioOption2Restore_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_radioOption2Restore_RadioOptionBlock_action = CardPollRestore_radioOption2Restore_RadioOptionBlock_action_PhoneAction | CardPollRestore_radioOption2Restore_RadioOptionBlock_action_NavigateToBlockAction | CardPollRestore_radioOption2Restore_RadioOptionBlock_action_LinkAction | CardPollRestore_radioOption2Restore_RadioOptionBlock_action_EmailAction;

export interface CardPollRestore_radioOption2Restore_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardPollRestore_radioOption2Restore_RadioOptionBlock_action | null;
  /**
   * pollOptionImageBlockId is present if a child block should be used as a poll option image.
   *       This child block should not be rendered normally, instead it should be used
   *       as a poll option image. Blocks are often of type ImageBlock
   */
  pollOptionImageBlockId: string | null;
}

export interface CardPollRestore_radioOption2Restore_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface CardPollRestore_radioOption2Restore_SignUpBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_radioOption2Restore_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_radioOption2Restore_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_radioOption2Restore_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_radioOption2Restore_SignUpBlock_action = CardPollRestore_radioOption2Restore_SignUpBlock_action_PhoneAction | CardPollRestore_radioOption2Restore_SignUpBlock_action_NavigateToBlockAction | CardPollRestore_radioOption2Restore_SignUpBlock_action_LinkAction | CardPollRestore_radioOption2Restore_SignUpBlock_action_EmailAction;

export interface CardPollRestore_radioOption2Restore_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardPollRestore_radioOption2Restore_SignUpBlock_action | null;
}

export interface CardPollRestore_radioOption2Restore_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface CardPollRestore_radioOption2Restore_StepBlock {
  __typename: "StepBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * locked will be set to true if the user should not be able to manually
   * advance to the next step.
   */
  locked: boolean;
  /**
   * nextBlockId contains the preferred block to navigate to, users will have to
   * manually set the next block they want to card to navigate to
   */
  nextBlockId: string | null;
  /**
   * Slug should be unique amongst all blocks
   * (server will throw BAD_USER_INPUT error if not)
   * If not required will use the current block id
   * If the generated slug is not unique the uuid will be placed
   * at the end of the slug guaranteeing uniqueness
   */
  slug: string | null;
}

export interface CardPollRestore_radioOption2Restore_TextResponseBlock {
  __typename: "TextResponseBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  required: boolean | null;
  label: string;
  placeholder: string | null;
  hint: string | null;
  minRows: number | null;
  type: TextResponseType | null;
  routeId: string | null;
  integrationId: string | null;
}

export interface CardPollRestore_radioOption2Restore_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardPollRestore_radioOption2Restore_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardPollRestore_radioOption2Restore_TypographyBlock_settings | null;
}

export interface CardPollRestore_radioOption2Restore_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardPollRestore_radioOption2Restore_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardPollRestore_radioOption2Restore_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardPollRestore_radioOption2Restore_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardPollRestore_radioOption2Restore_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardPollRestore_radioOption2Restore_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface CardPollRestore_radioOption2Restore_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardPollRestore_radioOption2Restore_VideoBlock_mediaVideo_Video_title[];
  images: CardPollRestore_radioOption2Restore_VideoBlock_mediaVideo_Video_images[];
  variant: CardPollRestore_radioOption2Restore_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: CardPollRestore_radioOption2Restore_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface CardPollRestore_radioOption2Restore_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardPollRestore_radioOption2Restore_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardPollRestore_radioOption2Restore_VideoBlock_mediaVideo = CardPollRestore_radioOption2Restore_VideoBlock_mediaVideo_Video | CardPollRestore_radioOption2Restore_VideoBlock_mediaVideo_MuxVideo | CardPollRestore_radioOption2Restore_VideoBlock_mediaVideo_YouTube;

export interface CardPollRestore_radioOption2Restore_VideoBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_radioOption2Restore_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_radioOption2Restore_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_radioOption2Restore_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_radioOption2Restore_VideoBlock_action = CardPollRestore_radioOption2Restore_VideoBlock_action_PhoneAction | CardPollRestore_radioOption2Restore_VideoBlock_action_NavigateToBlockAction | CardPollRestore_radioOption2Restore_VideoBlock_action_LinkAction | CardPollRestore_radioOption2Restore_VideoBlock_action_EmailAction;

export interface CardPollRestore_radioOption2Restore_VideoBlock {
  __typename: "VideoBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  muted: boolean | null;
  autoplay: boolean | null;
  /**
   * startAt dictates at which point of time the video should start playing
   */
  startAt: number | null;
  /**
   * endAt dictates at which point of time the video should end
   */
  endAt: number | null;
  /**
   * posterBlockId is present if a child block should be used as a poster.
   * This child block should not be rendered normally, instead it should be used
   * as the video poster. PosterBlock should be of type ImageBlock.
   */
  posterBlockId: string | null;
  fullsize: boolean | null;
  /**
   * internal source videos: videoId and videoVariantLanguageId both need to be set
   * to select a video.
   * For other sources only videoId needs to be set.
   */
  videoId: string | null;
  /**
   * internal source videos: videoId and videoVariantLanguageId both need to be set
   * to select a video.
   * For other sources only videoId needs to be set.
   */
  videoVariantLanguageId: string | null;
  /**
   * internal source: videoId, videoVariantLanguageId, and video present
   * youTube source: videoId, title, description, and duration present
   */
  source: VideoBlockSource;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field.
   * For other sources this is automatically populated.
   */
  title: string | null;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   */
  description: string | null;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   */
  image: string | null;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   * duration in seconds.
   */
  duration: number | null;
  /**
   * how the video should display within the VideoBlock
   */
  objectFit: VideoBlockObjectFit | null;
  mediaVideo: CardPollRestore_radioOption2Restore_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardPollRestore_radioOption2Restore_VideoBlock_action | null;
}

export interface CardPollRestore_radioOption2Restore_VideoTriggerBlock_triggerAction_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_radioOption2Restore_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_radioOption2Restore_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_radioOption2Restore_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_radioOption2Restore_VideoTriggerBlock_triggerAction = CardPollRestore_radioOption2Restore_VideoTriggerBlock_triggerAction_PhoneAction | CardPollRestore_radioOption2Restore_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardPollRestore_radioOption2Restore_VideoTriggerBlock_triggerAction_LinkAction | CardPollRestore_radioOption2Restore_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardPollRestore_radioOption2Restore_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardPollRestore_radioOption2Restore_VideoTriggerBlock_triggerAction;
}

export type CardPollRestore_radioOption2Restore = CardPollRestore_radioOption2Restore_GridContainerBlock | CardPollRestore_radioOption2Restore_ButtonBlock | CardPollRestore_radioOption2Restore_CardBlock | CardPollRestore_radioOption2Restore_IconBlock | CardPollRestore_radioOption2Restore_ImageBlock | CardPollRestore_radioOption2Restore_RadioOptionBlock | CardPollRestore_radioOption2Restore_RadioQuestionBlock | CardPollRestore_radioOption2Restore_SignUpBlock | CardPollRestore_radioOption2Restore_SpacerBlock | CardPollRestore_radioOption2Restore_StepBlock | CardPollRestore_radioOption2Restore_TextResponseBlock | CardPollRestore_radioOption2Restore_TypographyBlock | CardPollRestore_radioOption2Restore_VideoBlock | CardPollRestore_radioOption2Restore_VideoTriggerBlock;

export interface CardPollRestore_radioOption3Restore_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardPollRestore_radioOption3Restore_ButtonBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_radioOption3Restore_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_radioOption3Restore_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_radioOption3Restore_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_radioOption3Restore_ButtonBlock_action = CardPollRestore_radioOption3Restore_ButtonBlock_action_PhoneAction | CardPollRestore_radioOption3Restore_ButtonBlock_action_NavigateToBlockAction | CardPollRestore_radioOption3Restore_ButtonBlock_action_LinkAction | CardPollRestore_radioOption3Restore_ButtonBlock_action_EmailAction;

export interface CardPollRestore_radioOption3Restore_ButtonBlock_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface CardPollRestore_radioOption3Restore_ButtonBlock {
  __typename: "ButtonBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  buttonVariant: ButtonVariant | null;
  buttonColor: ButtonColor | null;
  size: ButtonSize | null;
  startIconId: string | null;
  endIconId: string | null;
  submitEnabled: boolean | null;
  action: CardPollRestore_radioOption3Restore_ButtonBlock_action | null;
  settings: CardPollRestore_radioOption3Restore_ButtonBlock_settings | null;
}

export interface CardPollRestore_radioOption3Restore_CardBlock {
  __typename: "CardBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * backgroundColor should be a HEX color value e.g #FFFFFF for white.
   */
  backgroundColor: string | null;
  /**
   * backdropBlur should be a number representing blur amount in pixels e.g 20.
   */
  backdropBlur: number | null;
  /**
   * coverBlockId is present if a child block should be used as a cover.
   * This child block should not be rendered normally, instead it should be used
   * as a background. Blocks are often of type ImageBlock or VideoBlock.
   */
  coverBlockId: string | null;
  /**
   * themeMode can override journey themeMode. If nothing is set then use
   * themeMode from journey
   */
  themeMode: ThemeMode | null;
  /**
   * themeName can override journey themeName. If nothing is set then use
   * themeName from journey
   */
  themeName: ThemeName | null;
  /**
   * fullscreen should control how the coverBlock is displayed. When fullscreen
   * is set to true the coverBlock Image should be displayed as a blur in the
   * background.
   */
  fullscreen: boolean;
}

export interface CardPollRestore_radioOption3Restore_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardPollRestore_radioOption3Restore_ImageBlock {
  __typename: "ImageBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  src: string | null;
  alt: string;
  width: number;
  height: number;
  /**
   * blurhash is a compact representation of a placeholder for an image.
   * Find a frontend implementation at https: // github.com/woltapp/blurhash
   */
  blurhash: string;
  scale: number | null;
  focalTop: number | null;
  focalLeft: number | null;
}

export interface CardPollRestore_radioOption3Restore_RadioOptionBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_radioOption3Restore_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_radioOption3Restore_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_radioOption3Restore_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_radioOption3Restore_RadioOptionBlock_action = CardPollRestore_radioOption3Restore_RadioOptionBlock_action_PhoneAction | CardPollRestore_radioOption3Restore_RadioOptionBlock_action_NavigateToBlockAction | CardPollRestore_radioOption3Restore_RadioOptionBlock_action_LinkAction | CardPollRestore_radioOption3Restore_RadioOptionBlock_action_EmailAction;

export interface CardPollRestore_radioOption3Restore_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardPollRestore_radioOption3Restore_RadioOptionBlock_action | null;
  /**
   * pollOptionImageBlockId is present if a child block should be used as a poll option image.
   *       This child block should not be rendered normally, instead it should be used
   *       as a poll option image. Blocks are often of type ImageBlock
   */
  pollOptionImageBlockId: string | null;
}

export interface CardPollRestore_radioOption3Restore_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface CardPollRestore_radioOption3Restore_SignUpBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_radioOption3Restore_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_radioOption3Restore_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_radioOption3Restore_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_radioOption3Restore_SignUpBlock_action = CardPollRestore_radioOption3Restore_SignUpBlock_action_PhoneAction | CardPollRestore_radioOption3Restore_SignUpBlock_action_NavigateToBlockAction | CardPollRestore_radioOption3Restore_SignUpBlock_action_LinkAction | CardPollRestore_radioOption3Restore_SignUpBlock_action_EmailAction;

export interface CardPollRestore_radioOption3Restore_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardPollRestore_radioOption3Restore_SignUpBlock_action | null;
}

export interface CardPollRestore_radioOption3Restore_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface CardPollRestore_radioOption3Restore_StepBlock {
  __typename: "StepBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * locked will be set to true if the user should not be able to manually
   * advance to the next step.
   */
  locked: boolean;
  /**
   * nextBlockId contains the preferred block to navigate to, users will have to
   * manually set the next block they want to card to navigate to
   */
  nextBlockId: string | null;
  /**
   * Slug should be unique amongst all blocks
   * (server will throw BAD_USER_INPUT error if not)
   * If not required will use the current block id
   * If the generated slug is not unique the uuid will be placed
   * at the end of the slug guaranteeing uniqueness
   */
  slug: string | null;
}

export interface CardPollRestore_radioOption3Restore_TextResponseBlock {
  __typename: "TextResponseBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  required: boolean | null;
  label: string;
  placeholder: string | null;
  hint: string | null;
  minRows: number | null;
  type: TextResponseType | null;
  routeId: string | null;
  integrationId: string | null;
}

export interface CardPollRestore_radioOption3Restore_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardPollRestore_radioOption3Restore_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardPollRestore_radioOption3Restore_TypographyBlock_settings | null;
}

export interface CardPollRestore_radioOption3Restore_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardPollRestore_radioOption3Restore_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardPollRestore_radioOption3Restore_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardPollRestore_radioOption3Restore_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardPollRestore_radioOption3Restore_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardPollRestore_radioOption3Restore_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface CardPollRestore_radioOption3Restore_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardPollRestore_radioOption3Restore_VideoBlock_mediaVideo_Video_title[];
  images: CardPollRestore_radioOption3Restore_VideoBlock_mediaVideo_Video_images[];
  variant: CardPollRestore_radioOption3Restore_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: CardPollRestore_radioOption3Restore_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface CardPollRestore_radioOption3Restore_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardPollRestore_radioOption3Restore_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardPollRestore_radioOption3Restore_VideoBlock_mediaVideo = CardPollRestore_radioOption3Restore_VideoBlock_mediaVideo_Video | CardPollRestore_radioOption3Restore_VideoBlock_mediaVideo_MuxVideo | CardPollRestore_radioOption3Restore_VideoBlock_mediaVideo_YouTube;

export interface CardPollRestore_radioOption3Restore_VideoBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_radioOption3Restore_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_radioOption3Restore_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_radioOption3Restore_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_radioOption3Restore_VideoBlock_action = CardPollRestore_radioOption3Restore_VideoBlock_action_PhoneAction | CardPollRestore_radioOption3Restore_VideoBlock_action_NavigateToBlockAction | CardPollRestore_radioOption3Restore_VideoBlock_action_LinkAction | CardPollRestore_radioOption3Restore_VideoBlock_action_EmailAction;

export interface CardPollRestore_radioOption3Restore_VideoBlock {
  __typename: "VideoBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  muted: boolean | null;
  autoplay: boolean | null;
  /**
   * startAt dictates at which point of time the video should start playing
   */
  startAt: number | null;
  /**
   * endAt dictates at which point of time the video should end
   */
  endAt: number | null;
  /**
   * posterBlockId is present if a child block should be used as a poster.
   * This child block should not be rendered normally, instead it should be used
   * as the video poster. PosterBlock should be of type ImageBlock.
   */
  posterBlockId: string | null;
  fullsize: boolean | null;
  /**
   * internal source videos: videoId and videoVariantLanguageId both need to be set
   * to select a video.
   * For other sources only videoId needs to be set.
   */
  videoId: string | null;
  /**
   * internal source videos: videoId and videoVariantLanguageId both need to be set
   * to select a video.
   * For other sources only videoId needs to be set.
   */
  videoVariantLanguageId: string | null;
  /**
   * internal source: videoId, videoVariantLanguageId, and video present
   * youTube source: videoId, title, description, and duration present
   */
  source: VideoBlockSource;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field.
   * For other sources this is automatically populated.
   */
  title: string | null;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   */
  description: string | null;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   */
  image: string | null;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   * duration in seconds.
   */
  duration: number | null;
  /**
   * how the video should display within the VideoBlock
   */
  objectFit: VideoBlockObjectFit | null;
  mediaVideo: CardPollRestore_radioOption3Restore_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardPollRestore_radioOption3Restore_VideoBlock_action | null;
}

export interface CardPollRestore_radioOption3Restore_VideoTriggerBlock_triggerAction_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_radioOption3Restore_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_radioOption3Restore_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_radioOption3Restore_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_radioOption3Restore_VideoTriggerBlock_triggerAction = CardPollRestore_radioOption3Restore_VideoTriggerBlock_triggerAction_PhoneAction | CardPollRestore_radioOption3Restore_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardPollRestore_radioOption3Restore_VideoTriggerBlock_triggerAction_LinkAction | CardPollRestore_radioOption3Restore_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardPollRestore_radioOption3Restore_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardPollRestore_radioOption3Restore_VideoTriggerBlock_triggerAction;
}

export type CardPollRestore_radioOption3Restore = CardPollRestore_radioOption3Restore_GridContainerBlock | CardPollRestore_radioOption3Restore_ButtonBlock | CardPollRestore_radioOption3Restore_CardBlock | CardPollRestore_radioOption3Restore_IconBlock | CardPollRestore_radioOption3Restore_ImageBlock | CardPollRestore_radioOption3Restore_RadioOptionBlock | CardPollRestore_radioOption3Restore_RadioQuestionBlock | CardPollRestore_radioOption3Restore_SignUpBlock | CardPollRestore_radioOption3Restore_SpacerBlock | CardPollRestore_radioOption3Restore_StepBlock | CardPollRestore_radioOption3Restore_TextResponseBlock | CardPollRestore_radioOption3Restore_TypographyBlock | CardPollRestore_radioOption3Restore_VideoBlock | CardPollRestore_radioOption3Restore_VideoTriggerBlock;

export interface CardPollRestore_radioOption4Restore_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardPollRestore_radioOption4Restore_ButtonBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_radioOption4Restore_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_radioOption4Restore_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_radioOption4Restore_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_radioOption4Restore_ButtonBlock_action = CardPollRestore_radioOption4Restore_ButtonBlock_action_PhoneAction | CardPollRestore_radioOption4Restore_ButtonBlock_action_NavigateToBlockAction | CardPollRestore_radioOption4Restore_ButtonBlock_action_LinkAction | CardPollRestore_radioOption4Restore_ButtonBlock_action_EmailAction;

export interface CardPollRestore_radioOption4Restore_ButtonBlock_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface CardPollRestore_radioOption4Restore_ButtonBlock {
  __typename: "ButtonBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  buttonVariant: ButtonVariant | null;
  buttonColor: ButtonColor | null;
  size: ButtonSize | null;
  startIconId: string | null;
  endIconId: string | null;
  submitEnabled: boolean | null;
  action: CardPollRestore_radioOption4Restore_ButtonBlock_action | null;
  settings: CardPollRestore_radioOption4Restore_ButtonBlock_settings | null;
}

export interface CardPollRestore_radioOption4Restore_CardBlock {
  __typename: "CardBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * backgroundColor should be a HEX color value e.g #FFFFFF for white.
   */
  backgroundColor: string | null;
  /**
   * backdropBlur should be a number representing blur amount in pixels e.g 20.
   */
  backdropBlur: number | null;
  /**
   * coverBlockId is present if a child block should be used as a cover.
   * This child block should not be rendered normally, instead it should be used
   * as a background. Blocks are often of type ImageBlock or VideoBlock.
   */
  coverBlockId: string | null;
  /**
   * themeMode can override journey themeMode. If nothing is set then use
   * themeMode from journey
   */
  themeMode: ThemeMode | null;
  /**
   * themeName can override journey themeName. If nothing is set then use
   * themeName from journey
   */
  themeName: ThemeName | null;
  /**
   * fullscreen should control how the coverBlock is displayed. When fullscreen
   * is set to true the coverBlock Image should be displayed as a blur in the
   * background.
   */
  fullscreen: boolean;
}

export interface CardPollRestore_radioOption4Restore_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardPollRestore_radioOption4Restore_ImageBlock {
  __typename: "ImageBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  src: string | null;
  alt: string;
  width: number;
  height: number;
  /**
   * blurhash is a compact representation of a placeholder for an image.
   * Find a frontend implementation at https: // github.com/woltapp/blurhash
   */
  blurhash: string;
  scale: number | null;
  focalTop: number | null;
  focalLeft: number | null;
}

export interface CardPollRestore_radioOption4Restore_RadioOptionBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_radioOption4Restore_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_radioOption4Restore_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_radioOption4Restore_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_radioOption4Restore_RadioOptionBlock_action = CardPollRestore_radioOption4Restore_RadioOptionBlock_action_PhoneAction | CardPollRestore_radioOption4Restore_RadioOptionBlock_action_NavigateToBlockAction | CardPollRestore_radioOption4Restore_RadioOptionBlock_action_LinkAction | CardPollRestore_radioOption4Restore_RadioOptionBlock_action_EmailAction;

export interface CardPollRestore_radioOption4Restore_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardPollRestore_radioOption4Restore_RadioOptionBlock_action | null;
  /**
   * pollOptionImageBlockId is present if a child block should be used as a poll option image.
   *       This child block should not be rendered normally, instead it should be used
   *       as a poll option image. Blocks are often of type ImageBlock
   */
  pollOptionImageBlockId: string | null;
}

export interface CardPollRestore_radioOption4Restore_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface CardPollRestore_radioOption4Restore_SignUpBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_radioOption4Restore_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_radioOption4Restore_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_radioOption4Restore_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_radioOption4Restore_SignUpBlock_action = CardPollRestore_radioOption4Restore_SignUpBlock_action_PhoneAction | CardPollRestore_radioOption4Restore_SignUpBlock_action_NavigateToBlockAction | CardPollRestore_radioOption4Restore_SignUpBlock_action_LinkAction | CardPollRestore_radioOption4Restore_SignUpBlock_action_EmailAction;

export interface CardPollRestore_radioOption4Restore_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardPollRestore_radioOption4Restore_SignUpBlock_action | null;
}

export interface CardPollRestore_radioOption4Restore_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface CardPollRestore_radioOption4Restore_StepBlock {
  __typename: "StepBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * locked will be set to true if the user should not be able to manually
   * advance to the next step.
   */
  locked: boolean;
  /**
   * nextBlockId contains the preferred block to navigate to, users will have to
   * manually set the next block they want to card to navigate to
   */
  nextBlockId: string | null;
  /**
   * Slug should be unique amongst all blocks
   * (server will throw BAD_USER_INPUT error if not)
   * If not required will use the current block id
   * If the generated slug is not unique the uuid will be placed
   * at the end of the slug guaranteeing uniqueness
   */
  slug: string | null;
}

export interface CardPollRestore_radioOption4Restore_TextResponseBlock {
  __typename: "TextResponseBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  required: boolean | null;
  label: string;
  placeholder: string | null;
  hint: string | null;
  minRows: number | null;
  type: TextResponseType | null;
  routeId: string | null;
  integrationId: string | null;
}

export interface CardPollRestore_radioOption4Restore_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardPollRestore_radioOption4Restore_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardPollRestore_radioOption4Restore_TypographyBlock_settings | null;
}

export interface CardPollRestore_radioOption4Restore_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardPollRestore_radioOption4Restore_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardPollRestore_radioOption4Restore_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardPollRestore_radioOption4Restore_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardPollRestore_radioOption4Restore_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardPollRestore_radioOption4Restore_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface CardPollRestore_radioOption4Restore_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardPollRestore_radioOption4Restore_VideoBlock_mediaVideo_Video_title[];
  images: CardPollRestore_radioOption4Restore_VideoBlock_mediaVideo_Video_images[];
  variant: CardPollRestore_radioOption4Restore_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: CardPollRestore_radioOption4Restore_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface CardPollRestore_radioOption4Restore_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardPollRestore_radioOption4Restore_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardPollRestore_radioOption4Restore_VideoBlock_mediaVideo = CardPollRestore_radioOption4Restore_VideoBlock_mediaVideo_Video | CardPollRestore_radioOption4Restore_VideoBlock_mediaVideo_MuxVideo | CardPollRestore_radioOption4Restore_VideoBlock_mediaVideo_YouTube;

export interface CardPollRestore_radioOption4Restore_VideoBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_radioOption4Restore_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_radioOption4Restore_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_radioOption4Restore_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_radioOption4Restore_VideoBlock_action = CardPollRestore_radioOption4Restore_VideoBlock_action_PhoneAction | CardPollRestore_radioOption4Restore_VideoBlock_action_NavigateToBlockAction | CardPollRestore_radioOption4Restore_VideoBlock_action_LinkAction | CardPollRestore_radioOption4Restore_VideoBlock_action_EmailAction;

export interface CardPollRestore_radioOption4Restore_VideoBlock {
  __typename: "VideoBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  muted: boolean | null;
  autoplay: boolean | null;
  /**
   * startAt dictates at which point of time the video should start playing
   */
  startAt: number | null;
  /**
   * endAt dictates at which point of time the video should end
   */
  endAt: number | null;
  /**
   * posterBlockId is present if a child block should be used as a poster.
   * This child block should not be rendered normally, instead it should be used
   * as the video poster. PosterBlock should be of type ImageBlock.
   */
  posterBlockId: string | null;
  fullsize: boolean | null;
  /**
   * internal source videos: videoId and videoVariantLanguageId both need to be set
   * to select a video.
   * For other sources only videoId needs to be set.
   */
  videoId: string | null;
  /**
   * internal source videos: videoId and videoVariantLanguageId both need to be set
   * to select a video.
   * For other sources only videoId needs to be set.
   */
  videoVariantLanguageId: string | null;
  /**
   * internal source: videoId, videoVariantLanguageId, and video present
   * youTube source: videoId, title, description, and duration present
   */
  source: VideoBlockSource;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field.
   * For other sources this is automatically populated.
   */
  title: string | null;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   */
  description: string | null;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   */
  image: string | null;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   * duration in seconds.
   */
  duration: number | null;
  /**
   * how the video should display within the VideoBlock
   */
  objectFit: VideoBlockObjectFit | null;
  mediaVideo: CardPollRestore_radioOption4Restore_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardPollRestore_radioOption4Restore_VideoBlock_action | null;
}

export interface CardPollRestore_radioOption4Restore_VideoTriggerBlock_triggerAction_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_radioOption4Restore_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_radioOption4Restore_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_radioOption4Restore_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_radioOption4Restore_VideoTriggerBlock_triggerAction = CardPollRestore_radioOption4Restore_VideoTriggerBlock_triggerAction_PhoneAction | CardPollRestore_radioOption4Restore_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardPollRestore_radioOption4Restore_VideoTriggerBlock_triggerAction_LinkAction | CardPollRestore_radioOption4Restore_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardPollRestore_radioOption4Restore_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardPollRestore_radioOption4Restore_VideoTriggerBlock_triggerAction;
}

export type CardPollRestore_radioOption4Restore = CardPollRestore_radioOption4Restore_GridContainerBlock | CardPollRestore_radioOption4Restore_ButtonBlock | CardPollRestore_radioOption4Restore_CardBlock | CardPollRestore_radioOption4Restore_IconBlock | CardPollRestore_radioOption4Restore_ImageBlock | CardPollRestore_radioOption4Restore_RadioOptionBlock | CardPollRestore_radioOption4Restore_RadioQuestionBlock | CardPollRestore_radioOption4Restore_SignUpBlock | CardPollRestore_radioOption4Restore_SpacerBlock | CardPollRestore_radioOption4Restore_StepBlock | CardPollRestore_radioOption4Restore_TextResponseBlock | CardPollRestore_radioOption4Restore_TypographyBlock | CardPollRestore_radioOption4Restore_VideoBlock | CardPollRestore_radioOption4Restore_VideoTriggerBlock;

export interface CardPollRestore_bodyRestore_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardPollRestore_bodyRestore_ButtonBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_bodyRestore_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_bodyRestore_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_bodyRestore_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_bodyRestore_ButtonBlock_action = CardPollRestore_bodyRestore_ButtonBlock_action_PhoneAction | CardPollRestore_bodyRestore_ButtonBlock_action_NavigateToBlockAction | CardPollRestore_bodyRestore_ButtonBlock_action_LinkAction | CardPollRestore_bodyRestore_ButtonBlock_action_EmailAction;

export interface CardPollRestore_bodyRestore_ButtonBlock_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface CardPollRestore_bodyRestore_ButtonBlock {
  __typename: "ButtonBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  buttonVariant: ButtonVariant | null;
  buttonColor: ButtonColor | null;
  size: ButtonSize | null;
  startIconId: string | null;
  endIconId: string | null;
  submitEnabled: boolean | null;
  action: CardPollRestore_bodyRestore_ButtonBlock_action | null;
  settings: CardPollRestore_bodyRestore_ButtonBlock_settings | null;
}

export interface CardPollRestore_bodyRestore_CardBlock {
  __typename: "CardBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * backgroundColor should be a HEX color value e.g #FFFFFF for white.
   */
  backgroundColor: string | null;
  /**
   * backdropBlur should be a number representing blur amount in pixels e.g 20.
   */
  backdropBlur: number | null;
  /**
   * coverBlockId is present if a child block should be used as a cover.
   * This child block should not be rendered normally, instead it should be used
   * as a background. Blocks are often of type ImageBlock or VideoBlock.
   */
  coverBlockId: string | null;
  /**
   * themeMode can override journey themeMode. If nothing is set then use
   * themeMode from journey
   */
  themeMode: ThemeMode | null;
  /**
   * themeName can override journey themeName. If nothing is set then use
   * themeName from journey
   */
  themeName: ThemeName | null;
  /**
   * fullscreen should control how the coverBlock is displayed. When fullscreen
   * is set to true the coverBlock Image should be displayed as a blur in the
   * background.
   */
  fullscreen: boolean;
}

export interface CardPollRestore_bodyRestore_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardPollRestore_bodyRestore_ImageBlock {
  __typename: "ImageBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  src: string | null;
  alt: string;
  width: number;
  height: number;
  /**
   * blurhash is a compact representation of a placeholder for an image.
   * Find a frontend implementation at https: // github.com/woltapp/blurhash
   */
  blurhash: string;
  scale: number | null;
  focalTop: number | null;
  focalLeft: number | null;
}

export interface CardPollRestore_bodyRestore_RadioOptionBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_bodyRestore_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_bodyRestore_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_bodyRestore_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_bodyRestore_RadioOptionBlock_action = CardPollRestore_bodyRestore_RadioOptionBlock_action_PhoneAction | CardPollRestore_bodyRestore_RadioOptionBlock_action_NavigateToBlockAction | CardPollRestore_bodyRestore_RadioOptionBlock_action_LinkAction | CardPollRestore_bodyRestore_RadioOptionBlock_action_EmailAction;

export interface CardPollRestore_bodyRestore_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardPollRestore_bodyRestore_RadioOptionBlock_action | null;
  /**
   * pollOptionImageBlockId is present if a child block should be used as a poll option image.
   *       This child block should not be rendered normally, instead it should be used
   *       as a poll option image. Blocks are often of type ImageBlock
   */
  pollOptionImageBlockId: string | null;
}

export interface CardPollRestore_bodyRestore_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface CardPollRestore_bodyRestore_SignUpBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_bodyRestore_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_bodyRestore_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_bodyRestore_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_bodyRestore_SignUpBlock_action = CardPollRestore_bodyRestore_SignUpBlock_action_PhoneAction | CardPollRestore_bodyRestore_SignUpBlock_action_NavigateToBlockAction | CardPollRestore_bodyRestore_SignUpBlock_action_LinkAction | CardPollRestore_bodyRestore_SignUpBlock_action_EmailAction;

export interface CardPollRestore_bodyRestore_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardPollRestore_bodyRestore_SignUpBlock_action | null;
}

export interface CardPollRestore_bodyRestore_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface CardPollRestore_bodyRestore_StepBlock {
  __typename: "StepBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * locked will be set to true if the user should not be able to manually
   * advance to the next step.
   */
  locked: boolean;
  /**
   * nextBlockId contains the preferred block to navigate to, users will have to
   * manually set the next block they want to card to navigate to
   */
  nextBlockId: string | null;
  /**
   * Slug should be unique amongst all blocks
   * (server will throw BAD_USER_INPUT error if not)
   * If not required will use the current block id
   * If the generated slug is not unique the uuid will be placed
   * at the end of the slug guaranteeing uniqueness
   */
  slug: string | null;
}

export interface CardPollRestore_bodyRestore_TextResponseBlock {
  __typename: "TextResponseBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  required: boolean | null;
  label: string;
  placeholder: string | null;
  hint: string | null;
  minRows: number | null;
  type: TextResponseType | null;
  routeId: string | null;
  integrationId: string | null;
}

export interface CardPollRestore_bodyRestore_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardPollRestore_bodyRestore_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardPollRestore_bodyRestore_TypographyBlock_settings | null;
}

export interface CardPollRestore_bodyRestore_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardPollRestore_bodyRestore_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardPollRestore_bodyRestore_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardPollRestore_bodyRestore_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardPollRestore_bodyRestore_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardPollRestore_bodyRestore_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface CardPollRestore_bodyRestore_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardPollRestore_bodyRestore_VideoBlock_mediaVideo_Video_title[];
  images: CardPollRestore_bodyRestore_VideoBlock_mediaVideo_Video_images[];
  variant: CardPollRestore_bodyRestore_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: CardPollRestore_bodyRestore_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface CardPollRestore_bodyRestore_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardPollRestore_bodyRestore_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardPollRestore_bodyRestore_VideoBlock_mediaVideo = CardPollRestore_bodyRestore_VideoBlock_mediaVideo_Video | CardPollRestore_bodyRestore_VideoBlock_mediaVideo_MuxVideo | CardPollRestore_bodyRestore_VideoBlock_mediaVideo_YouTube;

export interface CardPollRestore_bodyRestore_VideoBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_bodyRestore_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_bodyRestore_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_bodyRestore_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_bodyRestore_VideoBlock_action = CardPollRestore_bodyRestore_VideoBlock_action_PhoneAction | CardPollRestore_bodyRestore_VideoBlock_action_NavigateToBlockAction | CardPollRestore_bodyRestore_VideoBlock_action_LinkAction | CardPollRestore_bodyRestore_VideoBlock_action_EmailAction;

export interface CardPollRestore_bodyRestore_VideoBlock {
  __typename: "VideoBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  muted: boolean | null;
  autoplay: boolean | null;
  /**
   * startAt dictates at which point of time the video should start playing
   */
  startAt: number | null;
  /**
   * endAt dictates at which point of time the video should end
   */
  endAt: number | null;
  /**
   * posterBlockId is present if a child block should be used as a poster.
   * This child block should not be rendered normally, instead it should be used
   * as the video poster. PosterBlock should be of type ImageBlock.
   */
  posterBlockId: string | null;
  fullsize: boolean | null;
  /**
   * internal source videos: videoId and videoVariantLanguageId both need to be set
   * to select a video.
   * For other sources only videoId needs to be set.
   */
  videoId: string | null;
  /**
   * internal source videos: videoId and videoVariantLanguageId both need to be set
   * to select a video.
   * For other sources only videoId needs to be set.
   */
  videoVariantLanguageId: string | null;
  /**
   * internal source: videoId, videoVariantLanguageId, and video present
   * youTube source: videoId, title, description, and duration present
   */
  source: VideoBlockSource;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field.
   * For other sources this is automatically populated.
   */
  title: string | null;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   */
  description: string | null;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   */
  image: string | null;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   * duration in seconds.
   */
  duration: number | null;
  /**
   * how the video should display within the VideoBlock
   */
  objectFit: VideoBlockObjectFit | null;
  mediaVideo: CardPollRestore_bodyRestore_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardPollRestore_bodyRestore_VideoBlock_action | null;
}

export interface CardPollRestore_bodyRestore_VideoTriggerBlock_triggerAction_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardPollRestore_bodyRestore_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollRestore_bodyRestore_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardPollRestore_bodyRestore_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardPollRestore_bodyRestore_VideoTriggerBlock_triggerAction = CardPollRestore_bodyRestore_VideoTriggerBlock_triggerAction_PhoneAction | CardPollRestore_bodyRestore_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardPollRestore_bodyRestore_VideoTriggerBlock_triggerAction_LinkAction | CardPollRestore_bodyRestore_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardPollRestore_bodyRestore_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardPollRestore_bodyRestore_VideoTriggerBlock_triggerAction;
}

export type CardPollRestore_bodyRestore = CardPollRestore_bodyRestore_GridContainerBlock | CardPollRestore_bodyRestore_ButtonBlock | CardPollRestore_bodyRestore_CardBlock | CardPollRestore_bodyRestore_IconBlock | CardPollRestore_bodyRestore_ImageBlock | CardPollRestore_bodyRestore_RadioOptionBlock | CardPollRestore_bodyRestore_RadioQuestionBlock | CardPollRestore_bodyRestore_SignUpBlock | CardPollRestore_bodyRestore_SpacerBlock | CardPollRestore_bodyRestore_StepBlock | CardPollRestore_bodyRestore_TextResponseBlock | CardPollRestore_bodyRestore_TypographyBlock | CardPollRestore_bodyRestore_VideoBlock | CardPollRestore_bodyRestore_VideoTriggerBlock;

export interface CardPollRestore {
  /**
   * blockRestore is used for redo/undo
   */
  imageRestore: CardPollRestore_imageRestore[];
  /**
   * blockRestore is used for redo/undo
   */
  subtitleRestore: CardPollRestore_subtitleRestore[];
  /**
   * blockRestore is used for redo/undo
   */
  titleRestore: CardPollRestore_titleRestore[];
  /**
   * blockRestore is used for redo/undo
   */
  radioQuestionRestore: CardPollRestore_radioQuestionRestore[];
  /**
   * blockRestore is used for redo/undo
   */
  radioOption1Restore: CardPollRestore_radioOption1Restore[];
  /**
   * blockRestore is used for redo/undo
   */
  radioOption2Restore: CardPollRestore_radioOption2Restore[];
  /**
   * blockRestore is used for redo/undo
   */
  radioOption3Restore: CardPollRestore_radioOption3Restore[];
  /**
   * blockRestore is used for redo/undo
   */
  radioOption4Restore: CardPollRestore_radioOption4Restore[];
  /**
   * blockRestore is used for redo/undo
   */
  bodyRestore: CardPollRestore_bodyRestore[];
}

export interface CardPollRestoreVariables {
  imageId: string;
  subtitleId: string;
  titleId: string;
  radioQuestionId: string;
  radioOption1Id: string;
  radioOption2Id: string;
  radioOption3Id: string;
  radioOption4Id: string;
  bodyId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ButtonVariant, ButtonColor, ButtonSize, ButtonAlignment, ThemeMode, ThemeName, IconName, IconSize, IconColor, TextResponseType, TypographyAlign, TypographyColor, TypographyVariant, VideoBlockSource, VideoBlockObjectFit } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TextResponseWithButtonRestore
// ====================================================

export interface TextResponseWithButtonRestore_textResponse_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface TextResponseWithButtonRestore_textResponse_ButtonBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface TextResponseWithButtonRestore_textResponse_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface TextResponseWithButtonRestore_textResponse_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface TextResponseWithButtonRestore_textResponse_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type TextResponseWithButtonRestore_textResponse_ButtonBlock_action = TextResponseWithButtonRestore_textResponse_ButtonBlock_action_PhoneAction | TextResponseWithButtonRestore_textResponse_ButtonBlock_action_NavigateToBlockAction | TextResponseWithButtonRestore_textResponse_ButtonBlock_action_LinkAction | TextResponseWithButtonRestore_textResponse_ButtonBlock_action_EmailAction;

export interface TextResponseWithButtonRestore_textResponse_ButtonBlock_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface TextResponseWithButtonRestore_textResponse_ButtonBlock {
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
  action: TextResponseWithButtonRestore_textResponse_ButtonBlock_action | null;
  settings: TextResponseWithButtonRestore_textResponse_ButtonBlock_settings | null;
}

export interface TextResponseWithButtonRestore_textResponse_CardBlock {
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

export interface TextResponseWithButtonRestore_textResponse_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface TextResponseWithButtonRestore_textResponse_ImageBlock {
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

export interface TextResponseWithButtonRestore_textResponse_MultiselectOptionBlock {
  __typename: "MultiselectOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
}

export interface TextResponseWithButtonRestore_textResponse_MultiselectBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  target: string | null;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface TextResponseWithButtonRestore_textResponse_MultiselectBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface TextResponseWithButtonRestore_textResponse_MultiselectBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export interface TextResponseWithButtonRestore_textResponse_MultiselectBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
  phone: string;
  countryCode: string;
}

export type TextResponseWithButtonRestore_textResponse_MultiselectBlock_action = TextResponseWithButtonRestore_textResponse_MultiselectBlock_action_LinkAction | TextResponseWithButtonRestore_textResponse_MultiselectBlock_action_NavigateToBlockAction | TextResponseWithButtonRestore_textResponse_MultiselectBlock_action_EmailAction | TextResponseWithButtonRestore_textResponse_MultiselectBlock_action_PhoneAction;

export interface TextResponseWithButtonRestore_textResponse_MultiselectBlock {
  __typename: "MultiselectBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  min: number | null;
  max: number | null;
  action: TextResponseWithButtonRestore_textResponse_MultiselectBlock_action | null;
}

export interface TextResponseWithButtonRestore_textResponse_RadioOptionBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface TextResponseWithButtonRestore_textResponse_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface TextResponseWithButtonRestore_textResponse_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface TextResponseWithButtonRestore_textResponse_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type TextResponseWithButtonRestore_textResponse_RadioOptionBlock_action = TextResponseWithButtonRestore_textResponse_RadioOptionBlock_action_PhoneAction | TextResponseWithButtonRestore_textResponse_RadioOptionBlock_action_NavigateToBlockAction | TextResponseWithButtonRestore_textResponse_RadioOptionBlock_action_LinkAction | TextResponseWithButtonRestore_textResponse_RadioOptionBlock_action_EmailAction;

export interface TextResponseWithButtonRestore_textResponse_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: TextResponseWithButtonRestore_textResponse_RadioOptionBlock_action | null;
  /**
   * pollOptionImageBlockId is present if a child block should be used as a poll option image.
   *       This child block should not be rendered normally, instead it should be used
   *       as a poll option image. Blocks are often of type ImageBlock
   */
  pollOptionImageBlockId: string | null;
}

export interface TextResponseWithButtonRestore_textResponse_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface TextResponseWithButtonRestore_textResponse_SignUpBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface TextResponseWithButtonRestore_textResponse_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface TextResponseWithButtonRestore_textResponse_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface TextResponseWithButtonRestore_textResponse_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type TextResponseWithButtonRestore_textResponse_SignUpBlock_action = TextResponseWithButtonRestore_textResponse_SignUpBlock_action_PhoneAction | TextResponseWithButtonRestore_textResponse_SignUpBlock_action_NavigateToBlockAction | TextResponseWithButtonRestore_textResponse_SignUpBlock_action_LinkAction | TextResponseWithButtonRestore_textResponse_SignUpBlock_action_EmailAction;

export interface TextResponseWithButtonRestore_textResponse_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: TextResponseWithButtonRestore_textResponse_SignUpBlock_action | null;
}

export interface TextResponseWithButtonRestore_textResponse_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface TextResponseWithButtonRestore_textResponse_StepBlock {
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

export interface TextResponseWithButtonRestore_textResponse_TextResponseBlock {
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

export interface TextResponseWithButtonRestore_textResponse_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface TextResponseWithButtonRestore_textResponse_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: TextResponseWithButtonRestore_textResponse_TypographyBlock_settings | null;
}

export interface TextResponseWithButtonRestore_textResponse_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface TextResponseWithButtonRestore_textResponse_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface TextResponseWithButtonRestore_textResponse_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface TextResponseWithButtonRestore_textResponse_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface TextResponseWithButtonRestore_textResponse_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: TextResponseWithButtonRestore_textResponse_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface TextResponseWithButtonRestore_textResponse_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: TextResponseWithButtonRestore_textResponse_VideoBlock_mediaVideo_Video_title[];
  images: TextResponseWithButtonRestore_textResponse_VideoBlock_mediaVideo_Video_images[];
  variant: TextResponseWithButtonRestore_textResponse_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: TextResponseWithButtonRestore_textResponse_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface TextResponseWithButtonRestore_textResponse_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface TextResponseWithButtonRestore_textResponse_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type TextResponseWithButtonRestore_textResponse_VideoBlock_mediaVideo = TextResponseWithButtonRestore_textResponse_VideoBlock_mediaVideo_Video | TextResponseWithButtonRestore_textResponse_VideoBlock_mediaVideo_MuxVideo | TextResponseWithButtonRestore_textResponse_VideoBlock_mediaVideo_YouTube;

export interface TextResponseWithButtonRestore_textResponse_VideoBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface TextResponseWithButtonRestore_textResponse_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface TextResponseWithButtonRestore_textResponse_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface TextResponseWithButtonRestore_textResponse_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type TextResponseWithButtonRestore_textResponse_VideoBlock_action = TextResponseWithButtonRestore_textResponse_VideoBlock_action_PhoneAction | TextResponseWithButtonRestore_textResponse_VideoBlock_action_NavigateToBlockAction | TextResponseWithButtonRestore_textResponse_VideoBlock_action_LinkAction | TextResponseWithButtonRestore_textResponse_VideoBlock_action_EmailAction;

export interface TextResponseWithButtonRestore_textResponse_VideoBlock {
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
  mediaVideo: TextResponseWithButtonRestore_textResponse_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: TextResponseWithButtonRestore_textResponse_VideoBlock_action | null;
}

export interface TextResponseWithButtonRestore_textResponse_VideoTriggerBlock_triggerAction_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface TextResponseWithButtonRestore_textResponse_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface TextResponseWithButtonRestore_textResponse_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface TextResponseWithButtonRestore_textResponse_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type TextResponseWithButtonRestore_textResponse_VideoTriggerBlock_triggerAction = TextResponseWithButtonRestore_textResponse_VideoTriggerBlock_triggerAction_PhoneAction | TextResponseWithButtonRestore_textResponse_VideoTriggerBlock_triggerAction_NavigateToBlockAction | TextResponseWithButtonRestore_textResponse_VideoTriggerBlock_triggerAction_LinkAction | TextResponseWithButtonRestore_textResponse_VideoTriggerBlock_triggerAction_EmailAction;

export interface TextResponseWithButtonRestore_textResponse_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: TextResponseWithButtonRestore_textResponse_VideoTriggerBlock_triggerAction;
}

export type TextResponseWithButtonRestore_textResponse = TextResponseWithButtonRestore_textResponse_GridContainerBlock | TextResponseWithButtonRestore_textResponse_ButtonBlock | TextResponseWithButtonRestore_textResponse_CardBlock | TextResponseWithButtonRestore_textResponse_IconBlock | TextResponseWithButtonRestore_textResponse_ImageBlock | TextResponseWithButtonRestore_textResponse_MultiselectOptionBlock | TextResponseWithButtonRestore_textResponse_MultiselectBlock | TextResponseWithButtonRestore_textResponse_RadioOptionBlock | TextResponseWithButtonRestore_textResponse_RadioQuestionBlock | TextResponseWithButtonRestore_textResponse_SignUpBlock | TextResponseWithButtonRestore_textResponse_SpacerBlock | TextResponseWithButtonRestore_textResponse_StepBlock | TextResponseWithButtonRestore_textResponse_TextResponseBlock | TextResponseWithButtonRestore_textResponse_TypographyBlock | TextResponseWithButtonRestore_textResponse_VideoBlock | TextResponseWithButtonRestore_textResponse_VideoTriggerBlock;

export interface TextResponseWithButtonRestore_button_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface TextResponseWithButtonRestore_button_ButtonBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface TextResponseWithButtonRestore_button_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface TextResponseWithButtonRestore_button_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface TextResponseWithButtonRestore_button_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type TextResponseWithButtonRestore_button_ButtonBlock_action = TextResponseWithButtonRestore_button_ButtonBlock_action_PhoneAction | TextResponseWithButtonRestore_button_ButtonBlock_action_NavigateToBlockAction | TextResponseWithButtonRestore_button_ButtonBlock_action_LinkAction | TextResponseWithButtonRestore_button_ButtonBlock_action_EmailAction;

export interface TextResponseWithButtonRestore_button_ButtonBlock_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface TextResponseWithButtonRestore_button_ButtonBlock {
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
  action: TextResponseWithButtonRestore_button_ButtonBlock_action | null;
  settings: TextResponseWithButtonRestore_button_ButtonBlock_settings | null;
}

export interface TextResponseWithButtonRestore_button_CardBlock {
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

export interface TextResponseWithButtonRestore_button_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface TextResponseWithButtonRestore_button_ImageBlock {
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

export interface TextResponseWithButtonRestore_button_MultiselectOptionBlock {
  __typename: "MultiselectOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
}

export interface TextResponseWithButtonRestore_button_MultiselectBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  target: string | null;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface TextResponseWithButtonRestore_button_MultiselectBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface TextResponseWithButtonRestore_button_MultiselectBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export interface TextResponseWithButtonRestore_button_MultiselectBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
  phone: string;
  countryCode: string;
}

export type TextResponseWithButtonRestore_button_MultiselectBlock_action = TextResponseWithButtonRestore_button_MultiselectBlock_action_LinkAction | TextResponseWithButtonRestore_button_MultiselectBlock_action_NavigateToBlockAction | TextResponseWithButtonRestore_button_MultiselectBlock_action_EmailAction | TextResponseWithButtonRestore_button_MultiselectBlock_action_PhoneAction;

export interface TextResponseWithButtonRestore_button_MultiselectBlock {
  __typename: "MultiselectBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  min: number | null;
  max: number | null;
  action: TextResponseWithButtonRestore_button_MultiselectBlock_action | null;
}

export interface TextResponseWithButtonRestore_button_RadioOptionBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface TextResponseWithButtonRestore_button_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface TextResponseWithButtonRestore_button_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface TextResponseWithButtonRestore_button_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type TextResponseWithButtonRestore_button_RadioOptionBlock_action = TextResponseWithButtonRestore_button_RadioOptionBlock_action_PhoneAction | TextResponseWithButtonRestore_button_RadioOptionBlock_action_NavigateToBlockAction | TextResponseWithButtonRestore_button_RadioOptionBlock_action_LinkAction | TextResponseWithButtonRestore_button_RadioOptionBlock_action_EmailAction;

export interface TextResponseWithButtonRestore_button_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: TextResponseWithButtonRestore_button_RadioOptionBlock_action | null;
  /**
   * pollOptionImageBlockId is present if a child block should be used as a poll option image.
   *       This child block should not be rendered normally, instead it should be used
   *       as a poll option image. Blocks are often of type ImageBlock
   */
  pollOptionImageBlockId: string | null;
}

export interface TextResponseWithButtonRestore_button_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface TextResponseWithButtonRestore_button_SignUpBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface TextResponseWithButtonRestore_button_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface TextResponseWithButtonRestore_button_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface TextResponseWithButtonRestore_button_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type TextResponseWithButtonRestore_button_SignUpBlock_action = TextResponseWithButtonRestore_button_SignUpBlock_action_PhoneAction | TextResponseWithButtonRestore_button_SignUpBlock_action_NavigateToBlockAction | TextResponseWithButtonRestore_button_SignUpBlock_action_LinkAction | TextResponseWithButtonRestore_button_SignUpBlock_action_EmailAction;

export interface TextResponseWithButtonRestore_button_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: TextResponseWithButtonRestore_button_SignUpBlock_action | null;
}

export interface TextResponseWithButtonRestore_button_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface TextResponseWithButtonRestore_button_StepBlock {
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

export interface TextResponseWithButtonRestore_button_TextResponseBlock {
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

export interface TextResponseWithButtonRestore_button_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface TextResponseWithButtonRestore_button_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: TextResponseWithButtonRestore_button_TypographyBlock_settings | null;
}

export interface TextResponseWithButtonRestore_button_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface TextResponseWithButtonRestore_button_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface TextResponseWithButtonRestore_button_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface TextResponseWithButtonRestore_button_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface TextResponseWithButtonRestore_button_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: TextResponseWithButtonRestore_button_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface TextResponseWithButtonRestore_button_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: TextResponseWithButtonRestore_button_VideoBlock_mediaVideo_Video_title[];
  images: TextResponseWithButtonRestore_button_VideoBlock_mediaVideo_Video_images[];
  variant: TextResponseWithButtonRestore_button_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: TextResponseWithButtonRestore_button_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface TextResponseWithButtonRestore_button_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface TextResponseWithButtonRestore_button_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type TextResponseWithButtonRestore_button_VideoBlock_mediaVideo = TextResponseWithButtonRestore_button_VideoBlock_mediaVideo_Video | TextResponseWithButtonRestore_button_VideoBlock_mediaVideo_MuxVideo | TextResponseWithButtonRestore_button_VideoBlock_mediaVideo_YouTube;

export interface TextResponseWithButtonRestore_button_VideoBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface TextResponseWithButtonRestore_button_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface TextResponseWithButtonRestore_button_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface TextResponseWithButtonRestore_button_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type TextResponseWithButtonRestore_button_VideoBlock_action = TextResponseWithButtonRestore_button_VideoBlock_action_PhoneAction | TextResponseWithButtonRestore_button_VideoBlock_action_NavigateToBlockAction | TextResponseWithButtonRestore_button_VideoBlock_action_LinkAction | TextResponseWithButtonRestore_button_VideoBlock_action_EmailAction;

export interface TextResponseWithButtonRestore_button_VideoBlock {
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
  mediaVideo: TextResponseWithButtonRestore_button_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: TextResponseWithButtonRestore_button_VideoBlock_action | null;
}

export interface TextResponseWithButtonRestore_button_VideoTriggerBlock_triggerAction_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface TextResponseWithButtonRestore_button_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface TextResponseWithButtonRestore_button_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface TextResponseWithButtonRestore_button_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type TextResponseWithButtonRestore_button_VideoTriggerBlock_triggerAction = TextResponseWithButtonRestore_button_VideoTriggerBlock_triggerAction_PhoneAction | TextResponseWithButtonRestore_button_VideoTriggerBlock_triggerAction_NavigateToBlockAction | TextResponseWithButtonRestore_button_VideoTriggerBlock_triggerAction_LinkAction | TextResponseWithButtonRestore_button_VideoTriggerBlock_triggerAction_EmailAction;

export interface TextResponseWithButtonRestore_button_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: TextResponseWithButtonRestore_button_VideoTriggerBlock_triggerAction;
}

export type TextResponseWithButtonRestore_button = TextResponseWithButtonRestore_button_GridContainerBlock | TextResponseWithButtonRestore_button_ButtonBlock | TextResponseWithButtonRestore_button_CardBlock | TextResponseWithButtonRestore_button_IconBlock | TextResponseWithButtonRestore_button_ImageBlock | TextResponseWithButtonRestore_button_MultiselectOptionBlock | TextResponseWithButtonRestore_button_MultiselectBlock | TextResponseWithButtonRestore_button_RadioOptionBlock | TextResponseWithButtonRestore_button_RadioQuestionBlock | TextResponseWithButtonRestore_button_SignUpBlock | TextResponseWithButtonRestore_button_SpacerBlock | TextResponseWithButtonRestore_button_StepBlock | TextResponseWithButtonRestore_button_TextResponseBlock | TextResponseWithButtonRestore_button_TypographyBlock | TextResponseWithButtonRestore_button_VideoBlock | TextResponseWithButtonRestore_button_VideoTriggerBlock;

export interface TextResponseWithButtonRestore_startIcon_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface TextResponseWithButtonRestore_startIcon_ButtonBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface TextResponseWithButtonRestore_startIcon_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface TextResponseWithButtonRestore_startIcon_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface TextResponseWithButtonRestore_startIcon_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type TextResponseWithButtonRestore_startIcon_ButtonBlock_action = TextResponseWithButtonRestore_startIcon_ButtonBlock_action_PhoneAction | TextResponseWithButtonRestore_startIcon_ButtonBlock_action_NavigateToBlockAction | TextResponseWithButtonRestore_startIcon_ButtonBlock_action_LinkAction | TextResponseWithButtonRestore_startIcon_ButtonBlock_action_EmailAction;

export interface TextResponseWithButtonRestore_startIcon_ButtonBlock_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface TextResponseWithButtonRestore_startIcon_ButtonBlock {
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
  action: TextResponseWithButtonRestore_startIcon_ButtonBlock_action | null;
  settings: TextResponseWithButtonRestore_startIcon_ButtonBlock_settings | null;
}

export interface TextResponseWithButtonRestore_startIcon_CardBlock {
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

export interface TextResponseWithButtonRestore_startIcon_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface TextResponseWithButtonRestore_startIcon_ImageBlock {
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

export interface TextResponseWithButtonRestore_startIcon_MultiselectOptionBlock {
  __typename: "MultiselectOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
}

export interface TextResponseWithButtonRestore_startIcon_MultiselectBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  target: string | null;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface TextResponseWithButtonRestore_startIcon_MultiselectBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface TextResponseWithButtonRestore_startIcon_MultiselectBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export interface TextResponseWithButtonRestore_startIcon_MultiselectBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
  phone: string;
  countryCode: string;
}

export type TextResponseWithButtonRestore_startIcon_MultiselectBlock_action = TextResponseWithButtonRestore_startIcon_MultiselectBlock_action_LinkAction | TextResponseWithButtonRestore_startIcon_MultiselectBlock_action_NavigateToBlockAction | TextResponseWithButtonRestore_startIcon_MultiselectBlock_action_EmailAction | TextResponseWithButtonRestore_startIcon_MultiselectBlock_action_PhoneAction;

export interface TextResponseWithButtonRestore_startIcon_MultiselectBlock {
  __typename: "MultiselectBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  min: number | null;
  max: number | null;
  action: TextResponseWithButtonRestore_startIcon_MultiselectBlock_action | null;
}

export interface TextResponseWithButtonRestore_startIcon_RadioOptionBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface TextResponseWithButtonRestore_startIcon_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface TextResponseWithButtonRestore_startIcon_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface TextResponseWithButtonRestore_startIcon_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type TextResponseWithButtonRestore_startIcon_RadioOptionBlock_action = TextResponseWithButtonRestore_startIcon_RadioOptionBlock_action_PhoneAction | TextResponseWithButtonRestore_startIcon_RadioOptionBlock_action_NavigateToBlockAction | TextResponseWithButtonRestore_startIcon_RadioOptionBlock_action_LinkAction | TextResponseWithButtonRestore_startIcon_RadioOptionBlock_action_EmailAction;

export interface TextResponseWithButtonRestore_startIcon_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: TextResponseWithButtonRestore_startIcon_RadioOptionBlock_action | null;
  /**
   * pollOptionImageBlockId is present if a child block should be used as a poll option image.
   *       This child block should not be rendered normally, instead it should be used
   *       as a poll option image. Blocks are often of type ImageBlock
   */
  pollOptionImageBlockId: string | null;
}

export interface TextResponseWithButtonRestore_startIcon_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface TextResponseWithButtonRestore_startIcon_SignUpBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface TextResponseWithButtonRestore_startIcon_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface TextResponseWithButtonRestore_startIcon_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface TextResponseWithButtonRestore_startIcon_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type TextResponseWithButtonRestore_startIcon_SignUpBlock_action = TextResponseWithButtonRestore_startIcon_SignUpBlock_action_PhoneAction | TextResponseWithButtonRestore_startIcon_SignUpBlock_action_NavigateToBlockAction | TextResponseWithButtonRestore_startIcon_SignUpBlock_action_LinkAction | TextResponseWithButtonRestore_startIcon_SignUpBlock_action_EmailAction;

export interface TextResponseWithButtonRestore_startIcon_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: TextResponseWithButtonRestore_startIcon_SignUpBlock_action | null;
}

export interface TextResponseWithButtonRestore_startIcon_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface TextResponseWithButtonRestore_startIcon_StepBlock {
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

export interface TextResponseWithButtonRestore_startIcon_TextResponseBlock {
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

export interface TextResponseWithButtonRestore_startIcon_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface TextResponseWithButtonRestore_startIcon_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: TextResponseWithButtonRestore_startIcon_TypographyBlock_settings | null;
}

export interface TextResponseWithButtonRestore_startIcon_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface TextResponseWithButtonRestore_startIcon_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface TextResponseWithButtonRestore_startIcon_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface TextResponseWithButtonRestore_startIcon_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface TextResponseWithButtonRestore_startIcon_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: TextResponseWithButtonRestore_startIcon_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface TextResponseWithButtonRestore_startIcon_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: TextResponseWithButtonRestore_startIcon_VideoBlock_mediaVideo_Video_title[];
  images: TextResponseWithButtonRestore_startIcon_VideoBlock_mediaVideo_Video_images[];
  variant: TextResponseWithButtonRestore_startIcon_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: TextResponseWithButtonRestore_startIcon_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface TextResponseWithButtonRestore_startIcon_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface TextResponseWithButtonRestore_startIcon_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type TextResponseWithButtonRestore_startIcon_VideoBlock_mediaVideo = TextResponseWithButtonRestore_startIcon_VideoBlock_mediaVideo_Video | TextResponseWithButtonRestore_startIcon_VideoBlock_mediaVideo_MuxVideo | TextResponseWithButtonRestore_startIcon_VideoBlock_mediaVideo_YouTube;

export interface TextResponseWithButtonRestore_startIcon_VideoBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface TextResponseWithButtonRestore_startIcon_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface TextResponseWithButtonRestore_startIcon_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface TextResponseWithButtonRestore_startIcon_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type TextResponseWithButtonRestore_startIcon_VideoBlock_action = TextResponseWithButtonRestore_startIcon_VideoBlock_action_PhoneAction | TextResponseWithButtonRestore_startIcon_VideoBlock_action_NavigateToBlockAction | TextResponseWithButtonRestore_startIcon_VideoBlock_action_LinkAction | TextResponseWithButtonRestore_startIcon_VideoBlock_action_EmailAction;

export interface TextResponseWithButtonRestore_startIcon_VideoBlock {
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
  mediaVideo: TextResponseWithButtonRestore_startIcon_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: TextResponseWithButtonRestore_startIcon_VideoBlock_action | null;
}

export interface TextResponseWithButtonRestore_startIcon_VideoTriggerBlock_triggerAction_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface TextResponseWithButtonRestore_startIcon_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface TextResponseWithButtonRestore_startIcon_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface TextResponseWithButtonRestore_startIcon_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type TextResponseWithButtonRestore_startIcon_VideoTriggerBlock_triggerAction = TextResponseWithButtonRestore_startIcon_VideoTriggerBlock_triggerAction_PhoneAction | TextResponseWithButtonRestore_startIcon_VideoTriggerBlock_triggerAction_NavigateToBlockAction | TextResponseWithButtonRestore_startIcon_VideoTriggerBlock_triggerAction_LinkAction | TextResponseWithButtonRestore_startIcon_VideoTriggerBlock_triggerAction_EmailAction;

export interface TextResponseWithButtonRestore_startIcon_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: TextResponseWithButtonRestore_startIcon_VideoTriggerBlock_triggerAction;
}

export type TextResponseWithButtonRestore_startIcon = TextResponseWithButtonRestore_startIcon_GridContainerBlock | TextResponseWithButtonRestore_startIcon_ButtonBlock | TextResponseWithButtonRestore_startIcon_CardBlock | TextResponseWithButtonRestore_startIcon_IconBlock | TextResponseWithButtonRestore_startIcon_ImageBlock | TextResponseWithButtonRestore_startIcon_MultiselectOptionBlock | TextResponseWithButtonRestore_startIcon_MultiselectBlock | TextResponseWithButtonRestore_startIcon_RadioOptionBlock | TextResponseWithButtonRestore_startIcon_RadioQuestionBlock | TextResponseWithButtonRestore_startIcon_SignUpBlock | TextResponseWithButtonRestore_startIcon_SpacerBlock | TextResponseWithButtonRestore_startIcon_StepBlock | TextResponseWithButtonRestore_startIcon_TextResponseBlock | TextResponseWithButtonRestore_startIcon_TypographyBlock | TextResponseWithButtonRestore_startIcon_VideoBlock | TextResponseWithButtonRestore_startIcon_VideoTriggerBlock;

export interface TextResponseWithButtonRestore_endIcon_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface TextResponseWithButtonRestore_endIcon_ButtonBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface TextResponseWithButtonRestore_endIcon_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface TextResponseWithButtonRestore_endIcon_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface TextResponseWithButtonRestore_endIcon_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type TextResponseWithButtonRestore_endIcon_ButtonBlock_action = TextResponseWithButtonRestore_endIcon_ButtonBlock_action_PhoneAction | TextResponseWithButtonRestore_endIcon_ButtonBlock_action_NavigateToBlockAction | TextResponseWithButtonRestore_endIcon_ButtonBlock_action_LinkAction | TextResponseWithButtonRestore_endIcon_ButtonBlock_action_EmailAction;

export interface TextResponseWithButtonRestore_endIcon_ButtonBlock_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface TextResponseWithButtonRestore_endIcon_ButtonBlock {
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
  action: TextResponseWithButtonRestore_endIcon_ButtonBlock_action | null;
  settings: TextResponseWithButtonRestore_endIcon_ButtonBlock_settings | null;
}

export interface TextResponseWithButtonRestore_endIcon_CardBlock {
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

export interface TextResponseWithButtonRestore_endIcon_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface TextResponseWithButtonRestore_endIcon_ImageBlock {
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

export interface TextResponseWithButtonRestore_endIcon_MultiselectOptionBlock {
  __typename: "MultiselectOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
}

export interface TextResponseWithButtonRestore_endIcon_MultiselectBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  target: string | null;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface TextResponseWithButtonRestore_endIcon_MultiselectBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface TextResponseWithButtonRestore_endIcon_MultiselectBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export interface TextResponseWithButtonRestore_endIcon_MultiselectBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
  phone: string;
  countryCode: string;
}

export type TextResponseWithButtonRestore_endIcon_MultiselectBlock_action = TextResponseWithButtonRestore_endIcon_MultiselectBlock_action_LinkAction | TextResponseWithButtonRestore_endIcon_MultiselectBlock_action_NavigateToBlockAction | TextResponseWithButtonRestore_endIcon_MultiselectBlock_action_EmailAction | TextResponseWithButtonRestore_endIcon_MultiselectBlock_action_PhoneAction;

export interface TextResponseWithButtonRestore_endIcon_MultiselectBlock {
  __typename: "MultiselectBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  min: number | null;
  max: number | null;
  action: TextResponseWithButtonRestore_endIcon_MultiselectBlock_action | null;
}

export interface TextResponseWithButtonRestore_endIcon_RadioOptionBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface TextResponseWithButtonRestore_endIcon_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface TextResponseWithButtonRestore_endIcon_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface TextResponseWithButtonRestore_endIcon_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type TextResponseWithButtonRestore_endIcon_RadioOptionBlock_action = TextResponseWithButtonRestore_endIcon_RadioOptionBlock_action_PhoneAction | TextResponseWithButtonRestore_endIcon_RadioOptionBlock_action_NavigateToBlockAction | TextResponseWithButtonRestore_endIcon_RadioOptionBlock_action_LinkAction | TextResponseWithButtonRestore_endIcon_RadioOptionBlock_action_EmailAction;

export interface TextResponseWithButtonRestore_endIcon_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: TextResponseWithButtonRestore_endIcon_RadioOptionBlock_action | null;
  /**
   * pollOptionImageBlockId is present if a child block should be used as a poll option image.
   *       This child block should not be rendered normally, instead it should be used
   *       as a poll option image. Blocks are often of type ImageBlock
   */
  pollOptionImageBlockId: string | null;
}

export interface TextResponseWithButtonRestore_endIcon_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface TextResponseWithButtonRestore_endIcon_SignUpBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface TextResponseWithButtonRestore_endIcon_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface TextResponseWithButtonRestore_endIcon_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface TextResponseWithButtonRestore_endIcon_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type TextResponseWithButtonRestore_endIcon_SignUpBlock_action = TextResponseWithButtonRestore_endIcon_SignUpBlock_action_PhoneAction | TextResponseWithButtonRestore_endIcon_SignUpBlock_action_NavigateToBlockAction | TextResponseWithButtonRestore_endIcon_SignUpBlock_action_LinkAction | TextResponseWithButtonRestore_endIcon_SignUpBlock_action_EmailAction;

export interface TextResponseWithButtonRestore_endIcon_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: TextResponseWithButtonRestore_endIcon_SignUpBlock_action | null;
}

export interface TextResponseWithButtonRestore_endIcon_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface TextResponseWithButtonRestore_endIcon_StepBlock {
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

export interface TextResponseWithButtonRestore_endIcon_TextResponseBlock {
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

export interface TextResponseWithButtonRestore_endIcon_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface TextResponseWithButtonRestore_endIcon_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: TextResponseWithButtonRestore_endIcon_TypographyBlock_settings | null;
}

export interface TextResponseWithButtonRestore_endIcon_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface TextResponseWithButtonRestore_endIcon_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface TextResponseWithButtonRestore_endIcon_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface TextResponseWithButtonRestore_endIcon_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface TextResponseWithButtonRestore_endIcon_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: TextResponseWithButtonRestore_endIcon_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface TextResponseWithButtonRestore_endIcon_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: TextResponseWithButtonRestore_endIcon_VideoBlock_mediaVideo_Video_title[];
  images: TextResponseWithButtonRestore_endIcon_VideoBlock_mediaVideo_Video_images[];
  variant: TextResponseWithButtonRestore_endIcon_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: TextResponseWithButtonRestore_endIcon_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface TextResponseWithButtonRestore_endIcon_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface TextResponseWithButtonRestore_endIcon_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type TextResponseWithButtonRestore_endIcon_VideoBlock_mediaVideo = TextResponseWithButtonRestore_endIcon_VideoBlock_mediaVideo_Video | TextResponseWithButtonRestore_endIcon_VideoBlock_mediaVideo_MuxVideo | TextResponseWithButtonRestore_endIcon_VideoBlock_mediaVideo_YouTube;

export interface TextResponseWithButtonRestore_endIcon_VideoBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface TextResponseWithButtonRestore_endIcon_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface TextResponseWithButtonRestore_endIcon_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface TextResponseWithButtonRestore_endIcon_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type TextResponseWithButtonRestore_endIcon_VideoBlock_action = TextResponseWithButtonRestore_endIcon_VideoBlock_action_PhoneAction | TextResponseWithButtonRestore_endIcon_VideoBlock_action_NavigateToBlockAction | TextResponseWithButtonRestore_endIcon_VideoBlock_action_LinkAction | TextResponseWithButtonRestore_endIcon_VideoBlock_action_EmailAction;

export interface TextResponseWithButtonRestore_endIcon_VideoBlock {
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
  mediaVideo: TextResponseWithButtonRestore_endIcon_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: TextResponseWithButtonRestore_endIcon_VideoBlock_action | null;
}

export interface TextResponseWithButtonRestore_endIcon_VideoTriggerBlock_triggerAction_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface TextResponseWithButtonRestore_endIcon_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface TextResponseWithButtonRestore_endIcon_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface TextResponseWithButtonRestore_endIcon_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type TextResponseWithButtonRestore_endIcon_VideoTriggerBlock_triggerAction = TextResponseWithButtonRestore_endIcon_VideoTriggerBlock_triggerAction_PhoneAction | TextResponseWithButtonRestore_endIcon_VideoTriggerBlock_triggerAction_NavigateToBlockAction | TextResponseWithButtonRestore_endIcon_VideoTriggerBlock_triggerAction_LinkAction | TextResponseWithButtonRestore_endIcon_VideoTriggerBlock_triggerAction_EmailAction;

export interface TextResponseWithButtonRestore_endIcon_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: TextResponseWithButtonRestore_endIcon_VideoTriggerBlock_triggerAction;
}

export type TextResponseWithButtonRestore_endIcon = TextResponseWithButtonRestore_endIcon_GridContainerBlock | TextResponseWithButtonRestore_endIcon_ButtonBlock | TextResponseWithButtonRestore_endIcon_CardBlock | TextResponseWithButtonRestore_endIcon_IconBlock | TextResponseWithButtonRestore_endIcon_ImageBlock | TextResponseWithButtonRestore_endIcon_MultiselectOptionBlock | TextResponseWithButtonRestore_endIcon_MultiselectBlock | TextResponseWithButtonRestore_endIcon_RadioOptionBlock | TextResponseWithButtonRestore_endIcon_RadioQuestionBlock | TextResponseWithButtonRestore_endIcon_SignUpBlock | TextResponseWithButtonRestore_endIcon_SpacerBlock | TextResponseWithButtonRestore_endIcon_StepBlock | TextResponseWithButtonRestore_endIcon_TextResponseBlock | TextResponseWithButtonRestore_endIcon_TypographyBlock | TextResponseWithButtonRestore_endIcon_VideoBlock | TextResponseWithButtonRestore_endIcon_VideoTriggerBlock;

export interface TextResponseWithButtonRestore {
  /**
   * blockRestore is used for redo/undo
   */
  textResponse: TextResponseWithButtonRestore_textResponse[];
  /**
   * blockRestore is used for redo/undo
   */
  button: TextResponseWithButtonRestore_button[];
  /**
   * blockRestore is used for redo/undo
   */
  startIcon: TextResponseWithButtonRestore_startIcon[];
  /**
   * blockRestore is used for redo/undo
   */
  endIcon: TextResponseWithButtonRestore_endIcon[];
}

export interface TextResponseWithButtonRestoreVariables {
  textResponseId: string;
  buttonId: string;
  startIconId: string;
  endIconId: string;
}

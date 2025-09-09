/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CardBlockUpdateInput, ButtonVariant, ButtonColor, ButtonSize, ButtonAlignment, ThemeMode, ThemeName, IconName, IconSize, IconColor, TextResponseType, TypographyAlign, TypographyColor, TypographyVariant, VideoBlockSource, VideoBlockObjectFit } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CardFormRestore
// ====================================================

export interface CardFormRestore_image_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock" | "MultiselectBlock" | "MultiselectOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardFormRestore_image_ButtonBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_image_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_image_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_image_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_image_ButtonBlock_action = CardFormRestore_image_ButtonBlock_action_PhoneAction | CardFormRestore_image_ButtonBlock_action_NavigateToBlockAction | CardFormRestore_image_ButtonBlock_action_LinkAction | CardFormRestore_image_ButtonBlock_action_EmailAction;

export interface CardFormRestore_image_ButtonBlock_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface CardFormRestore_image_ButtonBlock {
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
  action: CardFormRestore_image_ButtonBlock_action | null;
  settings: CardFormRestore_image_ButtonBlock_settings | null;
}

export interface CardFormRestore_image_CardBlock {
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

export interface CardFormRestore_image_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardFormRestore_image_ImageBlock {
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

export interface CardFormRestore_image_RadioOptionBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_image_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_image_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_image_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_image_RadioOptionBlock_action = CardFormRestore_image_RadioOptionBlock_action_PhoneAction | CardFormRestore_image_RadioOptionBlock_action_NavigateToBlockAction | CardFormRestore_image_RadioOptionBlock_action_LinkAction | CardFormRestore_image_RadioOptionBlock_action_EmailAction;

export interface CardFormRestore_image_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardFormRestore_image_RadioOptionBlock_action | null;
  /**
   * pollOptionImageBlockId is present if a child block should be used as a poll option image.
   *       This child block should not be rendered normally, instead it should be used
   *       as a poll option image. Blocks are often of type ImageBlock
   */
  pollOptionImageBlockId: string | null;
}

export interface CardFormRestore_image_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface CardFormRestore_image_SignUpBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_image_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_image_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_image_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_image_SignUpBlock_action = CardFormRestore_image_SignUpBlock_action_PhoneAction | CardFormRestore_image_SignUpBlock_action_NavigateToBlockAction | CardFormRestore_image_SignUpBlock_action_LinkAction | CardFormRestore_image_SignUpBlock_action_EmailAction;

export interface CardFormRestore_image_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardFormRestore_image_SignUpBlock_action | null;
}

export interface CardFormRestore_image_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface CardFormRestore_image_StepBlock {
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

export interface CardFormRestore_image_TextResponseBlock {
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

export interface CardFormRestore_image_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardFormRestore_image_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardFormRestore_image_TypographyBlock_settings | null;
}

export interface CardFormRestore_image_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardFormRestore_image_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardFormRestore_image_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardFormRestore_image_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardFormRestore_image_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardFormRestore_image_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface CardFormRestore_image_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardFormRestore_image_VideoBlock_mediaVideo_Video_title[];
  images: CardFormRestore_image_VideoBlock_mediaVideo_Video_images[];
  variant: CardFormRestore_image_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: CardFormRestore_image_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface CardFormRestore_image_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardFormRestore_image_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardFormRestore_image_VideoBlock_mediaVideo = CardFormRestore_image_VideoBlock_mediaVideo_Video | CardFormRestore_image_VideoBlock_mediaVideo_MuxVideo | CardFormRestore_image_VideoBlock_mediaVideo_YouTube;

export interface CardFormRestore_image_VideoBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_image_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_image_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_image_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_image_VideoBlock_action = CardFormRestore_image_VideoBlock_action_PhoneAction | CardFormRestore_image_VideoBlock_action_NavigateToBlockAction | CardFormRestore_image_VideoBlock_action_LinkAction | CardFormRestore_image_VideoBlock_action_EmailAction;

export interface CardFormRestore_image_VideoBlock {
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
  mediaVideo: CardFormRestore_image_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardFormRestore_image_VideoBlock_action | null;
}

export interface CardFormRestore_image_VideoTriggerBlock_triggerAction_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_image_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_image_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_image_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_image_VideoTriggerBlock_triggerAction = CardFormRestore_image_VideoTriggerBlock_triggerAction_PhoneAction | CardFormRestore_image_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardFormRestore_image_VideoTriggerBlock_triggerAction_LinkAction | CardFormRestore_image_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardFormRestore_image_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardFormRestore_image_VideoTriggerBlock_triggerAction;
}

export type CardFormRestore_image = CardFormRestore_image_GridContainerBlock | CardFormRestore_image_ButtonBlock | CardFormRestore_image_CardBlock | CardFormRestore_image_IconBlock | CardFormRestore_image_ImageBlock | CardFormRestore_image_RadioOptionBlock | CardFormRestore_image_RadioQuestionBlock | CardFormRestore_image_SignUpBlock | CardFormRestore_image_SpacerBlock | CardFormRestore_image_StepBlock | CardFormRestore_image_TextResponseBlock | CardFormRestore_image_TypographyBlock | CardFormRestore_image_VideoBlock | CardFormRestore_image_VideoTriggerBlock;

export interface CardFormRestore_subtitle_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock" | "MultiselectBlock" | "MultiselectOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardFormRestore_subtitle_ButtonBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_subtitle_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_subtitle_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_subtitle_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_subtitle_ButtonBlock_action = CardFormRestore_subtitle_ButtonBlock_action_PhoneAction | CardFormRestore_subtitle_ButtonBlock_action_NavigateToBlockAction | CardFormRestore_subtitle_ButtonBlock_action_LinkAction | CardFormRestore_subtitle_ButtonBlock_action_EmailAction;

export interface CardFormRestore_subtitle_ButtonBlock_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface CardFormRestore_subtitle_ButtonBlock {
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
  action: CardFormRestore_subtitle_ButtonBlock_action | null;
  settings: CardFormRestore_subtitle_ButtonBlock_settings | null;
}

export interface CardFormRestore_subtitle_CardBlock {
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

export interface CardFormRestore_subtitle_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardFormRestore_subtitle_ImageBlock {
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

export interface CardFormRestore_subtitle_RadioOptionBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_subtitle_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_subtitle_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_subtitle_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_subtitle_RadioOptionBlock_action = CardFormRestore_subtitle_RadioOptionBlock_action_PhoneAction | CardFormRestore_subtitle_RadioOptionBlock_action_NavigateToBlockAction | CardFormRestore_subtitle_RadioOptionBlock_action_LinkAction | CardFormRestore_subtitle_RadioOptionBlock_action_EmailAction;

export interface CardFormRestore_subtitle_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardFormRestore_subtitle_RadioOptionBlock_action | null;
  /**
   * pollOptionImageBlockId is present if a child block should be used as a poll option image.
   *       This child block should not be rendered normally, instead it should be used
   *       as a poll option image. Blocks are often of type ImageBlock
   */
  pollOptionImageBlockId: string | null;
}

export interface CardFormRestore_subtitle_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface CardFormRestore_subtitle_SignUpBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_subtitle_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_subtitle_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_subtitle_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_subtitle_SignUpBlock_action = CardFormRestore_subtitle_SignUpBlock_action_PhoneAction | CardFormRestore_subtitle_SignUpBlock_action_NavigateToBlockAction | CardFormRestore_subtitle_SignUpBlock_action_LinkAction | CardFormRestore_subtitle_SignUpBlock_action_EmailAction;

export interface CardFormRestore_subtitle_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardFormRestore_subtitle_SignUpBlock_action | null;
}

export interface CardFormRestore_subtitle_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface CardFormRestore_subtitle_StepBlock {
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

export interface CardFormRestore_subtitle_TextResponseBlock {
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

export interface CardFormRestore_subtitle_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardFormRestore_subtitle_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardFormRestore_subtitle_TypographyBlock_settings | null;
}

export interface CardFormRestore_subtitle_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardFormRestore_subtitle_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardFormRestore_subtitle_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardFormRestore_subtitle_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardFormRestore_subtitle_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardFormRestore_subtitle_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface CardFormRestore_subtitle_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardFormRestore_subtitle_VideoBlock_mediaVideo_Video_title[];
  images: CardFormRestore_subtitle_VideoBlock_mediaVideo_Video_images[];
  variant: CardFormRestore_subtitle_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: CardFormRestore_subtitle_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface CardFormRestore_subtitle_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardFormRestore_subtitle_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardFormRestore_subtitle_VideoBlock_mediaVideo = CardFormRestore_subtitle_VideoBlock_mediaVideo_Video | CardFormRestore_subtitle_VideoBlock_mediaVideo_MuxVideo | CardFormRestore_subtitle_VideoBlock_mediaVideo_YouTube;

export interface CardFormRestore_subtitle_VideoBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_subtitle_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_subtitle_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_subtitle_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_subtitle_VideoBlock_action = CardFormRestore_subtitle_VideoBlock_action_PhoneAction | CardFormRestore_subtitle_VideoBlock_action_NavigateToBlockAction | CardFormRestore_subtitle_VideoBlock_action_LinkAction | CardFormRestore_subtitle_VideoBlock_action_EmailAction;

export interface CardFormRestore_subtitle_VideoBlock {
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
  mediaVideo: CardFormRestore_subtitle_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardFormRestore_subtitle_VideoBlock_action | null;
}

export interface CardFormRestore_subtitle_VideoTriggerBlock_triggerAction_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_subtitle_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_subtitle_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_subtitle_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_subtitle_VideoTriggerBlock_triggerAction = CardFormRestore_subtitle_VideoTriggerBlock_triggerAction_PhoneAction | CardFormRestore_subtitle_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardFormRestore_subtitle_VideoTriggerBlock_triggerAction_LinkAction | CardFormRestore_subtitle_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardFormRestore_subtitle_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardFormRestore_subtitle_VideoTriggerBlock_triggerAction;
}

export type CardFormRestore_subtitle = CardFormRestore_subtitle_GridContainerBlock | CardFormRestore_subtitle_ButtonBlock | CardFormRestore_subtitle_CardBlock | CardFormRestore_subtitle_IconBlock | CardFormRestore_subtitle_ImageBlock | CardFormRestore_subtitle_RadioOptionBlock | CardFormRestore_subtitle_RadioQuestionBlock | CardFormRestore_subtitle_SignUpBlock | CardFormRestore_subtitle_SpacerBlock | CardFormRestore_subtitle_StepBlock | CardFormRestore_subtitle_TextResponseBlock | CardFormRestore_subtitle_TypographyBlock | CardFormRestore_subtitle_VideoBlock | CardFormRestore_subtitle_VideoTriggerBlock;

export interface CardFormRestore_title_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock" | "MultiselectBlock" | "MultiselectOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardFormRestore_title_ButtonBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_title_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_title_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_title_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_title_ButtonBlock_action = CardFormRestore_title_ButtonBlock_action_PhoneAction | CardFormRestore_title_ButtonBlock_action_NavigateToBlockAction | CardFormRestore_title_ButtonBlock_action_LinkAction | CardFormRestore_title_ButtonBlock_action_EmailAction;

export interface CardFormRestore_title_ButtonBlock_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface CardFormRestore_title_ButtonBlock {
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
  action: CardFormRestore_title_ButtonBlock_action | null;
  settings: CardFormRestore_title_ButtonBlock_settings | null;
}

export interface CardFormRestore_title_CardBlock {
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

export interface CardFormRestore_title_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardFormRestore_title_ImageBlock {
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

export interface CardFormRestore_title_RadioOptionBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_title_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_title_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_title_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_title_RadioOptionBlock_action = CardFormRestore_title_RadioOptionBlock_action_PhoneAction | CardFormRestore_title_RadioOptionBlock_action_NavigateToBlockAction | CardFormRestore_title_RadioOptionBlock_action_LinkAction | CardFormRestore_title_RadioOptionBlock_action_EmailAction;

export interface CardFormRestore_title_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardFormRestore_title_RadioOptionBlock_action | null;
  /**
   * pollOptionImageBlockId is present if a child block should be used as a poll option image.
   *       This child block should not be rendered normally, instead it should be used
   *       as a poll option image. Blocks are often of type ImageBlock
   */
  pollOptionImageBlockId: string | null;
}

export interface CardFormRestore_title_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface CardFormRestore_title_SignUpBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_title_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_title_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_title_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_title_SignUpBlock_action = CardFormRestore_title_SignUpBlock_action_PhoneAction | CardFormRestore_title_SignUpBlock_action_NavigateToBlockAction | CardFormRestore_title_SignUpBlock_action_LinkAction | CardFormRestore_title_SignUpBlock_action_EmailAction;

export interface CardFormRestore_title_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardFormRestore_title_SignUpBlock_action | null;
}

export interface CardFormRestore_title_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface CardFormRestore_title_StepBlock {
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

export interface CardFormRestore_title_TextResponseBlock {
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

export interface CardFormRestore_title_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardFormRestore_title_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardFormRestore_title_TypographyBlock_settings | null;
}

export interface CardFormRestore_title_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardFormRestore_title_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardFormRestore_title_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardFormRestore_title_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardFormRestore_title_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardFormRestore_title_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface CardFormRestore_title_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardFormRestore_title_VideoBlock_mediaVideo_Video_title[];
  images: CardFormRestore_title_VideoBlock_mediaVideo_Video_images[];
  variant: CardFormRestore_title_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: CardFormRestore_title_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface CardFormRestore_title_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardFormRestore_title_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardFormRestore_title_VideoBlock_mediaVideo = CardFormRestore_title_VideoBlock_mediaVideo_Video | CardFormRestore_title_VideoBlock_mediaVideo_MuxVideo | CardFormRestore_title_VideoBlock_mediaVideo_YouTube;

export interface CardFormRestore_title_VideoBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_title_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_title_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_title_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_title_VideoBlock_action = CardFormRestore_title_VideoBlock_action_PhoneAction | CardFormRestore_title_VideoBlock_action_NavigateToBlockAction | CardFormRestore_title_VideoBlock_action_LinkAction | CardFormRestore_title_VideoBlock_action_EmailAction;

export interface CardFormRestore_title_VideoBlock {
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
  mediaVideo: CardFormRestore_title_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardFormRestore_title_VideoBlock_action | null;
}

export interface CardFormRestore_title_VideoTriggerBlock_triggerAction_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_title_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_title_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_title_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_title_VideoTriggerBlock_triggerAction = CardFormRestore_title_VideoTriggerBlock_triggerAction_PhoneAction | CardFormRestore_title_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardFormRestore_title_VideoTriggerBlock_triggerAction_LinkAction | CardFormRestore_title_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardFormRestore_title_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardFormRestore_title_VideoTriggerBlock_triggerAction;
}

export type CardFormRestore_title = CardFormRestore_title_GridContainerBlock | CardFormRestore_title_ButtonBlock | CardFormRestore_title_CardBlock | CardFormRestore_title_IconBlock | CardFormRestore_title_ImageBlock | CardFormRestore_title_RadioOptionBlock | CardFormRestore_title_RadioQuestionBlock | CardFormRestore_title_SignUpBlock | CardFormRestore_title_SpacerBlock | CardFormRestore_title_StepBlock | CardFormRestore_title_TextResponseBlock | CardFormRestore_title_TypographyBlock | CardFormRestore_title_VideoBlock | CardFormRestore_title_VideoTriggerBlock;

export interface CardFormRestore_textResponse_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock" | "MultiselectBlock" | "MultiselectOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardFormRestore_textResponse_ButtonBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_textResponse_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_textResponse_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_textResponse_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_textResponse_ButtonBlock_action = CardFormRestore_textResponse_ButtonBlock_action_PhoneAction | CardFormRestore_textResponse_ButtonBlock_action_NavigateToBlockAction | CardFormRestore_textResponse_ButtonBlock_action_LinkAction | CardFormRestore_textResponse_ButtonBlock_action_EmailAction;

export interface CardFormRestore_textResponse_ButtonBlock_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface CardFormRestore_textResponse_ButtonBlock {
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
  action: CardFormRestore_textResponse_ButtonBlock_action | null;
  settings: CardFormRestore_textResponse_ButtonBlock_settings | null;
}

export interface CardFormRestore_textResponse_CardBlock {
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

export interface CardFormRestore_textResponse_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardFormRestore_textResponse_ImageBlock {
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

export interface CardFormRestore_textResponse_RadioOptionBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_textResponse_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_textResponse_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_textResponse_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_textResponse_RadioOptionBlock_action = CardFormRestore_textResponse_RadioOptionBlock_action_PhoneAction | CardFormRestore_textResponse_RadioOptionBlock_action_NavigateToBlockAction | CardFormRestore_textResponse_RadioOptionBlock_action_LinkAction | CardFormRestore_textResponse_RadioOptionBlock_action_EmailAction;

export interface CardFormRestore_textResponse_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardFormRestore_textResponse_RadioOptionBlock_action | null;
  /**
   * pollOptionImageBlockId is present if a child block should be used as a poll option image.
   *       This child block should not be rendered normally, instead it should be used
   *       as a poll option image. Blocks are often of type ImageBlock
   */
  pollOptionImageBlockId: string | null;
}

export interface CardFormRestore_textResponse_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface CardFormRestore_textResponse_SignUpBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_textResponse_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_textResponse_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_textResponse_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_textResponse_SignUpBlock_action = CardFormRestore_textResponse_SignUpBlock_action_PhoneAction | CardFormRestore_textResponse_SignUpBlock_action_NavigateToBlockAction | CardFormRestore_textResponse_SignUpBlock_action_LinkAction | CardFormRestore_textResponse_SignUpBlock_action_EmailAction;

export interface CardFormRestore_textResponse_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardFormRestore_textResponse_SignUpBlock_action | null;
}

export interface CardFormRestore_textResponse_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface CardFormRestore_textResponse_StepBlock {
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

export interface CardFormRestore_textResponse_TextResponseBlock {
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

export interface CardFormRestore_textResponse_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardFormRestore_textResponse_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardFormRestore_textResponse_TypographyBlock_settings | null;
}

export interface CardFormRestore_textResponse_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardFormRestore_textResponse_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardFormRestore_textResponse_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardFormRestore_textResponse_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardFormRestore_textResponse_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardFormRestore_textResponse_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface CardFormRestore_textResponse_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardFormRestore_textResponse_VideoBlock_mediaVideo_Video_title[];
  images: CardFormRestore_textResponse_VideoBlock_mediaVideo_Video_images[];
  variant: CardFormRestore_textResponse_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: CardFormRestore_textResponse_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface CardFormRestore_textResponse_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardFormRestore_textResponse_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardFormRestore_textResponse_VideoBlock_mediaVideo = CardFormRestore_textResponse_VideoBlock_mediaVideo_Video | CardFormRestore_textResponse_VideoBlock_mediaVideo_MuxVideo | CardFormRestore_textResponse_VideoBlock_mediaVideo_YouTube;

export interface CardFormRestore_textResponse_VideoBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_textResponse_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_textResponse_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_textResponse_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_textResponse_VideoBlock_action = CardFormRestore_textResponse_VideoBlock_action_PhoneAction | CardFormRestore_textResponse_VideoBlock_action_NavigateToBlockAction | CardFormRestore_textResponse_VideoBlock_action_LinkAction | CardFormRestore_textResponse_VideoBlock_action_EmailAction;

export interface CardFormRestore_textResponse_VideoBlock {
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
  mediaVideo: CardFormRestore_textResponse_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardFormRestore_textResponse_VideoBlock_action | null;
}

export interface CardFormRestore_textResponse_VideoTriggerBlock_triggerAction_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_textResponse_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_textResponse_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_textResponse_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_textResponse_VideoTriggerBlock_triggerAction = CardFormRestore_textResponse_VideoTriggerBlock_triggerAction_PhoneAction | CardFormRestore_textResponse_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardFormRestore_textResponse_VideoTriggerBlock_triggerAction_LinkAction | CardFormRestore_textResponse_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardFormRestore_textResponse_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardFormRestore_textResponse_VideoTriggerBlock_triggerAction;
}

export type CardFormRestore_textResponse = CardFormRestore_textResponse_GridContainerBlock | CardFormRestore_textResponse_ButtonBlock | CardFormRestore_textResponse_CardBlock | CardFormRestore_textResponse_IconBlock | CardFormRestore_textResponse_ImageBlock | CardFormRestore_textResponse_RadioOptionBlock | CardFormRestore_textResponse_RadioQuestionBlock | CardFormRestore_textResponse_SignUpBlock | CardFormRestore_textResponse_SpacerBlock | CardFormRestore_textResponse_StepBlock | CardFormRestore_textResponse_TextResponseBlock | CardFormRestore_textResponse_TypographyBlock | CardFormRestore_textResponse_VideoBlock | CardFormRestore_textResponse_VideoTriggerBlock;

export interface CardFormRestore_button_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock" | "MultiselectBlock" | "MultiselectOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardFormRestore_button_ButtonBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_button_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_button_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_button_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_button_ButtonBlock_action = CardFormRestore_button_ButtonBlock_action_PhoneAction | CardFormRestore_button_ButtonBlock_action_NavigateToBlockAction | CardFormRestore_button_ButtonBlock_action_LinkAction | CardFormRestore_button_ButtonBlock_action_EmailAction;

export interface CardFormRestore_button_ButtonBlock_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface CardFormRestore_button_ButtonBlock {
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
  action: CardFormRestore_button_ButtonBlock_action | null;
  settings: CardFormRestore_button_ButtonBlock_settings | null;
}

export interface CardFormRestore_button_CardBlock {
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

export interface CardFormRestore_button_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardFormRestore_button_ImageBlock {
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

export interface CardFormRestore_button_RadioOptionBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_button_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_button_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_button_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_button_RadioOptionBlock_action = CardFormRestore_button_RadioOptionBlock_action_PhoneAction | CardFormRestore_button_RadioOptionBlock_action_NavigateToBlockAction | CardFormRestore_button_RadioOptionBlock_action_LinkAction | CardFormRestore_button_RadioOptionBlock_action_EmailAction;

export interface CardFormRestore_button_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardFormRestore_button_RadioOptionBlock_action | null;
  /**
   * pollOptionImageBlockId is present if a child block should be used as a poll option image.
   *       This child block should not be rendered normally, instead it should be used
   *       as a poll option image. Blocks are often of type ImageBlock
   */
  pollOptionImageBlockId: string | null;
}

export interface CardFormRestore_button_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface CardFormRestore_button_SignUpBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_button_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_button_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_button_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_button_SignUpBlock_action = CardFormRestore_button_SignUpBlock_action_PhoneAction | CardFormRestore_button_SignUpBlock_action_NavigateToBlockAction | CardFormRestore_button_SignUpBlock_action_LinkAction | CardFormRestore_button_SignUpBlock_action_EmailAction;

export interface CardFormRestore_button_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardFormRestore_button_SignUpBlock_action | null;
}

export interface CardFormRestore_button_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface CardFormRestore_button_StepBlock {
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

export interface CardFormRestore_button_TextResponseBlock {
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

export interface CardFormRestore_button_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardFormRestore_button_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardFormRestore_button_TypographyBlock_settings | null;
}

export interface CardFormRestore_button_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardFormRestore_button_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardFormRestore_button_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardFormRestore_button_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardFormRestore_button_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardFormRestore_button_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface CardFormRestore_button_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardFormRestore_button_VideoBlock_mediaVideo_Video_title[];
  images: CardFormRestore_button_VideoBlock_mediaVideo_Video_images[];
  variant: CardFormRestore_button_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: CardFormRestore_button_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface CardFormRestore_button_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardFormRestore_button_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardFormRestore_button_VideoBlock_mediaVideo = CardFormRestore_button_VideoBlock_mediaVideo_Video | CardFormRestore_button_VideoBlock_mediaVideo_MuxVideo | CardFormRestore_button_VideoBlock_mediaVideo_YouTube;

export interface CardFormRestore_button_VideoBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_button_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_button_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_button_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_button_VideoBlock_action = CardFormRestore_button_VideoBlock_action_PhoneAction | CardFormRestore_button_VideoBlock_action_NavigateToBlockAction | CardFormRestore_button_VideoBlock_action_LinkAction | CardFormRestore_button_VideoBlock_action_EmailAction;

export interface CardFormRestore_button_VideoBlock {
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
  mediaVideo: CardFormRestore_button_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardFormRestore_button_VideoBlock_action | null;
}

export interface CardFormRestore_button_VideoTriggerBlock_triggerAction_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_button_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_button_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_button_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_button_VideoTriggerBlock_triggerAction = CardFormRestore_button_VideoTriggerBlock_triggerAction_PhoneAction | CardFormRestore_button_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardFormRestore_button_VideoTriggerBlock_triggerAction_LinkAction | CardFormRestore_button_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardFormRestore_button_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardFormRestore_button_VideoTriggerBlock_triggerAction;
}

export type CardFormRestore_button = CardFormRestore_button_GridContainerBlock | CardFormRestore_button_ButtonBlock | CardFormRestore_button_CardBlock | CardFormRestore_button_IconBlock | CardFormRestore_button_ImageBlock | CardFormRestore_button_RadioOptionBlock | CardFormRestore_button_RadioQuestionBlock | CardFormRestore_button_SignUpBlock | CardFormRestore_button_SpacerBlock | CardFormRestore_button_StepBlock | CardFormRestore_button_TextResponseBlock | CardFormRestore_button_TypographyBlock | CardFormRestore_button_VideoBlock | CardFormRestore_button_VideoTriggerBlock;

export interface CardFormRestore_startIcon_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock" | "MultiselectBlock" | "MultiselectOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardFormRestore_startIcon_ButtonBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_startIcon_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_startIcon_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_startIcon_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_startIcon_ButtonBlock_action = CardFormRestore_startIcon_ButtonBlock_action_PhoneAction | CardFormRestore_startIcon_ButtonBlock_action_NavigateToBlockAction | CardFormRestore_startIcon_ButtonBlock_action_LinkAction | CardFormRestore_startIcon_ButtonBlock_action_EmailAction;

export interface CardFormRestore_startIcon_ButtonBlock_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface CardFormRestore_startIcon_ButtonBlock {
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
  action: CardFormRestore_startIcon_ButtonBlock_action | null;
  settings: CardFormRestore_startIcon_ButtonBlock_settings | null;
}

export interface CardFormRestore_startIcon_CardBlock {
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

export interface CardFormRestore_startIcon_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardFormRestore_startIcon_ImageBlock {
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

export interface CardFormRestore_startIcon_RadioOptionBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_startIcon_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_startIcon_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_startIcon_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_startIcon_RadioOptionBlock_action = CardFormRestore_startIcon_RadioOptionBlock_action_PhoneAction | CardFormRestore_startIcon_RadioOptionBlock_action_NavigateToBlockAction | CardFormRestore_startIcon_RadioOptionBlock_action_LinkAction | CardFormRestore_startIcon_RadioOptionBlock_action_EmailAction;

export interface CardFormRestore_startIcon_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardFormRestore_startIcon_RadioOptionBlock_action | null;
  /**
   * pollOptionImageBlockId is present if a child block should be used as a poll option image.
   *       This child block should not be rendered normally, instead it should be used
   *       as a poll option image. Blocks are often of type ImageBlock
   */
  pollOptionImageBlockId: string | null;
}

export interface CardFormRestore_startIcon_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface CardFormRestore_startIcon_SignUpBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_startIcon_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_startIcon_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_startIcon_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_startIcon_SignUpBlock_action = CardFormRestore_startIcon_SignUpBlock_action_PhoneAction | CardFormRestore_startIcon_SignUpBlock_action_NavigateToBlockAction | CardFormRestore_startIcon_SignUpBlock_action_LinkAction | CardFormRestore_startIcon_SignUpBlock_action_EmailAction;

export interface CardFormRestore_startIcon_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardFormRestore_startIcon_SignUpBlock_action | null;
}

export interface CardFormRestore_startIcon_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface CardFormRestore_startIcon_StepBlock {
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

export interface CardFormRestore_startIcon_TextResponseBlock {
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

export interface CardFormRestore_startIcon_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardFormRestore_startIcon_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardFormRestore_startIcon_TypographyBlock_settings | null;
}

export interface CardFormRestore_startIcon_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardFormRestore_startIcon_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardFormRestore_startIcon_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardFormRestore_startIcon_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardFormRestore_startIcon_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardFormRestore_startIcon_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface CardFormRestore_startIcon_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardFormRestore_startIcon_VideoBlock_mediaVideo_Video_title[];
  images: CardFormRestore_startIcon_VideoBlock_mediaVideo_Video_images[];
  variant: CardFormRestore_startIcon_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: CardFormRestore_startIcon_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface CardFormRestore_startIcon_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardFormRestore_startIcon_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardFormRestore_startIcon_VideoBlock_mediaVideo = CardFormRestore_startIcon_VideoBlock_mediaVideo_Video | CardFormRestore_startIcon_VideoBlock_mediaVideo_MuxVideo | CardFormRestore_startIcon_VideoBlock_mediaVideo_YouTube;

export interface CardFormRestore_startIcon_VideoBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_startIcon_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_startIcon_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_startIcon_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_startIcon_VideoBlock_action = CardFormRestore_startIcon_VideoBlock_action_PhoneAction | CardFormRestore_startIcon_VideoBlock_action_NavigateToBlockAction | CardFormRestore_startIcon_VideoBlock_action_LinkAction | CardFormRestore_startIcon_VideoBlock_action_EmailAction;

export interface CardFormRestore_startIcon_VideoBlock {
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
  mediaVideo: CardFormRestore_startIcon_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardFormRestore_startIcon_VideoBlock_action | null;
}

export interface CardFormRestore_startIcon_VideoTriggerBlock_triggerAction_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_startIcon_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_startIcon_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_startIcon_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_startIcon_VideoTriggerBlock_triggerAction = CardFormRestore_startIcon_VideoTriggerBlock_triggerAction_PhoneAction | CardFormRestore_startIcon_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardFormRestore_startIcon_VideoTriggerBlock_triggerAction_LinkAction | CardFormRestore_startIcon_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardFormRestore_startIcon_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardFormRestore_startIcon_VideoTriggerBlock_triggerAction;
}

export type CardFormRestore_startIcon = CardFormRestore_startIcon_GridContainerBlock | CardFormRestore_startIcon_ButtonBlock | CardFormRestore_startIcon_CardBlock | CardFormRestore_startIcon_IconBlock | CardFormRestore_startIcon_ImageBlock | CardFormRestore_startIcon_RadioOptionBlock | CardFormRestore_startIcon_RadioQuestionBlock | CardFormRestore_startIcon_SignUpBlock | CardFormRestore_startIcon_SpacerBlock | CardFormRestore_startIcon_StepBlock | CardFormRestore_startIcon_TextResponseBlock | CardFormRestore_startIcon_TypographyBlock | CardFormRestore_startIcon_VideoBlock | CardFormRestore_startIcon_VideoTriggerBlock;

export interface CardFormRestore_endIcon_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock" | "MultiselectBlock" | "MultiselectOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardFormRestore_endIcon_ButtonBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_endIcon_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_endIcon_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_endIcon_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_endIcon_ButtonBlock_action = CardFormRestore_endIcon_ButtonBlock_action_PhoneAction | CardFormRestore_endIcon_ButtonBlock_action_NavigateToBlockAction | CardFormRestore_endIcon_ButtonBlock_action_LinkAction | CardFormRestore_endIcon_ButtonBlock_action_EmailAction;

export interface CardFormRestore_endIcon_ButtonBlock_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface CardFormRestore_endIcon_ButtonBlock {
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
  action: CardFormRestore_endIcon_ButtonBlock_action | null;
  settings: CardFormRestore_endIcon_ButtonBlock_settings | null;
}

export interface CardFormRestore_endIcon_CardBlock {
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

export interface CardFormRestore_endIcon_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardFormRestore_endIcon_ImageBlock {
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

export interface CardFormRestore_endIcon_RadioOptionBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_endIcon_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_endIcon_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_endIcon_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_endIcon_RadioOptionBlock_action = CardFormRestore_endIcon_RadioOptionBlock_action_PhoneAction | CardFormRestore_endIcon_RadioOptionBlock_action_NavigateToBlockAction | CardFormRestore_endIcon_RadioOptionBlock_action_LinkAction | CardFormRestore_endIcon_RadioOptionBlock_action_EmailAction;

export interface CardFormRestore_endIcon_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardFormRestore_endIcon_RadioOptionBlock_action | null;
  /**
   * pollOptionImageBlockId is present if a child block should be used as a poll option image.
   *       This child block should not be rendered normally, instead it should be used
   *       as a poll option image. Blocks are often of type ImageBlock
   */
  pollOptionImageBlockId: string | null;
}

export interface CardFormRestore_endIcon_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface CardFormRestore_endIcon_SignUpBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_endIcon_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_endIcon_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_endIcon_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_endIcon_SignUpBlock_action = CardFormRestore_endIcon_SignUpBlock_action_PhoneAction | CardFormRestore_endIcon_SignUpBlock_action_NavigateToBlockAction | CardFormRestore_endIcon_SignUpBlock_action_LinkAction | CardFormRestore_endIcon_SignUpBlock_action_EmailAction;

export interface CardFormRestore_endIcon_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardFormRestore_endIcon_SignUpBlock_action | null;
}

export interface CardFormRestore_endIcon_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface CardFormRestore_endIcon_StepBlock {
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

export interface CardFormRestore_endIcon_TextResponseBlock {
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

export interface CardFormRestore_endIcon_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardFormRestore_endIcon_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardFormRestore_endIcon_TypographyBlock_settings | null;
}

export interface CardFormRestore_endIcon_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardFormRestore_endIcon_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardFormRestore_endIcon_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardFormRestore_endIcon_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardFormRestore_endIcon_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardFormRestore_endIcon_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface CardFormRestore_endIcon_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardFormRestore_endIcon_VideoBlock_mediaVideo_Video_title[];
  images: CardFormRestore_endIcon_VideoBlock_mediaVideo_Video_images[];
  variant: CardFormRestore_endIcon_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: CardFormRestore_endIcon_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface CardFormRestore_endIcon_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardFormRestore_endIcon_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardFormRestore_endIcon_VideoBlock_mediaVideo = CardFormRestore_endIcon_VideoBlock_mediaVideo_Video | CardFormRestore_endIcon_VideoBlock_mediaVideo_MuxVideo | CardFormRestore_endIcon_VideoBlock_mediaVideo_YouTube;

export interface CardFormRestore_endIcon_VideoBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_endIcon_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_endIcon_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_endIcon_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_endIcon_VideoBlock_action = CardFormRestore_endIcon_VideoBlock_action_PhoneAction | CardFormRestore_endIcon_VideoBlock_action_NavigateToBlockAction | CardFormRestore_endIcon_VideoBlock_action_LinkAction | CardFormRestore_endIcon_VideoBlock_action_EmailAction;

export interface CardFormRestore_endIcon_VideoBlock {
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
  mediaVideo: CardFormRestore_endIcon_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardFormRestore_endIcon_VideoBlock_action | null;
}

export interface CardFormRestore_endIcon_VideoTriggerBlock_triggerAction_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_endIcon_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_endIcon_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_endIcon_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_endIcon_VideoTriggerBlock_triggerAction = CardFormRestore_endIcon_VideoTriggerBlock_triggerAction_PhoneAction | CardFormRestore_endIcon_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardFormRestore_endIcon_VideoTriggerBlock_triggerAction_LinkAction | CardFormRestore_endIcon_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardFormRestore_endIcon_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardFormRestore_endIcon_VideoTriggerBlock_triggerAction;
}

export type CardFormRestore_endIcon = CardFormRestore_endIcon_GridContainerBlock | CardFormRestore_endIcon_ButtonBlock | CardFormRestore_endIcon_CardBlock | CardFormRestore_endIcon_IconBlock | CardFormRestore_endIcon_ImageBlock | CardFormRestore_endIcon_RadioOptionBlock | CardFormRestore_endIcon_RadioQuestionBlock | CardFormRestore_endIcon_SignUpBlock | CardFormRestore_endIcon_SpacerBlock | CardFormRestore_endIcon_StepBlock | CardFormRestore_endIcon_TextResponseBlock | CardFormRestore_endIcon_TypographyBlock | CardFormRestore_endIcon_VideoBlock | CardFormRestore_endIcon_VideoTriggerBlock;

export interface CardFormRestore_body_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock" | "MultiselectBlock" | "MultiselectOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardFormRestore_body_ButtonBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_body_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_body_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_body_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_body_ButtonBlock_action = CardFormRestore_body_ButtonBlock_action_PhoneAction | CardFormRestore_body_ButtonBlock_action_NavigateToBlockAction | CardFormRestore_body_ButtonBlock_action_LinkAction | CardFormRestore_body_ButtonBlock_action_EmailAction;

export interface CardFormRestore_body_ButtonBlock_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface CardFormRestore_body_ButtonBlock {
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
  action: CardFormRestore_body_ButtonBlock_action | null;
  settings: CardFormRestore_body_ButtonBlock_settings | null;
}

export interface CardFormRestore_body_CardBlock {
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

export interface CardFormRestore_body_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardFormRestore_body_ImageBlock {
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

export interface CardFormRestore_body_RadioOptionBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_body_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_body_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_body_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_body_RadioOptionBlock_action = CardFormRestore_body_RadioOptionBlock_action_PhoneAction | CardFormRestore_body_RadioOptionBlock_action_NavigateToBlockAction | CardFormRestore_body_RadioOptionBlock_action_LinkAction | CardFormRestore_body_RadioOptionBlock_action_EmailAction;

export interface CardFormRestore_body_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardFormRestore_body_RadioOptionBlock_action | null;
  /**
   * pollOptionImageBlockId is present if a child block should be used as a poll option image.
   *       This child block should not be rendered normally, instead it should be used
   *       as a poll option image. Blocks are often of type ImageBlock
   */
  pollOptionImageBlockId: string | null;
}

export interface CardFormRestore_body_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface CardFormRestore_body_SignUpBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_body_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_body_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_body_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_body_SignUpBlock_action = CardFormRestore_body_SignUpBlock_action_PhoneAction | CardFormRestore_body_SignUpBlock_action_NavigateToBlockAction | CardFormRestore_body_SignUpBlock_action_LinkAction | CardFormRestore_body_SignUpBlock_action_EmailAction;

export interface CardFormRestore_body_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardFormRestore_body_SignUpBlock_action | null;
}

export interface CardFormRestore_body_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface CardFormRestore_body_StepBlock {
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

export interface CardFormRestore_body_TextResponseBlock {
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

export interface CardFormRestore_body_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardFormRestore_body_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardFormRestore_body_TypographyBlock_settings | null;
}

export interface CardFormRestore_body_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardFormRestore_body_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardFormRestore_body_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardFormRestore_body_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardFormRestore_body_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardFormRestore_body_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface CardFormRestore_body_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardFormRestore_body_VideoBlock_mediaVideo_Video_title[];
  images: CardFormRestore_body_VideoBlock_mediaVideo_Video_images[];
  variant: CardFormRestore_body_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: CardFormRestore_body_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface CardFormRestore_body_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardFormRestore_body_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardFormRestore_body_VideoBlock_mediaVideo = CardFormRestore_body_VideoBlock_mediaVideo_Video | CardFormRestore_body_VideoBlock_mediaVideo_MuxVideo | CardFormRestore_body_VideoBlock_mediaVideo_YouTube;

export interface CardFormRestore_body_VideoBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_body_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_body_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_body_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_body_VideoBlock_action = CardFormRestore_body_VideoBlock_action_PhoneAction | CardFormRestore_body_VideoBlock_action_NavigateToBlockAction | CardFormRestore_body_VideoBlock_action_LinkAction | CardFormRestore_body_VideoBlock_action_EmailAction;

export interface CardFormRestore_body_VideoBlock {
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
  mediaVideo: CardFormRestore_body_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardFormRestore_body_VideoBlock_action | null;
}

export interface CardFormRestore_body_VideoTriggerBlock_triggerAction_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormRestore_body_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_body_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_body_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_body_VideoTriggerBlock_triggerAction = CardFormRestore_body_VideoTriggerBlock_triggerAction_PhoneAction | CardFormRestore_body_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardFormRestore_body_VideoTriggerBlock_triggerAction_LinkAction | CardFormRestore_body_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardFormRestore_body_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardFormRestore_body_VideoTriggerBlock_triggerAction;
}

export type CardFormRestore_body = CardFormRestore_body_GridContainerBlock | CardFormRestore_body_ButtonBlock | CardFormRestore_body_CardBlock | CardFormRestore_body_IconBlock | CardFormRestore_body_ImageBlock | CardFormRestore_body_RadioOptionBlock | CardFormRestore_body_RadioQuestionBlock | CardFormRestore_body_SignUpBlock | CardFormRestore_body_SpacerBlock | CardFormRestore_body_StepBlock | CardFormRestore_body_TextResponseBlock | CardFormRestore_body_TypographyBlock | CardFormRestore_body_VideoBlock | CardFormRestore_body_VideoTriggerBlock;

export interface CardFormRestore_cardBlockUpdate {
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

export interface CardFormRestore {
  /**
   * blockRestore is used for redo/undo
   */
  image: CardFormRestore_image[];
  /**
   * blockRestore is used for redo/undo
   */
  subtitle: CardFormRestore_subtitle[];
  /**
   * blockRestore is used for redo/undo
   */
  title: CardFormRestore_title[];
  /**
   * blockRestore is used for redo/undo
   */
  textResponse: CardFormRestore_textResponse[];
  /**
   * blockRestore is used for redo/undo
   */
  button: CardFormRestore_button[];
  /**
   * blockRestore is used for redo/undo
   */
  startIcon: CardFormRestore_startIcon[];
  /**
   * blockRestore is used for redo/undo
   */
  endIcon: CardFormRestore_endIcon[];
  /**
   * blockRestore is used for redo/undo
   */
  body: CardFormRestore_body[];
  cardBlockUpdate: CardFormRestore_cardBlockUpdate;
}

export interface CardFormRestoreVariables {
  imageId: string;
  subtitleId: string;
  titleId: string;
  textResponseId: string;
  buttonId: string;
  startIconId: string;
  endIconId: string;
  bodyId: string;
  cardId: string;
  journeyId: string;
  cardInput: CardBlockUpdateInput;
}

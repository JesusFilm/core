/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CardBlockUpdateInput, ButtonVariant, ButtonColor, ButtonSize, ThemeMode, ThemeName, IconName, IconSize, IconColor, TextResponseType, TypographyAlign, TypographyColor, TypographyVariant, VideoBlockSource, VideoBlockObjectFit } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CardFormRestore
// ====================================================

export interface CardFormRestore_image_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
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

export type CardFormRestore_image_ButtonBlock_action = CardFormRestore_image_ButtonBlock_action_NavigateToBlockAction | CardFormRestore_image_ButtonBlock_action_LinkAction | CardFormRestore_image_ButtonBlock_action_EmailAction;

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
  action: CardFormRestore_image_ButtonBlock_action | null;
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

export interface CardFormRestore_image_FormBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_image_FormBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_image_FormBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_image_FormBlock_action = CardFormRestore_image_FormBlock_action_NavigateToBlockAction | CardFormRestore_image_FormBlock_action_LinkAction | CardFormRestore_image_FormBlock_action_EmailAction;

export interface CardFormRestore_image_FormBlock {
  __typename: "FormBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  form: any | null;
  action: CardFormRestore_image_FormBlock_action | null;
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

export type CardFormRestore_image_RadioOptionBlock_action = CardFormRestore_image_RadioOptionBlock_action_NavigateToBlockAction | CardFormRestore_image_RadioOptionBlock_action_LinkAction | CardFormRestore_image_RadioOptionBlock_action_EmailAction;

export interface CardFormRestore_image_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardFormRestore_image_RadioOptionBlock_action | null;
}

export interface CardFormRestore_image_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
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

export type CardFormRestore_image_SignUpBlock_action = CardFormRestore_image_SignUpBlock_action_NavigateToBlockAction | CardFormRestore_image_SignUpBlock_action_LinkAction | CardFormRestore_image_SignUpBlock_action_EmailAction;

export interface CardFormRestore_image_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardFormRestore_image_SignUpBlock_action | null;
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
  label: string;
  hint: string | null;
  minRows: number | null;
  type: TextResponseType | null;
  routeId: string | null;
  integrationId: string | null;
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
}

export interface CardFormRestore_image_VideoBlock_video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardFormRestore_image_VideoBlock_video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardFormRestore_image_VideoBlock_video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardFormRestore_image_VideoBlock_video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardFormRestore_image_VideoBlock_video_variantLanguages_name[];
}

export interface CardFormRestore_image_VideoBlock_video {
  __typename: "Video";
  id: string;
  title: CardFormRestore_image_VideoBlock_video_title[];
  image: string | null;
  variant: CardFormRestore_image_VideoBlock_video_variant | null;
  variantLanguages: CardFormRestore_image_VideoBlock_video_variantLanguages[];
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

export type CardFormRestore_image_VideoBlock_action = CardFormRestore_image_VideoBlock_action_NavigateToBlockAction | CardFormRestore_image_VideoBlock_action_LinkAction | CardFormRestore_image_VideoBlock_action_EmailAction;

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
  /**
   * internal source videos: video is only populated when videoID and
   * videoVariantLanguageId are present
   */
  video: CardFormRestore_image_VideoBlock_video | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardFormRestore_image_VideoBlock_action | null;
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

export type CardFormRestore_image_VideoTriggerBlock_triggerAction = CardFormRestore_image_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardFormRestore_image_VideoTriggerBlock_triggerAction_LinkAction | CardFormRestore_image_VideoTriggerBlock_triggerAction_EmailAction;

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

export type CardFormRestore_image = CardFormRestore_image_GridContainerBlock | CardFormRestore_image_ButtonBlock | CardFormRestore_image_CardBlock | CardFormRestore_image_FormBlock | CardFormRestore_image_IconBlock | CardFormRestore_image_ImageBlock | CardFormRestore_image_RadioOptionBlock | CardFormRestore_image_RadioQuestionBlock | CardFormRestore_image_SignUpBlock | CardFormRestore_image_StepBlock | CardFormRestore_image_TextResponseBlock | CardFormRestore_image_TypographyBlock | CardFormRestore_image_VideoBlock | CardFormRestore_image_VideoTriggerBlock;

export interface CardFormRestore_subtitle_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
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

export type CardFormRestore_subtitle_ButtonBlock_action = CardFormRestore_subtitle_ButtonBlock_action_NavigateToBlockAction | CardFormRestore_subtitle_ButtonBlock_action_LinkAction | CardFormRestore_subtitle_ButtonBlock_action_EmailAction;

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
  action: CardFormRestore_subtitle_ButtonBlock_action | null;
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

export interface CardFormRestore_subtitle_FormBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_subtitle_FormBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_subtitle_FormBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_subtitle_FormBlock_action = CardFormRestore_subtitle_FormBlock_action_NavigateToBlockAction | CardFormRestore_subtitle_FormBlock_action_LinkAction | CardFormRestore_subtitle_FormBlock_action_EmailAction;

export interface CardFormRestore_subtitle_FormBlock {
  __typename: "FormBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  form: any | null;
  action: CardFormRestore_subtitle_FormBlock_action | null;
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

export type CardFormRestore_subtitle_RadioOptionBlock_action = CardFormRestore_subtitle_RadioOptionBlock_action_NavigateToBlockAction | CardFormRestore_subtitle_RadioOptionBlock_action_LinkAction | CardFormRestore_subtitle_RadioOptionBlock_action_EmailAction;

export interface CardFormRestore_subtitle_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardFormRestore_subtitle_RadioOptionBlock_action | null;
}

export interface CardFormRestore_subtitle_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
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

export type CardFormRestore_subtitle_SignUpBlock_action = CardFormRestore_subtitle_SignUpBlock_action_NavigateToBlockAction | CardFormRestore_subtitle_SignUpBlock_action_LinkAction | CardFormRestore_subtitle_SignUpBlock_action_EmailAction;

export interface CardFormRestore_subtitle_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardFormRestore_subtitle_SignUpBlock_action | null;
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
  label: string;
  hint: string | null;
  minRows: number | null;
  type: TextResponseType | null;
  routeId: string | null;
  integrationId: string | null;
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
}

export interface CardFormRestore_subtitle_VideoBlock_video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardFormRestore_subtitle_VideoBlock_video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardFormRestore_subtitle_VideoBlock_video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardFormRestore_subtitle_VideoBlock_video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardFormRestore_subtitle_VideoBlock_video_variantLanguages_name[];
}

export interface CardFormRestore_subtitle_VideoBlock_video {
  __typename: "Video";
  id: string;
  title: CardFormRestore_subtitle_VideoBlock_video_title[];
  image: string | null;
  variant: CardFormRestore_subtitle_VideoBlock_video_variant | null;
  variantLanguages: CardFormRestore_subtitle_VideoBlock_video_variantLanguages[];
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

export type CardFormRestore_subtitle_VideoBlock_action = CardFormRestore_subtitle_VideoBlock_action_NavigateToBlockAction | CardFormRestore_subtitle_VideoBlock_action_LinkAction | CardFormRestore_subtitle_VideoBlock_action_EmailAction;

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
  /**
   * internal source videos: video is only populated when videoID and
   * videoVariantLanguageId are present
   */
  video: CardFormRestore_subtitle_VideoBlock_video | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardFormRestore_subtitle_VideoBlock_action | null;
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

export type CardFormRestore_subtitle_VideoTriggerBlock_triggerAction = CardFormRestore_subtitle_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardFormRestore_subtitle_VideoTriggerBlock_triggerAction_LinkAction | CardFormRestore_subtitle_VideoTriggerBlock_triggerAction_EmailAction;

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

export type CardFormRestore_subtitle = CardFormRestore_subtitle_GridContainerBlock | CardFormRestore_subtitle_ButtonBlock | CardFormRestore_subtitle_CardBlock | CardFormRestore_subtitle_FormBlock | CardFormRestore_subtitle_IconBlock | CardFormRestore_subtitle_ImageBlock | CardFormRestore_subtitle_RadioOptionBlock | CardFormRestore_subtitle_RadioQuestionBlock | CardFormRestore_subtitle_SignUpBlock | CardFormRestore_subtitle_StepBlock | CardFormRestore_subtitle_TextResponseBlock | CardFormRestore_subtitle_TypographyBlock | CardFormRestore_subtitle_VideoBlock | CardFormRestore_subtitle_VideoTriggerBlock;

export interface CardFormRestore_title_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
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

export type CardFormRestore_title_ButtonBlock_action = CardFormRestore_title_ButtonBlock_action_NavigateToBlockAction | CardFormRestore_title_ButtonBlock_action_LinkAction | CardFormRestore_title_ButtonBlock_action_EmailAction;

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
  action: CardFormRestore_title_ButtonBlock_action | null;
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

export interface CardFormRestore_title_FormBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_title_FormBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_title_FormBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_title_FormBlock_action = CardFormRestore_title_FormBlock_action_NavigateToBlockAction | CardFormRestore_title_FormBlock_action_LinkAction | CardFormRestore_title_FormBlock_action_EmailAction;

export interface CardFormRestore_title_FormBlock {
  __typename: "FormBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  form: any | null;
  action: CardFormRestore_title_FormBlock_action | null;
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

export type CardFormRestore_title_RadioOptionBlock_action = CardFormRestore_title_RadioOptionBlock_action_NavigateToBlockAction | CardFormRestore_title_RadioOptionBlock_action_LinkAction | CardFormRestore_title_RadioOptionBlock_action_EmailAction;

export interface CardFormRestore_title_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardFormRestore_title_RadioOptionBlock_action | null;
}

export interface CardFormRestore_title_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
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

export type CardFormRestore_title_SignUpBlock_action = CardFormRestore_title_SignUpBlock_action_NavigateToBlockAction | CardFormRestore_title_SignUpBlock_action_LinkAction | CardFormRestore_title_SignUpBlock_action_EmailAction;

export interface CardFormRestore_title_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardFormRestore_title_SignUpBlock_action | null;
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
  label: string;
  hint: string | null;
  minRows: number | null;
  type: TextResponseType | null;
  routeId: string | null;
  integrationId: string | null;
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
}

export interface CardFormRestore_title_VideoBlock_video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardFormRestore_title_VideoBlock_video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardFormRestore_title_VideoBlock_video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardFormRestore_title_VideoBlock_video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardFormRestore_title_VideoBlock_video_variantLanguages_name[];
}

export interface CardFormRestore_title_VideoBlock_video {
  __typename: "Video";
  id: string;
  title: CardFormRestore_title_VideoBlock_video_title[];
  image: string | null;
  variant: CardFormRestore_title_VideoBlock_video_variant | null;
  variantLanguages: CardFormRestore_title_VideoBlock_video_variantLanguages[];
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

export type CardFormRestore_title_VideoBlock_action = CardFormRestore_title_VideoBlock_action_NavigateToBlockAction | CardFormRestore_title_VideoBlock_action_LinkAction | CardFormRestore_title_VideoBlock_action_EmailAction;

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
  /**
   * internal source videos: video is only populated when videoID and
   * videoVariantLanguageId are present
   */
  video: CardFormRestore_title_VideoBlock_video | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardFormRestore_title_VideoBlock_action | null;
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

export type CardFormRestore_title_VideoTriggerBlock_triggerAction = CardFormRestore_title_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardFormRestore_title_VideoTriggerBlock_triggerAction_LinkAction | CardFormRestore_title_VideoTriggerBlock_triggerAction_EmailAction;

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

export type CardFormRestore_title = CardFormRestore_title_GridContainerBlock | CardFormRestore_title_ButtonBlock | CardFormRestore_title_CardBlock | CardFormRestore_title_FormBlock | CardFormRestore_title_IconBlock | CardFormRestore_title_ImageBlock | CardFormRestore_title_RadioOptionBlock | CardFormRestore_title_RadioQuestionBlock | CardFormRestore_title_SignUpBlock | CardFormRestore_title_StepBlock | CardFormRestore_title_TextResponseBlock | CardFormRestore_title_TypographyBlock | CardFormRestore_title_VideoBlock | CardFormRestore_title_VideoTriggerBlock;

export interface CardFormRestore_textResponse_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
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

export type CardFormRestore_textResponse_ButtonBlock_action = CardFormRestore_textResponse_ButtonBlock_action_NavigateToBlockAction | CardFormRestore_textResponse_ButtonBlock_action_LinkAction | CardFormRestore_textResponse_ButtonBlock_action_EmailAction;

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
  action: CardFormRestore_textResponse_ButtonBlock_action | null;
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

export interface CardFormRestore_textResponse_FormBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_textResponse_FormBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_textResponse_FormBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_textResponse_FormBlock_action = CardFormRestore_textResponse_FormBlock_action_NavigateToBlockAction | CardFormRestore_textResponse_FormBlock_action_LinkAction | CardFormRestore_textResponse_FormBlock_action_EmailAction;

export interface CardFormRestore_textResponse_FormBlock {
  __typename: "FormBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  form: any | null;
  action: CardFormRestore_textResponse_FormBlock_action | null;
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

export type CardFormRestore_textResponse_RadioOptionBlock_action = CardFormRestore_textResponse_RadioOptionBlock_action_NavigateToBlockAction | CardFormRestore_textResponse_RadioOptionBlock_action_LinkAction | CardFormRestore_textResponse_RadioOptionBlock_action_EmailAction;

export interface CardFormRestore_textResponse_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardFormRestore_textResponse_RadioOptionBlock_action | null;
}

export interface CardFormRestore_textResponse_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
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

export type CardFormRestore_textResponse_SignUpBlock_action = CardFormRestore_textResponse_SignUpBlock_action_NavigateToBlockAction | CardFormRestore_textResponse_SignUpBlock_action_LinkAction | CardFormRestore_textResponse_SignUpBlock_action_EmailAction;

export interface CardFormRestore_textResponse_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardFormRestore_textResponse_SignUpBlock_action | null;
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
  label: string;
  hint: string | null;
  minRows: number | null;
  type: TextResponseType | null;
  routeId: string | null;
  integrationId: string | null;
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
}

export interface CardFormRestore_textResponse_VideoBlock_video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardFormRestore_textResponse_VideoBlock_video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardFormRestore_textResponse_VideoBlock_video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardFormRestore_textResponse_VideoBlock_video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardFormRestore_textResponse_VideoBlock_video_variantLanguages_name[];
}

export interface CardFormRestore_textResponse_VideoBlock_video {
  __typename: "Video";
  id: string;
  title: CardFormRestore_textResponse_VideoBlock_video_title[];
  image: string | null;
  variant: CardFormRestore_textResponse_VideoBlock_video_variant | null;
  variantLanguages: CardFormRestore_textResponse_VideoBlock_video_variantLanguages[];
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

export type CardFormRestore_textResponse_VideoBlock_action = CardFormRestore_textResponse_VideoBlock_action_NavigateToBlockAction | CardFormRestore_textResponse_VideoBlock_action_LinkAction | CardFormRestore_textResponse_VideoBlock_action_EmailAction;

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
  /**
   * internal source videos: video is only populated when videoID and
   * videoVariantLanguageId are present
   */
  video: CardFormRestore_textResponse_VideoBlock_video | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardFormRestore_textResponse_VideoBlock_action | null;
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

export type CardFormRestore_textResponse_VideoTriggerBlock_triggerAction = CardFormRestore_textResponse_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardFormRestore_textResponse_VideoTriggerBlock_triggerAction_LinkAction | CardFormRestore_textResponse_VideoTriggerBlock_triggerAction_EmailAction;

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

export type CardFormRestore_textResponse = CardFormRestore_textResponse_GridContainerBlock | CardFormRestore_textResponse_ButtonBlock | CardFormRestore_textResponse_CardBlock | CardFormRestore_textResponse_FormBlock | CardFormRestore_textResponse_IconBlock | CardFormRestore_textResponse_ImageBlock | CardFormRestore_textResponse_RadioOptionBlock | CardFormRestore_textResponse_RadioQuestionBlock | CardFormRestore_textResponse_SignUpBlock | CardFormRestore_textResponse_StepBlock | CardFormRestore_textResponse_TextResponseBlock | CardFormRestore_textResponse_TypographyBlock | CardFormRestore_textResponse_VideoBlock | CardFormRestore_textResponse_VideoTriggerBlock;

export interface CardFormRestore_body_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
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

export type CardFormRestore_body_ButtonBlock_action = CardFormRestore_body_ButtonBlock_action_NavigateToBlockAction | CardFormRestore_body_ButtonBlock_action_LinkAction | CardFormRestore_body_ButtonBlock_action_EmailAction;

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
  action: CardFormRestore_body_ButtonBlock_action | null;
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

export interface CardFormRestore_body_FormBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormRestore_body_FormBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormRestore_body_FormBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormRestore_body_FormBlock_action = CardFormRestore_body_FormBlock_action_NavigateToBlockAction | CardFormRestore_body_FormBlock_action_LinkAction | CardFormRestore_body_FormBlock_action_EmailAction;

export interface CardFormRestore_body_FormBlock {
  __typename: "FormBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  form: any | null;
  action: CardFormRestore_body_FormBlock_action | null;
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

export type CardFormRestore_body_RadioOptionBlock_action = CardFormRestore_body_RadioOptionBlock_action_NavigateToBlockAction | CardFormRestore_body_RadioOptionBlock_action_LinkAction | CardFormRestore_body_RadioOptionBlock_action_EmailAction;

export interface CardFormRestore_body_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardFormRestore_body_RadioOptionBlock_action | null;
}

export interface CardFormRestore_body_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
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

export type CardFormRestore_body_SignUpBlock_action = CardFormRestore_body_SignUpBlock_action_NavigateToBlockAction | CardFormRestore_body_SignUpBlock_action_LinkAction | CardFormRestore_body_SignUpBlock_action_EmailAction;

export interface CardFormRestore_body_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardFormRestore_body_SignUpBlock_action | null;
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
  label: string;
  hint: string | null;
  minRows: number | null;
  type: TextResponseType | null;
  routeId: string | null;
  integrationId: string | null;
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
}

export interface CardFormRestore_body_VideoBlock_video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardFormRestore_body_VideoBlock_video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardFormRestore_body_VideoBlock_video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardFormRestore_body_VideoBlock_video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardFormRestore_body_VideoBlock_video_variantLanguages_name[];
}

export interface CardFormRestore_body_VideoBlock_video {
  __typename: "Video";
  id: string;
  title: CardFormRestore_body_VideoBlock_video_title[];
  image: string | null;
  variant: CardFormRestore_body_VideoBlock_video_variant | null;
  variantLanguages: CardFormRestore_body_VideoBlock_video_variantLanguages[];
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

export type CardFormRestore_body_VideoBlock_action = CardFormRestore_body_VideoBlock_action_NavigateToBlockAction | CardFormRestore_body_VideoBlock_action_LinkAction | CardFormRestore_body_VideoBlock_action_EmailAction;

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
  /**
   * internal source videos: video is only populated when videoID and
   * videoVariantLanguageId are present
   */
  video: CardFormRestore_body_VideoBlock_video | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardFormRestore_body_VideoBlock_action | null;
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

export type CardFormRestore_body_VideoTriggerBlock_triggerAction = CardFormRestore_body_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardFormRestore_body_VideoTriggerBlock_triggerAction_LinkAction | CardFormRestore_body_VideoTriggerBlock_triggerAction_EmailAction;

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

export type CardFormRestore_body = CardFormRestore_body_GridContainerBlock | CardFormRestore_body_ButtonBlock | CardFormRestore_body_CardBlock | CardFormRestore_body_FormBlock | CardFormRestore_body_IconBlock | CardFormRestore_body_ImageBlock | CardFormRestore_body_RadioOptionBlock | CardFormRestore_body_RadioQuestionBlock | CardFormRestore_body_SignUpBlock | CardFormRestore_body_StepBlock | CardFormRestore_body_TextResponseBlock | CardFormRestore_body_TypographyBlock | CardFormRestore_body_VideoBlock | CardFormRestore_body_VideoTriggerBlock;

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
  body: CardFormRestore_body[];
  cardBlockUpdate: CardFormRestore_cardBlockUpdate;
}

export interface CardFormRestoreVariables {
  imageId: string;
  subtitleId: string;
  titleId: string;
  textResponseId: string;
  bodyId: string;
  cardId: string;
  journeyId: string;
  cardInput: CardBlockUpdateInput;
}

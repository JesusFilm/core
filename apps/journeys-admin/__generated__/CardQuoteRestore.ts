/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CardBlockUpdateInput, ButtonVariant, ButtonColor, ButtonSize, ThemeMode, ThemeName, IconName, IconSize, IconColor, TextResponseType, TypographyAlign, TypographyColor, TypographyVariant, VideoBlockSource, VideoBlockObjectFit } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CardQuoteRestore
// ====================================================

export interface CardQuoteRestore_image_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardQuoteRestore_image_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardQuoteRestore_image_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardQuoteRestore_image_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardQuoteRestore_image_ButtonBlock_action = CardQuoteRestore_image_ButtonBlock_action_NavigateToBlockAction | CardQuoteRestore_image_ButtonBlock_action_LinkAction | CardQuoteRestore_image_ButtonBlock_action_EmailAction;

export interface CardQuoteRestore_image_ButtonBlock {
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
  action: CardQuoteRestore_image_ButtonBlock_action | null;
}

export interface CardQuoteRestore_image_CardBlock {
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

export interface CardQuoteRestore_image_FormBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardQuoteRestore_image_FormBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardQuoteRestore_image_FormBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardQuoteRestore_image_FormBlock_action = CardQuoteRestore_image_FormBlock_action_NavigateToBlockAction | CardQuoteRestore_image_FormBlock_action_LinkAction | CardQuoteRestore_image_FormBlock_action_EmailAction;

export interface CardQuoteRestore_image_FormBlock {
  __typename: "FormBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  form: any | null;
  action: CardQuoteRestore_image_FormBlock_action | null;
}

export interface CardQuoteRestore_image_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardQuoteRestore_image_ImageBlock {
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
}

export interface CardQuoteRestore_image_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardQuoteRestore_image_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardQuoteRestore_image_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardQuoteRestore_image_RadioOptionBlock_action = CardQuoteRestore_image_RadioOptionBlock_action_NavigateToBlockAction | CardQuoteRestore_image_RadioOptionBlock_action_LinkAction | CardQuoteRestore_image_RadioOptionBlock_action_EmailAction;

export interface CardQuoteRestore_image_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardQuoteRestore_image_RadioOptionBlock_action | null;
}

export interface CardQuoteRestore_image_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardQuoteRestore_image_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardQuoteRestore_image_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardQuoteRestore_image_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardQuoteRestore_image_SignUpBlock_action = CardQuoteRestore_image_SignUpBlock_action_NavigateToBlockAction | CardQuoteRestore_image_SignUpBlock_action_LinkAction | CardQuoteRestore_image_SignUpBlock_action_EmailAction;

export interface CardQuoteRestore_image_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardQuoteRestore_image_SignUpBlock_action | null;
}

export interface CardQuoteRestore_image_StepBlock {
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
}

export interface CardQuoteRestore_image_TextResponseBlock {
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

export interface CardQuoteRestore_image_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
}

export interface CardQuoteRestore_image_VideoBlock_video_title {
  __typename: "Translation";
  value: string;
}

export interface CardQuoteRestore_image_VideoBlock_video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardQuoteRestore_image_VideoBlock_video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardQuoteRestore_image_VideoBlock_video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardQuoteRestore_image_VideoBlock_video_variantLanguages_name[];
}

export interface CardQuoteRestore_image_VideoBlock_video {
  __typename: "Video";
  id: string;
  title: CardQuoteRestore_image_VideoBlock_video_title[];
  image: string | null;
  variant: CardQuoteRestore_image_VideoBlock_video_variant | null;
  variantLanguages: CardQuoteRestore_image_VideoBlock_video_variantLanguages[];
}

export interface CardQuoteRestore_image_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardQuoteRestore_image_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardQuoteRestore_image_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardQuoteRestore_image_VideoBlock_action = CardQuoteRestore_image_VideoBlock_action_NavigateToBlockAction | CardQuoteRestore_image_VideoBlock_action_LinkAction | CardQuoteRestore_image_VideoBlock_action_EmailAction;

export interface CardQuoteRestore_image_VideoBlock {
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
  video: CardQuoteRestore_image_VideoBlock_video | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardQuoteRestore_image_VideoBlock_action | null;
}

export interface CardQuoteRestore_image_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardQuoteRestore_image_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardQuoteRestore_image_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardQuoteRestore_image_VideoTriggerBlock_triggerAction = CardQuoteRestore_image_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardQuoteRestore_image_VideoTriggerBlock_triggerAction_LinkAction | CardQuoteRestore_image_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardQuoteRestore_image_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardQuoteRestore_image_VideoTriggerBlock_triggerAction;
}

export type CardQuoteRestore_image = CardQuoteRestore_image_GridContainerBlock | CardQuoteRestore_image_ButtonBlock | CardQuoteRestore_image_CardBlock | CardQuoteRestore_image_FormBlock | CardQuoteRestore_image_IconBlock | CardQuoteRestore_image_ImageBlock | CardQuoteRestore_image_RadioOptionBlock | CardQuoteRestore_image_RadioQuestionBlock | CardQuoteRestore_image_SignUpBlock | CardQuoteRestore_image_StepBlock | CardQuoteRestore_image_TextResponseBlock | CardQuoteRestore_image_TypographyBlock | CardQuoteRestore_image_VideoBlock | CardQuoteRestore_image_VideoTriggerBlock;

export interface CardQuoteRestore_subtitle_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardQuoteRestore_subtitle_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardQuoteRestore_subtitle_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardQuoteRestore_subtitle_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardQuoteRestore_subtitle_ButtonBlock_action = CardQuoteRestore_subtitle_ButtonBlock_action_NavigateToBlockAction | CardQuoteRestore_subtitle_ButtonBlock_action_LinkAction | CardQuoteRestore_subtitle_ButtonBlock_action_EmailAction;

export interface CardQuoteRestore_subtitle_ButtonBlock {
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
  action: CardQuoteRestore_subtitle_ButtonBlock_action | null;
}

export interface CardQuoteRestore_subtitle_CardBlock {
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

export interface CardQuoteRestore_subtitle_FormBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardQuoteRestore_subtitle_FormBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardQuoteRestore_subtitle_FormBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardQuoteRestore_subtitle_FormBlock_action = CardQuoteRestore_subtitle_FormBlock_action_NavigateToBlockAction | CardQuoteRestore_subtitle_FormBlock_action_LinkAction | CardQuoteRestore_subtitle_FormBlock_action_EmailAction;

export interface CardQuoteRestore_subtitle_FormBlock {
  __typename: "FormBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  form: any | null;
  action: CardQuoteRestore_subtitle_FormBlock_action | null;
}

export interface CardQuoteRestore_subtitle_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardQuoteRestore_subtitle_ImageBlock {
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
}

export interface CardQuoteRestore_subtitle_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardQuoteRestore_subtitle_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardQuoteRestore_subtitle_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardQuoteRestore_subtitle_RadioOptionBlock_action = CardQuoteRestore_subtitle_RadioOptionBlock_action_NavigateToBlockAction | CardQuoteRestore_subtitle_RadioOptionBlock_action_LinkAction | CardQuoteRestore_subtitle_RadioOptionBlock_action_EmailAction;

export interface CardQuoteRestore_subtitle_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardQuoteRestore_subtitle_RadioOptionBlock_action | null;
}

export interface CardQuoteRestore_subtitle_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardQuoteRestore_subtitle_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardQuoteRestore_subtitle_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardQuoteRestore_subtitle_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardQuoteRestore_subtitle_SignUpBlock_action = CardQuoteRestore_subtitle_SignUpBlock_action_NavigateToBlockAction | CardQuoteRestore_subtitle_SignUpBlock_action_LinkAction | CardQuoteRestore_subtitle_SignUpBlock_action_EmailAction;

export interface CardQuoteRestore_subtitle_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardQuoteRestore_subtitle_SignUpBlock_action | null;
}

export interface CardQuoteRestore_subtitle_StepBlock {
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
}

export interface CardQuoteRestore_subtitle_TextResponseBlock {
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

export interface CardQuoteRestore_subtitle_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
}

export interface CardQuoteRestore_subtitle_VideoBlock_video_title {
  __typename: "Translation";
  value: string;
}

export interface CardQuoteRestore_subtitle_VideoBlock_video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardQuoteRestore_subtitle_VideoBlock_video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardQuoteRestore_subtitle_VideoBlock_video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardQuoteRestore_subtitle_VideoBlock_video_variantLanguages_name[];
}

export interface CardQuoteRestore_subtitle_VideoBlock_video {
  __typename: "Video";
  id: string;
  title: CardQuoteRestore_subtitle_VideoBlock_video_title[];
  image: string | null;
  variant: CardQuoteRestore_subtitle_VideoBlock_video_variant | null;
  variantLanguages: CardQuoteRestore_subtitle_VideoBlock_video_variantLanguages[];
}

export interface CardQuoteRestore_subtitle_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardQuoteRestore_subtitle_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardQuoteRestore_subtitle_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardQuoteRestore_subtitle_VideoBlock_action = CardQuoteRestore_subtitle_VideoBlock_action_NavigateToBlockAction | CardQuoteRestore_subtitle_VideoBlock_action_LinkAction | CardQuoteRestore_subtitle_VideoBlock_action_EmailAction;

export interface CardQuoteRestore_subtitle_VideoBlock {
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
  video: CardQuoteRestore_subtitle_VideoBlock_video | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardQuoteRestore_subtitle_VideoBlock_action | null;
}

export interface CardQuoteRestore_subtitle_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardQuoteRestore_subtitle_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardQuoteRestore_subtitle_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardQuoteRestore_subtitle_VideoTriggerBlock_triggerAction = CardQuoteRestore_subtitle_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardQuoteRestore_subtitle_VideoTriggerBlock_triggerAction_LinkAction | CardQuoteRestore_subtitle_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardQuoteRestore_subtitle_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardQuoteRestore_subtitle_VideoTriggerBlock_triggerAction;
}

export type CardQuoteRestore_subtitle = CardQuoteRestore_subtitle_GridContainerBlock | CardQuoteRestore_subtitle_ButtonBlock | CardQuoteRestore_subtitle_CardBlock | CardQuoteRestore_subtitle_FormBlock | CardQuoteRestore_subtitle_IconBlock | CardQuoteRestore_subtitle_ImageBlock | CardQuoteRestore_subtitle_RadioOptionBlock | CardQuoteRestore_subtitle_RadioQuestionBlock | CardQuoteRestore_subtitle_SignUpBlock | CardQuoteRestore_subtitle_StepBlock | CardQuoteRestore_subtitle_TextResponseBlock | CardQuoteRestore_subtitle_TypographyBlock | CardQuoteRestore_subtitle_VideoBlock | CardQuoteRestore_subtitle_VideoTriggerBlock;

export interface CardQuoteRestore_title_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardQuoteRestore_title_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardQuoteRestore_title_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardQuoteRestore_title_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardQuoteRestore_title_ButtonBlock_action = CardQuoteRestore_title_ButtonBlock_action_NavigateToBlockAction | CardQuoteRestore_title_ButtonBlock_action_LinkAction | CardQuoteRestore_title_ButtonBlock_action_EmailAction;

export interface CardQuoteRestore_title_ButtonBlock {
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
  action: CardQuoteRestore_title_ButtonBlock_action | null;
}

export interface CardQuoteRestore_title_CardBlock {
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

export interface CardQuoteRestore_title_FormBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardQuoteRestore_title_FormBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardQuoteRestore_title_FormBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardQuoteRestore_title_FormBlock_action = CardQuoteRestore_title_FormBlock_action_NavigateToBlockAction | CardQuoteRestore_title_FormBlock_action_LinkAction | CardQuoteRestore_title_FormBlock_action_EmailAction;

export interface CardQuoteRestore_title_FormBlock {
  __typename: "FormBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  form: any | null;
  action: CardQuoteRestore_title_FormBlock_action | null;
}

export interface CardQuoteRestore_title_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardQuoteRestore_title_ImageBlock {
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
}

export interface CardQuoteRestore_title_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardQuoteRestore_title_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardQuoteRestore_title_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardQuoteRestore_title_RadioOptionBlock_action = CardQuoteRestore_title_RadioOptionBlock_action_NavigateToBlockAction | CardQuoteRestore_title_RadioOptionBlock_action_LinkAction | CardQuoteRestore_title_RadioOptionBlock_action_EmailAction;

export interface CardQuoteRestore_title_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardQuoteRestore_title_RadioOptionBlock_action | null;
}

export interface CardQuoteRestore_title_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardQuoteRestore_title_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardQuoteRestore_title_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardQuoteRestore_title_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardQuoteRestore_title_SignUpBlock_action = CardQuoteRestore_title_SignUpBlock_action_NavigateToBlockAction | CardQuoteRestore_title_SignUpBlock_action_LinkAction | CardQuoteRestore_title_SignUpBlock_action_EmailAction;

export interface CardQuoteRestore_title_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardQuoteRestore_title_SignUpBlock_action | null;
}

export interface CardQuoteRestore_title_StepBlock {
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
}

export interface CardQuoteRestore_title_TextResponseBlock {
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

export interface CardQuoteRestore_title_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
}

export interface CardQuoteRestore_title_VideoBlock_video_title {
  __typename: "Translation";
  value: string;
}

export interface CardQuoteRestore_title_VideoBlock_video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardQuoteRestore_title_VideoBlock_video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardQuoteRestore_title_VideoBlock_video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardQuoteRestore_title_VideoBlock_video_variantLanguages_name[];
}

export interface CardQuoteRestore_title_VideoBlock_video {
  __typename: "Video";
  id: string;
  title: CardQuoteRestore_title_VideoBlock_video_title[];
  image: string | null;
  variant: CardQuoteRestore_title_VideoBlock_video_variant | null;
  variantLanguages: CardQuoteRestore_title_VideoBlock_video_variantLanguages[];
}

export interface CardQuoteRestore_title_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardQuoteRestore_title_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardQuoteRestore_title_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardQuoteRestore_title_VideoBlock_action = CardQuoteRestore_title_VideoBlock_action_NavigateToBlockAction | CardQuoteRestore_title_VideoBlock_action_LinkAction | CardQuoteRestore_title_VideoBlock_action_EmailAction;

export interface CardQuoteRestore_title_VideoBlock {
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
  video: CardQuoteRestore_title_VideoBlock_video | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardQuoteRestore_title_VideoBlock_action | null;
}

export interface CardQuoteRestore_title_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardQuoteRestore_title_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardQuoteRestore_title_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardQuoteRestore_title_VideoTriggerBlock_triggerAction = CardQuoteRestore_title_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardQuoteRestore_title_VideoTriggerBlock_triggerAction_LinkAction | CardQuoteRestore_title_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardQuoteRestore_title_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardQuoteRestore_title_VideoTriggerBlock_triggerAction;
}

export type CardQuoteRestore_title = CardQuoteRestore_title_GridContainerBlock | CardQuoteRestore_title_ButtonBlock | CardQuoteRestore_title_CardBlock | CardQuoteRestore_title_FormBlock | CardQuoteRestore_title_IconBlock | CardQuoteRestore_title_ImageBlock | CardQuoteRestore_title_RadioOptionBlock | CardQuoteRestore_title_RadioQuestionBlock | CardQuoteRestore_title_SignUpBlock | CardQuoteRestore_title_StepBlock | CardQuoteRestore_title_TextResponseBlock | CardQuoteRestore_title_TypographyBlock | CardQuoteRestore_title_VideoBlock | CardQuoteRestore_title_VideoTriggerBlock;

export interface CardQuoteRestore_body_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardQuoteRestore_body_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardQuoteRestore_body_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardQuoteRestore_body_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardQuoteRestore_body_ButtonBlock_action = CardQuoteRestore_body_ButtonBlock_action_NavigateToBlockAction | CardQuoteRestore_body_ButtonBlock_action_LinkAction | CardQuoteRestore_body_ButtonBlock_action_EmailAction;

export interface CardQuoteRestore_body_ButtonBlock {
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
  action: CardQuoteRestore_body_ButtonBlock_action | null;
}

export interface CardQuoteRestore_body_CardBlock {
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

export interface CardQuoteRestore_body_FormBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardQuoteRestore_body_FormBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardQuoteRestore_body_FormBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardQuoteRestore_body_FormBlock_action = CardQuoteRestore_body_FormBlock_action_NavigateToBlockAction | CardQuoteRestore_body_FormBlock_action_LinkAction | CardQuoteRestore_body_FormBlock_action_EmailAction;

export interface CardQuoteRestore_body_FormBlock {
  __typename: "FormBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  form: any | null;
  action: CardQuoteRestore_body_FormBlock_action | null;
}

export interface CardQuoteRestore_body_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardQuoteRestore_body_ImageBlock {
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
}

export interface CardQuoteRestore_body_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardQuoteRestore_body_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardQuoteRestore_body_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardQuoteRestore_body_RadioOptionBlock_action = CardQuoteRestore_body_RadioOptionBlock_action_NavigateToBlockAction | CardQuoteRestore_body_RadioOptionBlock_action_LinkAction | CardQuoteRestore_body_RadioOptionBlock_action_EmailAction;

export interface CardQuoteRestore_body_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardQuoteRestore_body_RadioOptionBlock_action | null;
}

export interface CardQuoteRestore_body_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardQuoteRestore_body_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardQuoteRestore_body_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardQuoteRestore_body_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardQuoteRestore_body_SignUpBlock_action = CardQuoteRestore_body_SignUpBlock_action_NavigateToBlockAction | CardQuoteRestore_body_SignUpBlock_action_LinkAction | CardQuoteRestore_body_SignUpBlock_action_EmailAction;

export interface CardQuoteRestore_body_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardQuoteRestore_body_SignUpBlock_action | null;
}

export interface CardQuoteRestore_body_StepBlock {
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
}

export interface CardQuoteRestore_body_TextResponseBlock {
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

export interface CardQuoteRestore_body_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
}

export interface CardQuoteRestore_body_VideoBlock_video_title {
  __typename: "Translation";
  value: string;
}

export interface CardQuoteRestore_body_VideoBlock_video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardQuoteRestore_body_VideoBlock_video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardQuoteRestore_body_VideoBlock_video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardQuoteRestore_body_VideoBlock_video_variantLanguages_name[];
}

export interface CardQuoteRestore_body_VideoBlock_video {
  __typename: "Video";
  id: string;
  title: CardQuoteRestore_body_VideoBlock_video_title[];
  image: string | null;
  variant: CardQuoteRestore_body_VideoBlock_video_variant | null;
  variantLanguages: CardQuoteRestore_body_VideoBlock_video_variantLanguages[];
}

export interface CardQuoteRestore_body_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardQuoteRestore_body_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardQuoteRestore_body_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardQuoteRestore_body_VideoBlock_action = CardQuoteRestore_body_VideoBlock_action_NavigateToBlockAction | CardQuoteRestore_body_VideoBlock_action_LinkAction | CardQuoteRestore_body_VideoBlock_action_EmailAction;

export interface CardQuoteRestore_body_VideoBlock {
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
  video: CardQuoteRestore_body_VideoBlock_video | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardQuoteRestore_body_VideoBlock_action | null;
}

export interface CardQuoteRestore_body_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardQuoteRestore_body_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardQuoteRestore_body_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardQuoteRestore_body_VideoTriggerBlock_triggerAction = CardQuoteRestore_body_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardQuoteRestore_body_VideoTriggerBlock_triggerAction_LinkAction | CardQuoteRestore_body_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardQuoteRestore_body_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardQuoteRestore_body_VideoTriggerBlock_triggerAction;
}

export type CardQuoteRestore_body = CardQuoteRestore_body_GridContainerBlock | CardQuoteRestore_body_ButtonBlock | CardQuoteRestore_body_CardBlock | CardQuoteRestore_body_FormBlock | CardQuoteRestore_body_IconBlock | CardQuoteRestore_body_ImageBlock | CardQuoteRestore_body_RadioOptionBlock | CardQuoteRestore_body_RadioQuestionBlock | CardQuoteRestore_body_SignUpBlock | CardQuoteRestore_body_StepBlock | CardQuoteRestore_body_TextResponseBlock | CardQuoteRestore_body_TypographyBlock | CardQuoteRestore_body_VideoBlock | CardQuoteRestore_body_VideoTriggerBlock;

export interface CardQuoteRestore_cardBlockUpdate {
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

export interface CardQuoteRestore {
  /**
   * blockRestore is used for redo/undo
   */
  image: CardQuoteRestore_image[];
  /**
   * blockRestore is used for redo/undo
   */
  subtitle: CardQuoteRestore_subtitle[];
  /**
   * blockRestore is used for redo/undo
   */
  title: CardQuoteRestore_title[];
  /**
   * blockRestore is used for redo/undo
   */
  body: CardQuoteRestore_body[];
  cardBlockUpdate: CardQuoteRestore_cardBlockUpdate;
}

export interface CardQuoteRestoreVariables {
  imageId: string;
  subtitleId: string;
  titleId: string;
  bodyId: string;
  cardId: string;
  cardInput: CardBlockUpdateInput;
}
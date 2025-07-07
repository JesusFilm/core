/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ButtonVariant, ButtonColor, ButtonSize, ThemeMode, ThemeName, IconName, IconSize, IconColor, TextResponseType, TypographyAlign, TypographyColor, TypographyVariant, VideoBlockSource, VideoBlockObjectFit } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CardIntroRestore
// ====================================================

export interface CardIntroRestore_subtitle_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardIntroRestore_subtitle_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroRestore_subtitle_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroRestore_subtitle_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroRestore_subtitle_ButtonBlock_action = CardIntroRestore_subtitle_ButtonBlock_action_NavigateToBlockAction | CardIntroRestore_subtitle_ButtonBlock_action_LinkAction | CardIntroRestore_subtitle_ButtonBlock_action_EmailAction;

export interface CardIntroRestore_subtitle_ButtonBlock {
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
  action: CardIntroRestore_subtitle_ButtonBlock_action | null;
}

export interface CardIntroRestore_subtitle_CardBlock {
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

export interface CardIntroRestore_subtitle_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardIntroRestore_subtitle_ImageBlock {
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

export interface CardIntroRestore_subtitle_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroRestore_subtitle_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroRestore_subtitle_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroRestore_subtitle_RadioOptionBlock_action = CardIntroRestore_subtitle_RadioOptionBlock_action_NavigateToBlockAction | CardIntroRestore_subtitle_RadioOptionBlock_action_LinkAction | CardIntroRestore_subtitle_RadioOptionBlock_action_EmailAction;

export interface CardIntroRestore_subtitle_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardIntroRestore_subtitle_RadioOptionBlock_action | null;
}

export interface CardIntroRestore_subtitle_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardIntroRestore_subtitle_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroRestore_subtitle_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroRestore_subtitle_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroRestore_subtitle_SignUpBlock_action = CardIntroRestore_subtitle_SignUpBlock_action_NavigateToBlockAction | CardIntroRestore_subtitle_SignUpBlock_action_LinkAction | CardIntroRestore_subtitle_SignUpBlock_action_EmailAction;

export interface CardIntroRestore_subtitle_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardIntroRestore_subtitle_SignUpBlock_action | null;
}

export interface CardIntroRestore_subtitle_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface CardIntroRestore_subtitle_StepBlock {
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

export interface CardIntroRestore_subtitle_TextResponseBlock {
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

export interface CardIntroRestore_subtitle_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardIntroRestore_subtitle_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardIntroRestore_subtitle_TypographyBlock_settings | null;
}

export interface CardIntroRestore_subtitle_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardIntroRestore_subtitle_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardIntroRestore_subtitle_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardIntroRestore_subtitle_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardIntroRestore_subtitle_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardIntroRestore_subtitle_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface CardIntroRestore_subtitle_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardIntroRestore_subtitle_VideoBlock_mediaVideo_Video_title[];
  images: CardIntroRestore_subtitle_VideoBlock_mediaVideo_Video_images[];
  variant: CardIntroRestore_subtitle_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: CardIntroRestore_subtitle_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface CardIntroRestore_subtitle_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardIntroRestore_subtitle_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardIntroRestore_subtitle_VideoBlock_mediaVideo = CardIntroRestore_subtitle_VideoBlock_mediaVideo_Video | CardIntroRestore_subtitle_VideoBlock_mediaVideo_MuxVideo | CardIntroRestore_subtitle_VideoBlock_mediaVideo_YouTube;

export interface CardIntroRestore_subtitle_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroRestore_subtitle_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroRestore_subtitle_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroRestore_subtitle_VideoBlock_action = CardIntroRestore_subtitle_VideoBlock_action_NavigateToBlockAction | CardIntroRestore_subtitle_VideoBlock_action_LinkAction | CardIntroRestore_subtitle_VideoBlock_action_EmailAction;

export interface CardIntroRestore_subtitle_VideoBlock {
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
  mediaVideo: CardIntroRestore_subtitle_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardIntroRestore_subtitle_VideoBlock_action | null;
}

export interface CardIntroRestore_subtitle_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroRestore_subtitle_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroRestore_subtitle_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroRestore_subtitle_VideoTriggerBlock_triggerAction = CardIntroRestore_subtitle_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardIntroRestore_subtitle_VideoTriggerBlock_triggerAction_LinkAction | CardIntroRestore_subtitle_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardIntroRestore_subtitle_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardIntroRestore_subtitle_VideoTriggerBlock_triggerAction;
}

export type CardIntroRestore_subtitle = CardIntroRestore_subtitle_GridContainerBlock | CardIntroRestore_subtitle_ButtonBlock | CardIntroRestore_subtitle_CardBlock | CardIntroRestore_subtitle_IconBlock | CardIntroRestore_subtitle_ImageBlock | CardIntroRestore_subtitle_RadioOptionBlock | CardIntroRestore_subtitle_RadioQuestionBlock | CardIntroRestore_subtitle_SignUpBlock | CardIntroRestore_subtitle_SpacerBlock | CardIntroRestore_subtitle_StepBlock | CardIntroRestore_subtitle_TextResponseBlock | CardIntroRestore_subtitle_TypographyBlock | CardIntroRestore_subtitle_VideoBlock | CardIntroRestore_subtitle_VideoTriggerBlock;

export interface CardIntroRestore_title_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardIntroRestore_title_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroRestore_title_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroRestore_title_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroRestore_title_ButtonBlock_action = CardIntroRestore_title_ButtonBlock_action_NavigateToBlockAction | CardIntroRestore_title_ButtonBlock_action_LinkAction | CardIntroRestore_title_ButtonBlock_action_EmailAction;

export interface CardIntroRestore_title_ButtonBlock {
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
  action: CardIntroRestore_title_ButtonBlock_action | null;
}

export interface CardIntroRestore_title_CardBlock {
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

export interface CardIntroRestore_title_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardIntroRestore_title_ImageBlock {
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

export interface CardIntroRestore_title_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroRestore_title_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroRestore_title_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroRestore_title_RadioOptionBlock_action = CardIntroRestore_title_RadioOptionBlock_action_NavigateToBlockAction | CardIntroRestore_title_RadioOptionBlock_action_LinkAction | CardIntroRestore_title_RadioOptionBlock_action_EmailAction;

export interface CardIntroRestore_title_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardIntroRestore_title_RadioOptionBlock_action | null;
}

export interface CardIntroRestore_title_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardIntroRestore_title_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroRestore_title_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroRestore_title_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroRestore_title_SignUpBlock_action = CardIntroRestore_title_SignUpBlock_action_NavigateToBlockAction | CardIntroRestore_title_SignUpBlock_action_LinkAction | CardIntroRestore_title_SignUpBlock_action_EmailAction;

export interface CardIntroRestore_title_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardIntroRestore_title_SignUpBlock_action | null;
}

export interface CardIntroRestore_title_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface CardIntroRestore_title_StepBlock {
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

export interface CardIntroRestore_title_TextResponseBlock {
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

export interface CardIntroRestore_title_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardIntroRestore_title_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardIntroRestore_title_TypographyBlock_settings | null;
}

export interface CardIntroRestore_title_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardIntroRestore_title_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardIntroRestore_title_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardIntroRestore_title_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardIntroRestore_title_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardIntroRestore_title_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface CardIntroRestore_title_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardIntroRestore_title_VideoBlock_mediaVideo_Video_title[];
  images: CardIntroRestore_title_VideoBlock_mediaVideo_Video_images[];
  variant: CardIntroRestore_title_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: CardIntroRestore_title_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface CardIntroRestore_title_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardIntroRestore_title_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardIntroRestore_title_VideoBlock_mediaVideo = CardIntroRestore_title_VideoBlock_mediaVideo_Video | CardIntroRestore_title_VideoBlock_mediaVideo_MuxVideo | CardIntroRestore_title_VideoBlock_mediaVideo_YouTube;

export interface CardIntroRestore_title_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroRestore_title_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroRestore_title_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroRestore_title_VideoBlock_action = CardIntroRestore_title_VideoBlock_action_NavigateToBlockAction | CardIntroRestore_title_VideoBlock_action_LinkAction | CardIntroRestore_title_VideoBlock_action_EmailAction;

export interface CardIntroRestore_title_VideoBlock {
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
  mediaVideo: CardIntroRestore_title_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardIntroRestore_title_VideoBlock_action | null;
}

export interface CardIntroRestore_title_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroRestore_title_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroRestore_title_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroRestore_title_VideoTriggerBlock_triggerAction = CardIntroRestore_title_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardIntroRestore_title_VideoTriggerBlock_triggerAction_LinkAction | CardIntroRestore_title_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardIntroRestore_title_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardIntroRestore_title_VideoTriggerBlock_triggerAction;
}

export type CardIntroRestore_title = CardIntroRestore_title_GridContainerBlock | CardIntroRestore_title_ButtonBlock | CardIntroRestore_title_CardBlock | CardIntroRestore_title_IconBlock | CardIntroRestore_title_ImageBlock | CardIntroRestore_title_RadioOptionBlock | CardIntroRestore_title_RadioQuestionBlock | CardIntroRestore_title_SignUpBlock | CardIntroRestore_title_SpacerBlock | CardIntroRestore_title_StepBlock | CardIntroRestore_title_TextResponseBlock | CardIntroRestore_title_TypographyBlock | CardIntroRestore_title_VideoBlock | CardIntroRestore_title_VideoTriggerBlock;

export interface CardIntroRestore_body_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardIntroRestore_body_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroRestore_body_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroRestore_body_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroRestore_body_ButtonBlock_action = CardIntroRestore_body_ButtonBlock_action_NavigateToBlockAction | CardIntroRestore_body_ButtonBlock_action_LinkAction | CardIntroRestore_body_ButtonBlock_action_EmailAction;

export interface CardIntroRestore_body_ButtonBlock {
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
  action: CardIntroRestore_body_ButtonBlock_action | null;
}

export interface CardIntroRestore_body_CardBlock {
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

export interface CardIntroRestore_body_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardIntroRestore_body_ImageBlock {
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

export interface CardIntroRestore_body_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroRestore_body_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroRestore_body_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroRestore_body_RadioOptionBlock_action = CardIntroRestore_body_RadioOptionBlock_action_NavigateToBlockAction | CardIntroRestore_body_RadioOptionBlock_action_LinkAction | CardIntroRestore_body_RadioOptionBlock_action_EmailAction;

export interface CardIntroRestore_body_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardIntroRestore_body_RadioOptionBlock_action | null;
}

export interface CardIntroRestore_body_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardIntroRestore_body_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroRestore_body_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroRestore_body_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroRestore_body_SignUpBlock_action = CardIntroRestore_body_SignUpBlock_action_NavigateToBlockAction | CardIntroRestore_body_SignUpBlock_action_LinkAction | CardIntroRestore_body_SignUpBlock_action_EmailAction;

export interface CardIntroRestore_body_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardIntroRestore_body_SignUpBlock_action | null;
}

export interface CardIntroRestore_body_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface CardIntroRestore_body_StepBlock {
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

export interface CardIntroRestore_body_TextResponseBlock {
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

export interface CardIntroRestore_body_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardIntroRestore_body_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardIntroRestore_body_TypographyBlock_settings | null;
}

export interface CardIntroRestore_body_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardIntroRestore_body_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardIntroRestore_body_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardIntroRestore_body_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardIntroRestore_body_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardIntroRestore_body_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface CardIntroRestore_body_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardIntroRestore_body_VideoBlock_mediaVideo_Video_title[];
  images: CardIntroRestore_body_VideoBlock_mediaVideo_Video_images[];
  variant: CardIntroRestore_body_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: CardIntroRestore_body_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface CardIntroRestore_body_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardIntroRestore_body_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardIntroRestore_body_VideoBlock_mediaVideo = CardIntroRestore_body_VideoBlock_mediaVideo_Video | CardIntroRestore_body_VideoBlock_mediaVideo_MuxVideo | CardIntroRestore_body_VideoBlock_mediaVideo_YouTube;

export interface CardIntroRestore_body_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroRestore_body_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroRestore_body_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroRestore_body_VideoBlock_action = CardIntroRestore_body_VideoBlock_action_NavigateToBlockAction | CardIntroRestore_body_VideoBlock_action_LinkAction | CardIntroRestore_body_VideoBlock_action_EmailAction;

export interface CardIntroRestore_body_VideoBlock {
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
  mediaVideo: CardIntroRestore_body_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardIntroRestore_body_VideoBlock_action | null;
}

export interface CardIntroRestore_body_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroRestore_body_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroRestore_body_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroRestore_body_VideoTriggerBlock_triggerAction = CardIntroRestore_body_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardIntroRestore_body_VideoTriggerBlock_triggerAction_LinkAction | CardIntroRestore_body_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardIntroRestore_body_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardIntroRestore_body_VideoTriggerBlock_triggerAction;
}

export type CardIntroRestore_body = CardIntroRestore_body_GridContainerBlock | CardIntroRestore_body_ButtonBlock | CardIntroRestore_body_CardBlock | CardIntroRestore_body_IconBlock | CardIntroRestore_body_ImageBlock | CardIntroRestore_body_RadioOptionBlock | CardIntroRestore_body_RadioQuestionBlock | CardIntroRestore_body_SignUpBlock | CardIntroRestore_body_SpacerBlock | CardIntroRestore_body_StepBlock | CardIntroRestore_body_TextResponseBlock | CardIntroRestore_body_TypographyBlock | CardIntroRestore_body_VideoBlock | CardIntroRestore_body_VideoTriggerBlock;

export interface CardIntroRestore_button_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardIntroRestore_button_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroRestore_button_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroRestore_button_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroRestore_button_ButtonBlock_action = CardIntroRestore_button_ButtonBlock_action_NavigateToBlockAction | CardIntroRestore_button_ButtonBlock_action_LinkAction | CardIntroRestore_button_ButtonBlock_action_EmailAction;

export interface CardIntroRestore_button_ButtonBlock {
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
  action: CardIntroRestore_button_ButtonBlock_action | null;
}

export interface CardIntroRestore_button_CardBlock {
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

export interface CardIntroRestore_button_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardIntroRestore_button_ImageBlock {
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

export interface CardIntroRestore_button_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroRestore_button_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroRestore_button_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroRestore_button_RadioOptionBlock_action = CardIntroRestore_button_RadioOptionBlock_action_NavigateToBlockAction | CardIntroRestore_button_RadioOptionBlock_action_LinkAction | CardIntroRestore_button_RadioOptionBlock_action_EmailAction;

export interface CardIntroRestore_button_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardIntroRestore_button_RadioOptionBlock_action | null;
}

export interface CardIntroRestore_button_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardIntroRestore_button_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroRestore_button_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroRestore_button_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroRestore_button_SignUpBlock_action = CardIntroRestore_button_SignUpBlock_action_NavigateToBlockAction | CardIntroRestore_button_SignUpBlock_action_LinkAction | CardIntroRestore_button_SignUpBlock_action_EmailAction;

export interface CardIntroRestore_button_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardIntroRestore_button_SignUpBlock_action | null;
}

export interface CardIntroRestore_button_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface CardIntroRestore_button_StepBlock {
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

export interface CardIntroRestore_button_TextResponseBlock {
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

export interface CardIntroRestore_button_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardIntroRestore_button_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardIntroRestore_button_TypographyBlock_settings | null;
}

export interface CardIntroRestore_button_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardIntroRestore_button_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardIntroRestore_button_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardIntroRestore_button_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardIntroRestore_button_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardIntroRestore_button_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface CardIntroRestore_button_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardIntroRestore_button_VideoBlock_mediaVideo_Video_title[];
  images: CardIntroRestore_button_VideoBlock_mediaVideo_Video_images[];
  variant: CardIntroRestore_button_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: CardIntroRestore_button_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface CardIntroRestore_button_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardIntroRestore_button_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardIntroRestore_button_VideoBlock_mediaVideo = CardIntroRestore_button_VideoBlock_mediaVideo_Video | CardIntroRestore_button_VideoBlock_mediaVideo_MuxVideo | CardIntroRestore_button_VideoBlock_mediaVideo_YouTube;

export interface CardIntroRestore_button_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroRestore_button_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroRestore_button_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroRestore_button_VideoBlock_action = CardIntroRestore_button_VideoBlock_action_NavigateToBlockAction | CardIntroRestore_button_VideoBlock_action_LinkAction | CardIntroRestore_button_VideoBlock_action_EmailAction;

export interface CardIntroRestore_button_VideoBlock {
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
  mediaVideo: CardIntroRestore_button_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardIntroRestore_button_VideoBlock_action | null;
}

export interface CardIntroRestore_button_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroRestore_button_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroRestore_button_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroRestore_button_VideoTriggerBlock_triggerAction = CardIntroRestore_button_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardIntroRestore_button_VideoTriggerBlock_triggerAction_LinkAction | CardIntroRestore_button_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardIntroRestore_button_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardIntroRestore_button_VideoTriggerBlock_triggerAction;
}

export type CardIntroRestore_button = CardIntroRestore_button_GridContainerBlock | CardIntroRestore_button_ButtonBlock | CardIntroRestore_button_CardBlock | CardIntroRestore_button_IconBlock | CardIntroRestore_button_ImageBlock | CardIntroRestore_button_RadioOptionBlock | CardIntroRestore_button_RadioQuestionBlock | CardIntroRestore_button_SignUpBlock | CardIntroRestore_button_SpacerBlock | CardIntroRestore_button_StepBlock | CardIntroRestore_button_TextResponseBlock | CardIntroRestore_button_TypographyBlock | CardIntroRestore_button_VideoBlock | CardIntroRestore_button_VideoTriggerBlock;

export interface CardIntroRestore_startIcon_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardIntroRestore_startIcon_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroRestore_startIcon_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroRestore_startIcon_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroRestore_startIcon_ButtonBlock_action = CardIntroRestore_startIcon_ButtonBlock_action_NavigateToBlockAction | CardIntroRestore_startIcon_ButtonBlock_action_LinkAction | CardIntroRestore_startIcon_ButtonBlock_action_EmailAction;

export interface CardIntroRestore_startIcon_ButtonBlock {
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
  action: CardIntroRestore_startIcon_ButtonBlock_action | null;
}

export interface CardIntroRestore_startIcon_CardBlock {
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

export interface CardIntroRestore_startIcon_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardIntroRestore_startIcon_ImageBlock {
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

export interface CardIntroRestore_startIcon_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroRestore_startIcon_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroRestore_startIcon_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroRestore_startIcon_RadioOptionBlock_action = CardIntroRestore_startIcon_RadioOptionBlock_action_NavigateToBlockAction | CardIntroRestore_startIcon_RadioOptionBlock_action_LinkAction | CardIntroRestore_startIcon_RadioOptionBlock_action_EmailAction;

export interface CardIntroRestore_startIcon_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardIntroRestore_startIcon_RadioOptionBlock_action | null;
}

export interface CardIntroRestore_startIcon_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardIntroRestore_startIcon_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroRestore_startIcon_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroRestore_startIcon_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroRestore_startIcon_SignUpBlock_action = CardIntroRestore_startIcon_SignUpBlock_action_NavigateToBlockAction | CardIntroRestore_startIcon_SignUpBlock_action_LinkAction | CardIntroRestore_startIcon_SignUpBlock_action_EmailAction;

export interface CardIntroRestore_startIcon_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardIntroRestore_startIcon_SignUpBlock_action | null;
}

export interface CardIntroRestore_startIcon_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface CardIntroRestore_startIcon_StepBlock {
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

export interface CardIntroRestore_startIcon_TextResponseBlock {
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

export interface CardIntroRestore_startIcon_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardIntroRestore_startIcon_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardIntroRestore_startIcon_TypographyBlock_settings | null;
}

export interface CardIntroRestore_startIcon_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardIntroRestore_startIcon_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardIntroRestore_startIcon_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardIntroRestore_startIcon_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardIntroRestore_startIcon_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardIntroRestore_startIcon_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface CardIntroRestore_startIcon_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardIntroRestore_startIcon_VideoBlock_mediaVideo_Video_title[];
  images: CardIntroRestore_startIcon_VideoBlock_mediaVideo_Video_images[];
  variant: CardIntroRestore_startIcon_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: CardIntroRestore_startIcon_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface CardIntroRestore_startIcon_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardIntroRestore_startIcon_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardIntroRestore_startIcon_VideoBlock_mediaVideo = CardIntroRestore_startIcon_VideoBlock_mediaVideo_Video | CardIntroRestore_startIcon_VideoBlock_mediaVideo_MuxVideo | CardIntroRestore_startIcon_VideoBlock_mediaVideo_YouTube;

export interface CardIntroRestore_startIcon_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroRestore_startIcon_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroRestore_startIcon_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroRestore_startIcon_VideoBlock_action = CardIntroRestore_startIcon_VideoBlock_action_NavigateToBlockAction | CardIntroRestore_startIcon_VideoBlock_action_LinkAction | CardIntroRestore_startIcon_VideoBlock_action_EmailAction;

export interface CardIntroRestore_startIcon_VideoBlock {
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
  mediaVideo: CardIntroRestore_startIcon_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardIntroRestore_startIcon_VideoBlock_action | null;
}

export interface CardIntroRestore_startIcon_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroRestore_startIcon_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroRestore_startIcon_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroRestore_startIcon_VideoTriggerBlock_triggerAction = CardIntroRestore_startIcon_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardIntroRestore_startIcon_VideoTriggerBlock_triggerAction_LinkAction | CardIntroRestore_startIcon_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardIntroRestore_startIcon_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardIntroRestore_startIcon_VideoTriggerBlock_triggerAction;
}

export type CardIntroRestore_startIcon = CardIntroRestore_startIcon_GridContainerBlock | CardIntroRestore_startIcon_ButtonBlock | CardIntroRestore_startIcon_CardBlock | CardIntroRestore_startIcon_IconBlock | CardIntroRestore_startIcon_ImageBlock | CardIntroRestore_startIcon_RadioOptionBlock | CardIntroRestore_startIcon_RadioQuestionBlock | CardIntroRestore_startIcon_SignUpBlock | CardIntroRestore_startIcon_SpacerBlock | CardIntroRestore_startIcon_StepBlock | CardIntroRestore_startIcon_TextResponseBlock | CardIntroRestore_startIcon_TypographyBlock | CardIntroRestore_startIcon_VideoBlock | CardIntroRestore_startIcon_VideoTriggerBlock;

export interface CardIntroRestore_endIcon_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardIntroRestore_endIcon_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroRestore_endIcon_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroRestore_endIcon_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroRestore_endIcon_ButtonBlock_action = CardIntroRestore_endIcon_ButtonBlock_action_NavigateToBlockAction | CardIntroRestore_endIcon_ButtonBlock_action_LinkAction | CardIntroRestore_endIcon_ButtonBlock_action_EmailAction;

export interface CardIntroRestore_endIcon_ButtonBlock {
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
  action: CardIntroRestore_endIcon_ButtonBlock_action | null;
}

export interface CardIntroRestore_endIcon_CardBlock {
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

export interface CardIntroRestore_endIcon_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardIntroRestore_endIcon_ImageBlock {
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

export interface CardIntroRestore_endIcon_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroRestore_endIcon_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroRestore_endIcon_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroRestore_endIcon_RadioOptionBlock_action = CardIntroRestore_endIcon_RadioOptionBlock_action_NavigateToBlockAction | CardIntroRestore_endIcon_RadioOptionBlock_action_LinkAction | CardIntroRestore_endIcon_RadioOptionBlock_action_EmailAction;

export interface CardIntroRestore_endIcon_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardIntroRestore_endIcon_RadioOptionBlock_action | null;
}

export interface CardIntroRestore_endIcon_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardIntroRestore_endIcon_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroRestore_endIcon_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroRestore_endIcon_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroRestore_endIcon_SignUpBlock_action = CardIntroRestore_endIcon_SignUpBlock_action_NavigateToBlockAction | CardIntroRestore_endIcon_SignUpBlock_action_LinkAction | CardIntroRestore_endIcon_SignUpBlock_action_EmailAction;

export interface CardIntroRestore_endIcon_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardIntroRestore_endIcon_SignUpBlock_action | null;
}

export interface CardIntroRestore_endIcon_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface CardIntroRestore_endIcon_StepBlock {
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

export interface CardIntroRestore_endIcon_TextResponseBlock {
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

export interface CardIntroRestore_endIcon_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardIntroRestore_endIcon_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardIntroRestore_endIcon_TypographyBlock_settings | null;
}

export interface CardIntroRestore_endIcon_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardIntroRestore_endIcon_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardIntroRestore_endIcon_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardIntroRestore_endIcon_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardIntroRestore_endIcon_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardIntroRestore_endIcon_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface CardIntroRestore_endIcon_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardIntroRestore_endIcon_VideoBlock_mediaVideo_Video_title[];
  images: CardIntroRestore_endIcon_VideoBlock_mediaVideo_Video_images[];
  variant: CardIntroRestore_endIcon_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: CardIntroRestore_endIcon_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface CardIntroRestore_endIcon_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardIntroRestore_endIcon_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardIntroRestore_endIcon_VideoBlock_mediaVideo = CardIntroRestore_endIcon_VideoBlock_mediaVideo_Video | CardIntroRestore_endIcon_VideoBlock_mediaVideo_MuxVideo | CardIntroRestore_endIcon_VideoBlock_mediaVideo_YouTube;

export interface CardIntroRestore_endIcon_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroRestore_endIcon_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroRestore_endIcon_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroRestore_endIcon_VideoBlock_action = CardIntroRestore_endIcon_VideoBlock_action_NavigateToBlockAction | CardIntroRestore_endIcon_VideoBlock_action_LinkAction | CardIntroRestore_endIcon_VideoBlock_action_EmailAction;

export interface CardIntroRestore_endIcon_VideoBlock {
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
  mediaVideo: CardIntroRestore_endIcon_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardIntroRestore_endIcon_VideoBlock_action | null;
}

export interface CardIntroRestore_endIcon_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroRestore_endIcon_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroRestore_endIcon_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroRestore_endIcon_VideoTriggerBlock_triggerAction = CardIntroRestore_endIcon_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardIntroRestore_endIcon_VideoTriggerBlock_triggerAction_LinkAction | CardIntroRestore_endIcon_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardIntroRestore_endIcon_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardIntroRestore_endIcon_VideoTriggerBlock_triggerAction;
}

export type CardIntroRestore_endIcon = CardIntroRestore_endIcon_GridContainerBlock | CardIntroRestore_endIcon_ButtonBlock | CardIntroRestore_endIcon_CardBlock | CardIntroRestore_endIcon_IconBlock | CardIntroRestore_endIcon_ImageBlock | CardIntroRestore_endIcon_RadioOptionBlock | CardIntroRestore_endIcon_RadioQuestionBlock | CardIntroRestore_endIcon_SignUpBlock | CardIntroRestore_endIcon_SpacerBlock | CardIntroRestore_endIcon_StepBlock | CardIntroRestore_endIcon_TextResponseBlock | CardIntroRestore_endIcon_TypographyBlock | CardIntroRestore_endIcon_VideoBlock | CardIntroRestore_endIcon_VideoTriggerBlock;

export interface CardIntroRestore_video_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardIntroRestore_video_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroRestore_video_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroRestore_video_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroRestore_video_ButtonBlock_action = CardIntroRestore_video_ButtonBlock_action_NavigateToBlockAction | CardIntroRestore_video_ButtonBlock_action_LinkAction | CardIntroRestore_video_ButtonBlock_action_EmailAction;

export interface CardIntroRestore_video_ButtonBlock {
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
  action: CardIntroRestore_video_ButtonBlock_action | null;
}

export interface CardIntroRestore_video_CardBlock {
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

export interface CardIntroRestore_video_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardIntroRestore_video_ImageBlock {
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

export interface CardIntroRestore_video_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroRestore_video_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroRestore_video_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroRestore_video_RadioOptionBlock_action = CardIntroRestore_video_RadioOptionBlock_action_NavigateToBlockAction | CardIntroRestore_video_RadioOptionBlock_action_LinkAction | CardIntroRestore_video_RadioOptionBlock_action_EmailAction;

export interface CardIntroRestore_video_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardIntroRestore_video_RadioOptionBlock_action | null;
}

export interface CardIntroRestore_video_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardIntroRestore_video_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroRestore_video_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroRestore_video_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroRestore_video_SignUpBlock_action = CardIntroRestore_video_SignUpBlock_action_NavigateToBlockAction | CardIntroRestore_video_SignUpBlock_action_LinkAction | CardIntroRestore_video_SignUpBlock_action_EmailAction;

export interface CardIntroRestore_video_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardIntroRestore_video_SignUpBlock_action | null;
}

export interface CardIntroRestore_video_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface CardIntroRestore_video_StepBlock {
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

export interface CardIntroRestore_video_TextResponseBlock {
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

export interface CardIntroRestore_video_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardIntroRestore_video_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardIntroRestore_video_TypographyBlock_settings | null;
}

export interface CardIntroRestore_video_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardIntroRestore_video_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardIntroRestore_video_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardIntroRestore_video_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardIntroRestore_video_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardIntroRestore_video_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface CardIntroRestore_video_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardIntroRestore_video_VideoBlock_mediaVideo_Video_title[];
  images: CardIntroRestore_video_VideoBlock_mediaVideo_Video_images[];
  variant: CardIntroRestore_video_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: CardIntroRestore_video_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface CardIntroRestore_video_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardIntroRestore_video_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardIntroRestore_video_VideoBlock_mediaVideo = CardIntroRestore_video_VideoBlock_mediaVideo_Video | CardIntroRestore_video_VideoBlock_mediaVideo_MuxVideo | CardIntroRestore_video_VideoBlock_mediaVideo_YouTube;

export interface CardIntroRestore_video_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroRestore_video_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroRestore_video_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroRestore_video_VideoBlock_action = CardIntroRestore_video_VideoBlock_action_NavigateToBlockAction | CardIntroRestore_video_VideoBlock_action_LinkAction | CardIntroRestore_video_VideoBlock_action_EmailAction;

export interface CardIntroRestore_video_VideoBlock {
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
  mediaVideo: CardIntroRestore_video_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardIntroRestore_video_VideoBlock_action | null;
}

export interface CardIntroRestore_video_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroRestore_video_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroRestore_video_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroRestore_video_VideoTriggerBlock_triggerAction = CardIntroRestore_video_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardIntroRestore_video_VideoTriggerBlock_triggerAction_LinkAction | CardIntroRestore_video_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardIntroRestore_video_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardIntroRestore_video_VideoTriggerBlock_triggerAction;
}

export type CardIntroRestore_video = CardIntroRestore_video_GridContainerBlock | CardIntroRestore_video_ButtonBlock | CardIntroRestore_video_CardBlock | CardIntroRestore_video_IconBlock | CardIntroRestore_video_ImageBlock | CardIntroRestore_video_RadioOptionBlock | CardIntroRestore_video_RadioQuestionBlock | CardIntroRestore_video_SignUpBlock | CardIntroRestore_video_SpacerBlock | CardIntroRestore_video_StepBlock | CardIntroRestore_video_TextResponseBlock | CardIntroRestore_video_TypographyBlock | CardIntroRestore_video_VideoBlock | CardIntroRestore_video_VideoTriggerBlock;

export interface CardIntroRestore {
  /**
   * blockRestore is used for redo/undo
   */
  subtitle: CardIntroRestore_subtitle[];
  /**
   * blockRestore is used for redo/undo
   */
  title: CardIntroRestore_title[];
  /**
   * blockRestore is used for redo/undo
   */
  body: CardIntroRestore_body[];
  /**
   * blockRestore is used for redo/undo
   */
  button: CardIntroRestore_button[];
  /**
   * blockRestore is used for redo/undo
   */
  startIcon: CardIntroRestore_startIcon[];
  /**
   * blockRestore is used for redo/undo
   */
  endIcon: CardIntroRestore_endIcon[];
  /**
   * blockRestore is used for redo/undo
   */
  video: CardIntroRestore_video[];
}

export interface CardIntroRestoreVariables {
  subtitleId: string;
  titleId: string;
  bodyId: string;
  buttonId: string;
  startIconId: string;
  endIconId: string;
  videoId: string;
}

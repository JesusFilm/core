/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CardBlockUpdateInput, ButtonVariant, ButtonColor, ButtonSize, ButtonAlignment, ThemeMode, ThemeName, IconName, IconSize, IconColor, TextResponseType, TypographyAlign, TypographyColor, TypographyVariant, VideoBlockSource, VideoBlockObjectFit } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CardCtaRestore
// ====================================================

export interface CardCtaRestore_imageRestore_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardCtaRestore_imageRestore_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_imageRestore_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_imageRestore_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_imageRestore_ButtonBlock_action = CardCtaRestore_imageRestore_ButtonBlock_action_NavigateToBlockAction | CardCtaRestore_imageRestore_ButtonBlock_action_LinkAction | CardCtaRestore_imageRestore_ButtonBlock_action_EmailAction;

export interface CardCtaRestore_imageRestore_ButtonBlock_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface CardCtaRestore_imageRestore_ButtonBlock {
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
  action: CardCtaRestore_imageRestore_ButtonBlock_action | null;
  settings: CardCtaRestore_imageRestore_ButtonBlock_settings | null;
}

export interface CardCtaRestore_imageRestore_CardBlock {
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

export interface CardCtaRestore_imageRestore_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardCtaRestore_imageRestore_ImageBlock {
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

export interface CardCtaRestore_imageRestore_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_imageRestore_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_imageRestore_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_imageRestore_RadioOptionBlock_action = CardCtaRestore_imageRestore_RadioOptionBlock_action_NavigateToBlockAction | CardCtaRestore_imageRestore_RadioOptionBlock_action_LinkAction | CardCtaRestore_imageRestore_RadioOptionBlock_action_EmailAction;

export interface CardCtaRestore_imageRestore_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardCtaRestore_imageRestore_RadioOptionBlock_action | null;
  pollOptionImageBlockId: string | null;
}

export interface CardCtaRestore_imageRestore_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface CardCtaRestore_imageRestore_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_imageRestore_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_imageRestore_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_imageRestore_SignUpBlock_action = CardCtaRestore_imageRestore_SignUpBlock_action_NavigateToBlockAction | CardCtaRestore_imageRestore_SignUpBlock_action_LinkAction | CardCtaRestore_imageRestore_SignUpBlock_action_EmailAction;

export interface CardCtaRestore_imageRestore_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardCtaRestore_imageRestore_SignUpBlock_action | null;
}

export interface CardCtaRestore_imageRestore_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface CardCtaRestore_imageRestore_StepBlock {
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

export interface CardCtaRestore_imageRestore_TextResponseBlock {
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

export interface CardCtaRestore_imageRestore_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardCtaRestore_imageRestore_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardCtaRestore_imageRestore_TypographyBlock_settings | null;
}

export interface CardCtaRestore_imageRestore_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardCtaRestore_imageRestore_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardCtaRestore_imageRestore_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardCtaRestore_imageRestore_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardCtaRestore_imageRestore_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardCtaRestore_imageRestore_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface CardCtaRestore_imageRestore_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardCtaRestore_imageRestore_VideoBlock_mediaVideo_Video_title[];
  images: CardCtaRestore_imageRestore_VideoBlock_mediaVideo_Video_images[];
  variant: CardCtaRestore_imageRestore_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: CardCtaRestore_imageRestore_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface CardCtaRestore_imageRestore_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardCtaRestore_imageRestore_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardCtaRestore_imageRestore_VideoBlock_mediaVideo = CardCtaRestore_imageRestore_VideoBlock_mediaVideo_Video | CardCtaRestore_imageRestore_VideoBlock_mediaVideo_MuxVideo | CardCtaRestore_imageRestore_VideoBlock_mediaVideo_YouTube;

export interface CardCtaRestore_imageRestore_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_imageRestore_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_imageRestore_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_imageRestore_VideoBlock_action = CardCtaRestore_imageRestore_VideoBlock_action_NavigateToBlockAction | CardCtaRestore_imageRestore_VideoBlock_action_LinkAction | CardCtaRestore_imageRestore_VideoBlock_action_EmailAction;

export interface CardCtaRestore_imageRestore_VideoBlock {
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
  mediaVideo: CardCtaRestore_imageRestore_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardCtaRestore_imageRestore_VideoBlock_action | null;
}

export interface CardCtaRestore_imageRestore_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_imageRestore_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_imageRestore_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_imageRestore_VideoTriggerBlock_triggerAction = CardCtaRestore_imageRestore_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardCtaRestore_imageRestore_VideoTriggerBlock_triggerAction_LinkAction | CardCtaRestore_imageRestore_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardCtaRestore_imageRestore_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardCtaRestore_imageRestore_VideoTriggerBlock_triggerAction;
}

export type CardCtaRestore_imageRestore = CardCtaRestore_imageRestore_GridContainerBlock | CardCtaRestore_imageRestore_ButtonBlock | CardCtaRestore_imageRestore_CardBlock | CardCtaRestore_imageRestore_IconBlock | CardCtaRestore_imageRestore_ImageBlock | CardCtaRestore_imageRestore_RadioOptionBlock | CardCtaRestore_imageRestore_RadioQuestionBlock | CardCtaRestore_imageRestore_SignUpBlock | CardCtaRestore_imageRestore_SpacerBlock | CardCtaRestore_imageRestore_StepBlock | CardCtaRestore_imageRestore_TextResponseBlock | CardCtaRestore_imageRestore_TypographyBlock | CardCtaRestore_imageRestore_VideoBlock | CardCtaRestore_imageRestore_VideoTriggerBlock;

export interface CardCtaRestore_subtitleRestore_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardCtaRestore_subtitleRestore_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_subtitleRestore_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_subtitleRestore_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_subtitleRestore_ButtonBlock_action = CardCtaRestore_subtitleRestore_ButtonBlock_action_NavigateToBlockAction | CardCtaRestore_subtitleRestore_ButtonBlock_action_LinkAction | CardCtaRestore_subtitleRestore_ButtonBlock_action_EmailAction;

export interface CardCtaRestore_subtitleRestore_ButtonBlock_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface CardCtaRestore_subtitleRestore_ButtonBlock {
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
  action: CardCtaRestore_subtitleRestore_ButtonBlock_action | null;
  settings: CardCtaRestore_subtitleRestore_ButtonBlock_settings | null;
}

export interface CardCtaRestore_subtitleRestore_CardBlock {
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

export interface CardCtaRestore_subtitleRestore_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardCtaRestore_subtitleRestore_ImageBlock {
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

export interface CardCtaRestore_subtitleRestore_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_subtitleRestore_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_subtitleRestore_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_subtitleRestore_RadioOptionBlock_action = CardCtaRestore_subtitleRestore_RadioOptionBlock_action_NavigateToBlockAction | CardCtaRestore_subtitleRestore_RadioOptionBlock_action_LinkAction | CardCtaRestore_subtitleRestore_RadioOptionBlock_action_EmailAction;

export interface CardCtaRestore_subtitleRestore_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardCtaRestore_subtitleRestore_RadioOptionBlock_action | null;
  pollOptionImageBlockId: string | null;
}

export interface CardCtaRestore_subtitleRestore_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface CardCtaRestore_subtitleRestore_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_subtitleRestore_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_subtitleRestore_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_subtitleRestore_SignUpBlock_action = CardCtaRestore_subtitleRestore_SignUpBlock_action_NavigateToBlockAction | CardCtaRestore_subtitleRestore_SignUpBlock_action_LinkAction | CardCtaRestore_subtitleRestore_SignUpBlock_action_EmailAction;

export interface CardCtaRestore_subtitleRestore_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardCtaRestore_subtitleRestore_SignUpBlock_action | null;
}

export interface CardCtaRestore_subtitleRestore_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface CardCtaRestore_subtitleRestore_StepBlock {
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

export interface CardCtaRestore_subtitleRestore_TextResponseBlock {
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

export interface CardCtaRestore_subtitleRestore_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardCtaRestore_subtitleRestore_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardCtaRestore_subtitleRestore_TypographyBlock_settings | null;
}

export interface CardCtaRestore_subtitleRestore_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardCtaRestore_subtitleRestore_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardCtaRestore_subtitleRestore_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardCtaRestore_subtitleRestore_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardCtaRestore_subtitleRestore_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardCtaRestore_subtitleRestore_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface CardCtaRestore_subtitleRestore_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardCtaRestore_subtitleRestore_VideoBlock_mediaVideo_Video_title[];
  images: CardCtaRestore_subtitleRestore_VideoBlock_mediaVideo_Video_images[];
  variant: CardCtaRestore_subtitleRestore_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: CardCtaRestore_subtitleRestore_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface CardCtaRestore_subtitleRestore_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardCtaRestore_subtitleRestore_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardCtaRestore_subtitleRestore_VideoBlock_mediaVideo = CardCtaRestore_subtitleRestore_VideoBlock_mediaVideo_Video | CardCtaRestore_subtitleRestore_VideoBlock_mediaVideo_MuxVideo | CardCtaRestore_subtitleRestore_VideoBlock_mediaVideo_YouTube;

export interface CardCtaRestore_subtitleRestore_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_subtitleRestore_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_subtitleRestore_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_subtitleRestore_VideoBlock_action = CardCtaRestore_subtitleRestore_VideoBlock_action_NavigateToBlockAction | CardCtaRestore_subtitleRestore_VideoBlock_action_LinkAction | CardCtaRestore_subtitleRestore_VideoBlock_action_EmailAction;

export interface CardCtaRestore_subtitleRestore_VideoBlock {
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
  mediaVideo: CardCtaRestore_subtitleRestore_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardCtaRestore_subtitleRestore_VideoBlock_action | null;
}

export interface CardCtaRestore_subtitleRestore_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_subtitleRestore_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_subtitleRestore_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_subtitleRestore_VideoTriggerBlock_triggerAction = CardCtaRestore_subtitleRestore_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardCtaRestore_subtitleRestore_VideoTriggerBlock_triggerAction_LinkAction | CardCtaRestore_subtitleRestore_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardCtaRestore_subtitleRestore_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardCtaRestore_subtitleRestore_VideoTriggerBlock_triggerAction;
}

export type CardCtaRestore_subtitleRestore = CardCtaRestore_subtitleRestore_GridContainerBlock | CardCtaRestore_subtitleRestore_ButtonBlock | CardCtaRestore_subtitleRestore_CardBlock | CardCtaRestore_subtitleRestore_IconBlock | CardCtaRestore_subtitleRestore_ImageBlock | CardCtaRestore_subtitleRestore_RadioOptionBlock | CardCtaRestore_subtitleRestore_RadioQuestionBlock | CardCtaRestore_subtitleRestore_SignUpBlock | CardCtaRestore_subtitleRestore_SpacerBlock | CardCtaRestore_subtitleRestore_StepBlock | CardCtaRestore_subtitleRestore_TextResponseBlock | CardCtaRestore_subtitleRestore_TypographyBlock | CardCtaRestore_subtitleRestore_VideoBlock | CardCtaRestore_subtitleRestore_VideoTriggerBlock;

export interface CardCtaRestore_titleRestore_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardCtaRestore_titleRestore_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_titleRestore_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_titleRestore_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_titleRestore_ButtonBlock_action = CardCtaRestore_titleRestore_ButtonBlock_action_NavigateToBlockAction | CardCtaRestore_titleRestore_ButtonBlock_action_LinkAction | CardCtaRestore_titleRestore_ButtonBlock_action_EmailAction;

export interface CardCtaRestore_titleRestore_ButtonBlock_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface CardCtaRestore_titleRestore_ButtonBlock {
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
  action: CardCtaRestore_titleRestore_ButtonBlock_action | null;
  settings: CardCtaRestore_titleRestore_ButtonBlock_settings | null;
}

export interface CardCtaRestore_titleRestore_CardBlock {
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

export interface CardCtaRestore_titleRestore_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardCtaRestore_titleRestore_ImageBlock {
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

export interface CardCtaRestore_titleRestore_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_titleRestore_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_titleRestore_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_titleRestore_RadioOptionBlock_action = CardCtaRestore_titleRestore_RadioOptionBlock_action_NavigateToBlockAction | CardCtaRestore_titleRestore_RadioOptionBlock_action_LinkAction | CardCtaRestore_titleRestore_RadioOptionBlock_action_EmailAction;

export interface CardCtaRestore_titleRestore_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardCtaRestore_titleRestore_RadioOptionBlock_action | null;
  pollOptionImageBlockId: string | null;
}

export interface CardCtaRestore_titleRestore_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface CardCtaRestore_titleRestore_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_titleRestore_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_titleRestore_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_titleRestore_SignUpBlock_action = CardCtaRestore_titleRestore_SignUpBlock_action_NavigateToBlockAction | CardCtaRestore_titleRestore_SignUpBlock_action_LinkAction | CardCtaRestore_titleRestore_SignUpBlock_action_EmailAction;

export interface CardCtaRestore_titleRestore_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardCtaRestore_titleRestore_SignUpBlock_action | null;
}

export interface CardCtaRestore_titleRestore_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface CardCtaRestore_titleRestore_StepBlock {
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

export interface CardCtaRestore_titleRestore_TextResponseBlock {
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

export interface CardCtaRestore_titleRestore_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardCtaRestore_titleRestore_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardCtaRestore_titleRestore_TypographyBlock_settings | null;
}

export interface CardCtaRestore_titleRestore_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardCtaRestore_titleRestore_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardCtaRestore_titleRestore_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardCtaRestore_titleRestore_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardCtaRestore_titleRestore_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardCtaRestore_titleRestore_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface CardCtaRestore_titleRestore_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardCtaRestore_titleRestore_VideoBlock_mediaVideo_Video_title[];
  images: CardCtaRestore_titleRestore_VideoBlock_mediaVideo_Video_images[];
  variant: CardCtaRestore_titleRestore_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: CardCtaRestore_titleRestore_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface CardCtaRestore_titleRestore_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardCtaRestore_titleRestore_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardCtaRestore_titleRestore_VideoBlock_mediaVideo = CardCtaRestore_titleRestore_VideoBlock_mediaVideo_Video | CardCtaRestore_titleRestore_VideoBlock_mediaVideo_MuxVideo | CardCtaRestore_titleRestore_VideoBlock_mediaVideo_YouTube;

export interface CardCtaRestore_titleRestore_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_titleRestore_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_titleRestore_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_titleRestore_VideoBlock_action = CardCtaRestore_titleRestore_VideoBlock_action_NavigateToBlockAction | CardCtaRestore_titleRestore_VideoBlock_action_LinkAction | CardCtaRestore_titleRestore_VideoBlock_action_EmailAction;

export interface CardCtaRestore_titleRestore_VideoBlock {
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
  mediaVideo: CardCtaRestore_titleRestore_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardCtaRestore_titleRestore_VideoBlock_action | null;
}

export interface CardCtaRestore_titleRestore_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_titleRestore_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_titleRestore_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_titleRestore_VideoTriggerBlock_triggerAction = CardCtaRestore_titleRestore_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardCtaRestore_titleRestore_VideoTriggerBlock_triggerAction_LinkAction | CardCtaRestore_titleRestore_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardCtaRestore_titleRestore_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardCtaRestore_titleRestore_VideoTriggerBlock_triggerAction;
}

export type CardCtaRestore_titleRestore = CardCtaRestore_titleRestore_GridContainerBlock | CardCtaRestore_titleRestore_ButtonBlock | CardCtaRestore_titleRestore_CardBlock | CardCtaRestore_titleRestore_IconBlock | CardCtaRestore_titleRestore_ImageBlock | CardCtaRestore_titleRestore_RadioOptionBlock | CardCtaRestore_titleRestore_RadioQuestionBlock | CardCtaRestore_titleRestore_SignUpBlock | CardCtaRestore_titleRestore_SpacerBlock | CardCtaRestore_titleRestore_StepBlock | CardCtaRestore_titleRestore_TextResponseBlock | CardCtaRestore_titleRestore_TypographyBlock | CardCtaRestore_titleRestore_VideoBlock | CardCtaRestore_titleRestore_VideoTriggerBlock;

export interface CardCtaRestore_button1Restore_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardCtaRestore_button1Restore_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_button1Restore_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_button1Restore_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_button1Restore_ButtonBlock_action = CardCtaRestore_button1Restore_ButtonBlock_action_NavigateToBlockAction | CardCtaRestore_button1Restore_ButtonBlock_action_LinkAction | CardCtaRestore_button1Restore_ButtonBlock_action_EmailAction;

export interface CardCtaRestore_button1Restore_ButtonBlock_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface CardCtaRestore_button1Restore_ButtonBlock {
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
  action: CardCtaRestore_button1Restore_ButtonBlock_action | null;
  settings: CardCtaRestore_button1Restore_ButtonBlock_settings | null;
}

export interface CardCtaRestore_button1Restore_CardBlock {
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

export interface CardCtaRestore_button1Restore_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardCtaRestore_button1Restore_ImageBlock {
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

export interface CardCtaRestore_button1Restore_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_button1Restore_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_button1Restore_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_button1Restore_RadioOptionBlock_action = CardCtaRestore_button1Restore_RadioOptionBlock_action_NavigateToBlockAction | CardCtaRestore_button1Restore_RadioOptionBlock_action_LinkAction | CardCtaRestore_button1Restore_RadioOptionBlock_action_EmailAction;

export interface CardCtaRestore_button1Restore_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardCtaRestore_button1Restore_RadioOptionBlock_action | null;
  pollOptionImageBlockId: string | null;
}

export interface CardCtaRestore_button1Restore_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface CardCtaRestore_button1Restore_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_button1Restore_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_button1Restore_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_button1Restore_SignUpBlock_action = CardCtaRestore_button1Restore_SignUpBlock_action_NavigateToBlockAction | CardCtaRestore_button1Restore_SignUpBlock_action_LinkAction | CardCtaRestore_button1Restore_SignUpBlock_action_EmailAction;

export interface CardCtaRestore_button1Restore_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardCtaRestore_button1Restore_SignUpBlock_action | null;
}

export interface CardCtaRestore_button1Restore_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface CardCtaRestore_button1Restore_StepBlock {
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

export interface CardCtaRestore_button1Restore_TextResponseBlock {
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

export interface CardCtaRestore_button1Restore_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardCtaRestore_button1Restore_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardCtaRestore_button1Restore_TypographyBlock_settings | null;
}

export interface CardCtaRestore_button1Restore_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardCtaRestore_button1Restore_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardCtaRestore_button1Restore_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardCtaRestore_button1Restore_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardCtaRestore_button1Restore_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardCtaRestore_button1Restore_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface CardCtaRestore_button1Restore_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardCtaRestore_button1Restore_VideoBlock_mediaVideo_Video_title[];
  images: CardCtaRestore_button1Restore_VideoBlock_mediaVideo_Video_images[];
  variant: CardCtaRestore_button1Restore_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: CardCtaRestore_button1Restore_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface CardCtaRestore_button1Restore_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardCtaRestore_button1Restore_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardCtaRestore_button1Restore_VideoBlock_mediaVideo = CardCtaRestore_button1Restore_VideoBlock_mediaVideo_Video | CardCtaRestore_button1Restore_VideoBlock_mediaVideo_MuxVideo | CardCtaRestore_button1Restore_VideoBlock_mediaVideo_YouTube;

export interface CardCtaRestore_button1Restore_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_button1Restore_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_button1Restore_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_button1Restore_VideoBlock_action = CardCtaRestore_button1Restore_VideoBlock_action_NavigateToBlockAction | CardCtaRestore_button1Restore_VideoBlock_action_LinkAction | CardCtaRestore_button1Restore_VideoBlock_action_EmailAction;

export interface CardCtaRestore_button1Restore_VideoBlock {
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
  mediaVideo: CardCtaRestore_button1Restore_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardCtaRestore_button1Restore_VideoBlock_action | null;
}

export interface CardCtaRestore_button1Restore_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_button1Restore_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_button1Restore_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_button1Restore_VideoTriggerBlock_triggerAction = CardCtaRestore_button1Restore_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardCtaRestore_button1Restore_VideoTriggerBlock_triggerAction_LinkAction | CardCtaRestore_button1Restore_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardCtaRestore_button1Restore_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardCtaRestore_button1Restore_VideoTriggerBlock_triggerAction;
}

export type CardCtaRestore_button1Restore = CardCtaRestore_button1Restore_GridContainerBlock | CardCtaRestore_button1Restore_ButtonBlock | CardCtaRestore_button1Restore_CardBlock | CardCtaRestore_button1Restore_IconBlock | CardCtaRestore_button1Restore_ImageBlock | CardCtaRestore_button1Restore_RadioOptionBlock | CardCtaRestore_button1Restore_RadioQuestionBlock | CardCtaRestore_button1Restore_SignUpBlock | CardCtaRestore_button1Restore_SpacerBlock | CardCtaRestore_button1Restore_StepBlock | CardCtaRestore_button1Restore_TextResponseBlock | CardCtaRestore_button1Restore_TypographyBlock | CardCtaRestore_button1Restore_VideoBlock | CardCtaRestore_button1Restore_VideoTriggerBlock;

export interface CardCtaRestore_startIcon1Restore_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardCtaRestore_startIcon1Restore_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_startIcon1Restore_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_startIcon1Restore_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_startIcon1Restore_ButtonBlock_action = CardCtaRestore_startIcon1Restore_ButtonBlock_action_NavigateToBlockAction | CardCtaRestore_startIcon1Restore_ButtonBlock_action_LinkAction | CardCtaRestore_startIcon1Restore_ButtonBlock_action_EmailAction;

export interface CardCtaRestore_startIcon1Restore_ButtonBlock_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface CardCtaRestore_startIcon1Restore_ButtonBlock {
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
  action: CardCtaRestore_startIcon1Restore_ButtonBlock_action | null;
  settings: CardCtaRestore_startIcon1Restore_ButtonBlock_settings | null;
}

export interface CardCtaRestore_startIcon1Restore_CardBlock {
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

export interface CardCtaRestore_startIcon1Restore_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardCtaRestore_startIcon1Restore_ImageBlock {
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

export interface CardCtaRestore_startIcon1Restore_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_startIcon1Restore_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_startIcon1Restore_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_startIcon1Restore_RadioOptionBlock_action = CardCtaRestore_startIcon1Restore_RadioOptionBlock_action_NavigateToBlockAction | CardCtaRestore_startIcon1Restore_RadioOptionBlock_action_LinkAction | CardCtaRestore_startIcon1Restore_RadioOptionBlock_action_EmailAction;

export interface CardCtaRestore_startIcon1Restore_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardCtaRestore_startIcon1Restore_RadioOptionBlock_action | null;
  pollOptionImageBlockId: string | null;
}

export interface CardCtaRestore_startIcon1Restore_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface CardCtaRestore_startIcon1Restore_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_startIcon1Restore_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_startIcon1Restore_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_startIcon1Restore_SignUpBlock_action = CardCtaRestore_startIcon1Restore_SignUpBlock_action_NavigateToBlockAction | CardCtaRestore_startIcon1Restore_SignUpBlock_action_LinkAction | CardCtaRestore_startIcon1Restore_SignUpBlock_action_EmailAction;

export interface CardCtaRestore_startIcon1Restore_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardCtaRestore_startIcon1Restore_SignUpBlock_action | null;
}

export interface CardCtaRestore_startIcon1Restore_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface CardCtaRestore_startIcon1Restore_StepBlock {
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

export interface CardCtaRestore_startIcon1Restore_TextResponseBlock {
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

export interface CardCtaRestore_startIcon1Restore_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardCtaRestore_startIcon1Restore_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardCtaRestore_startIcon1Restore_TypographyBlock_settings | null;
}

export interface CardCtaRestore_startIcon1Restore_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardCtaRestore_startIcon1Restore_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardCtaRestore_startIcon1Restore_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardCtaRestore_startIcon1Restore_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardCtaRestore_startIcon1Restore_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardCtaRestore_startIcon1Restore_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface CardCtaRestore_startIcon1Restore_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardCtaRestore_startIcon1Restore_VideoBlock_mediaVideo_Video_title[];
  images: CardCtaRestore_startIcon1Restore_VideoBlock_mediaVideo_Video_images[];
  variant: CardCtaRestore_startIcon1Restore_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: CardCtaRestore_startIcon1Restore_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface CardCtaRestore_startIcon1Restore_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardCtaRestore_startIcon1Restore_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardCtaRestore_startIcon1Restore_VideoBlock_mediaVideo = CardCtaRestore_startIcon1Restore_VideoBlock_mediaVideo_Video | CardCtaRestore_startIcon1Restore_VideoBlock_mediaVideo_MuxVideo | CardCtaRestore_startIcon1Restore_VideoBlock_mediaVideo_YouTube;

export interface CardCtaRestore_startIcon1Restore_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_startIcon1Restore_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_startIcon1Restore_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_startIcon1Restore_VideoBlock_action = CardCtaRestore_startIcon1Restore_VideoBlock_action_NavigateToBlockAction | CardCtaRestore_startIcon1Restore_VideoBlock_action_LinkAction | CardCtaRestore_startIcon1Restore_VideoBlock_action_EmailAction;

export interface CardCtaRestore_startIcon1Restore_VideoBlock {
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
  mediaVideo: CardCtaRestore_startIcon1Restore_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardCtaRestore_startIcon1Restore_VideoBlock_action | null;
}

export interface CardCtaRestore_startIcon1Restore_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_startIcon1Restore_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_startIcon1Restore_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_startIcon1Restore_VideoTriggerBlock_triggerAction = CardCtaRestore_startIcon1Restore_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardCtaRestore_startIcon1Restore_VideoTriggerBlock_triggerAction_LinkAction | CardCtaRestore_startIcon1Restore_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardCtaRestore_startIcon1Restore_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardCtaRestore_startIcon1Restore_VideoTriggerBlock_triggerAction;
}

export type CardCtaRestore_startIcon1Restore = CardCtaRestore_startIcon1Restore_GridContainerBlock | CardCtaRestore_startIcon1Restore_ButtonBlock | CardCtaRestore_startIcon1Restore_CardBlock | CardCtaRestore_startIcon1Restore_IconBlock | CardCtaRestore_startIcon1Restore_ImageBlock | CardCtaRestore_startIcon1Restore_RadioOptionBlock | CardCtaRestore_startIcon1Restore_RadioQuestionBlock | CardCtaRestore_startIcon1Restore_SignUpBlock | CardCtaRestore_startIcon1Restore_SpacerBlock | CardCtaRestore_startIcon1Restore_StepBlock | CardCtaRestore_startIcon1Restore_TextResponseBlock | CardCtaRestore_startIcon1Restore_TypographyBlock | CardCtaRestore_startIcon1Restore_VideoBlock | CardCtaRestore_startIcon1Restore_VideoTriggerBlock;

export interface CardCtaRestore_endIcon1Restore_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardCtaRestore_endIcon1Restore_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_endIcon1Restore_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_endIcon1Restore_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_endIcon1Restore_ButtonBlock_action = CardCtaRestore_endIcon1Restore_ButtonBlock_action_NavigateToBlockAction | CardCtaRestore_endIcon1Restore_ButtonBlock_action_LinkAction | CardCtaRestore_endIcon1Restore_ButtonBlock_action_EmailAction;

export interface CardCtaRestore_endIcon1Restore_ButtonBlock_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface CardCtaRestore_endIcon1Restore_ButtonBlock {
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
  action: CardCtaRestore_endIcon1Restore_ButtonBlock_action | null;
  settings: CardCtaRestore_endIcon1Restore_ButtonBlock_settings | null;
}

export interface CardCtaRestore_endIcon1Restore_CardBlock {
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

export interface CardCtaRestore_endIcon1Restore_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardCtaRestore_endIcon1Restore_ImageBlock {
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

export interface CardCtaRestore_endIcon1Restore_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_endIcon1Restore_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_endIcon1Restore_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_endIcon1Restore_RadioOptionBlock_action = CardCtaRestore_endIcon1Restore_RadioOptionBlock_action_NavigateToBlockAction | CardCtaRestore_endIcon1Restore_RadioOptionBlock_action_LinkAction | CardCtaRestore_endIcon1Restore_RadioOptionBlock_action_EmailAction;

export interface CardCtaRestore_endIcon1Restore_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardCtaRestore_endIcon1Restore_RadioOptionBlock_action | null;
  pollOptionImageBlockId: string | null;
}

export interface CardCtaRestore_endIcon1Restore_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface CardCtaRestore_endIcon1Restore_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_endIcon1Restore_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_endIcon1Restore_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_endIcon1Restore_SignUpBlock_action = CardCtaRestore_endIcon1Restore_SignUpBlock_action_NavigateToBlockAction | CardCtaRestore_endIcon1Restore_SignUpBlock_action_LinkAction | CardCtaRestore_endIcon1Restore_SignUpBlock_action_EmailAction;

export interface CardCtaRestore_endIcon1Restore_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardCtaRestore_endIcon1Restore_SignUpBlock_action | null;
}

export interface CardCtaRestore_endIcon1Restore_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface CardCtaRestore_endIcon1Restore_StepBlock {
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

export interface CardCtaRestore_endIcon1Restore_TextResponseBlock {
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

export interface CardCtaRestore_endIcon1Restore_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardCtaRestore_endIcon1Restore_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardCtaRestore_endIcon1Restore_TypographyBlock_settings | null;
}

export interface CardCtaRestore_endIcon1Restore_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardCtaRestore_endIcon1Restore_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardCtaRestore_endIcon1Restore_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardCtaRestore_endIcon1Restore_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardCtaRestore_endIcon1Restore_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardCtaRestore_endIcon1Restore_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface CardCtaRestore_endIcon1Restore_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardCtaRestore_endIcon1Restore_VideoBlock_mediaVideo_Video_title[];
  images: CardCtaRestore_endIcon1Restore_VideoBlock_mediaVideo_Video_images[];
  variant: CardCtaRestore_endIcon1Restore_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: CardCtaRestore_endIcon1Restore_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface CardCtaRestore_endIcon1Restore_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardCtaRestore_endIcon1Restore_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardCtaRestore_endIcon1Restore_VideoBlock_mediaVideo = CardCtaRestore_endIcon1Restore_VideoBlock_mediaVideo_Video | CardCtaRestore_endIcon1Restore_VideoBlock_mediaVideo_MuxVideo | CardCtaRestore_endIcon1Restore_VideoBlock_mediaVideo_YouTube;

export interface CardCtaRestore_endIcon1Restore_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_endIcon1Restore_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_endIcon1Restore_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_endIcon1Restore_VideoBlock_action = CardCtaRestore_endIcon1Restore_VideoBlock_action_NavigateToBlockAction | CardCtaRestore_endIcon1Restore_VideoBlock_action_LinkAction | CardCtaRestore_endIcon1Restore_VideoBlock_action_EmailAction;

export interface CardCtaRestore_endIcon1Restore_VideoBlock {
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
  mediaVideo: CardCtaRestore_endIcon1Restore_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardCtaRestore_endIcon1Restore_VideoBlock_action | null;
}

export interface CardCtaRestore_endIcon1Restore_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_endIcon1Restore_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_endIcon1Restore_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_endIcon1Restore_VideoTriggerBlock_triggerAction = CardCtaRestore_endIcon1Restore_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardCtaRestore_endIcon1Restore_VideoTriggerBlock_triggerAction_LinkAction | CardCtaRestore_endIcon1Restore_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardCtaRestore_endIcon1Restore_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardCtaRestore_endIcon1Restore_VideoTriggerBlock_triggerAction;
}

export type CardCtaRestore_endIcon1Restore = CardCtaRestore_endIcon1Restore_GridContainerBlock | CardCtaRestore_endIcon1Restore_ButtonBlock | CardCtaRestore_endIcon1Restore_CardBlock | CardCtaRestore_endIcon1Restore_IconBlock | CardCtaRestore_endIcon1Restore_ImageBlock | CardCtaRestore_endIcon1Restore_RadioOptionBlock | CardCtaRestore_endIcon1Restore_RadioQuestionBlock | CardCtaRestore_endIcon1Restore_SignUpBlock | CardCtaRestore_endIcon1Restore_SpacerBlock | CardCtaRestore_endIcon1Restore_StepBlock | CardCtaRestore_endIcon1Restore_TextResponseBlock | CardCtaRestore_endIcon1Restore_TypographyBlock | CardCtaRestore_endIcon1Restore_VideoBlock | CardCtaRestore_endIcon1Restore_VideoTriggerBlock;

export interface CardCtaRestore_button2Restore_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardCtaRestore_button2Restore_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_button2Restore_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_button2Restore_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_button2Restore_ButtonBlock_action = CardCtaRestore_button2Restore_ButtonBlock_action_NavigateToBlockAction | CardCtaRestore_button2Restore_ButtonBlock_action_LinkAction | CardCtaRestore_button2Restore_ButtonBlock_action_EmailAction;

export interface CardCtaRestore_button2Restore_ButtonBlock_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface CardCtaRestore_button2Restore_ButtonBlock {
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
  action: CardCtaRestore_button2Restore_ButtonBlock_action | null;
  settings: CardCtaRestore_button2Restore_ButtonBlock_settings | null;
}

export interface CardCtaRestore_button2Restore_CardBlock {
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

export interface CardCtaRestore_button2Restore_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardCtaRestore_button2Restore_ImageBlock {
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

export interface CardCtaRestore_button2Restore_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_button2Restore_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_button2Restore_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_button2Restore_RadioOptionBlock_action = CardCtaRestore_button2Restore_RadioOptionBlock_action_NavigateToBlockAction | CardCtaRestore_button2Restore_RadioOptionBlock_action_LinkAction | CardCtaRestore_button2Restore_RadioOptionBlock_action_EmailAction;

export interface CardCtaRestore_button2Restore_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardCtaRestore_button2Restore_RadioOptionBlock_action | null;
  pollOptionImageBlockId: string | null;
}

export interface CardCtaRestore_button2Restore_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface CardCtaRestore_button2Restore_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_button2Restore_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_button2Restore_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_button2Restore_SignUpBlock_action = CardCtaRestore_button2Restore_SignUpBlock_action_NavigateToBlockAction | CardCtaRestore_button2Restore_SignUpBlock_action_LinkAction | CardCtaRestore_button2Restore_SignUpBlock_action_EmailAction;

export interface CardCtaRestore_button2Restore_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardCtaRestore_button2Restore_SignUpBlock_action | null;
}

export interface CardCtaRestore_button2Restore_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface CardCtaRestore_button2Restore_StepBlock {
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

export interface CardCtaRestore_button2Restore_TextResponseBlock {
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

export interface CardCtaRestore_button2Restore_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardCtaRestore_button2Restore_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardCtaRestore_button2Restore_TypographyBlock_settings | null;
}

export interface CardCtaRestore_button2Restore_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardCtaRestore_button2Restore_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardCtaRestore_button2Restore_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardCtaRestore_button2Restore_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardCtaRestore_button2Restore_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardCtaRestore_button2Restore_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface CardCtaRestore_button2Restore_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardCtaRestore_button2Restore_VideoBlock_mediaVideo_Video_title[];
  images: CardCtaRestore_button2Restore_VideoBlock_mediaVideo_Video_images[];
  variant: CardCtaRestore_button2Restore_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: CardCtaRestore_button2Restore_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface CardCtaRestore_button2Restore_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardCtaRestore_button2Restore_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardCtaRestore_button2Restore_VideoBlock_mediaVideo = CardCtaRestore_button2Restore_VideoBlock_mediaVideo_Video | CardCtaRestore_button2Restore_VideoBlock_mediaVideo_MuxVideo | CardCtaRestore_button2Restore_VideoBlock_mediaVideo_YouTube;

export interface CardCtaRestore_button2Restore_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_button2Restore_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_button2Restore_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_button2Restore_VideoBlock_action = CardCtaRestore_button2Restore_VideoBlock_action_NavigateToBlockAction | CardCtaRestore_button2Restore_VideoBlock_action_LinkAction | CardCtaRestore_button2Restore_VideoBlock_action_EmailAction;

export interface CardCtaRestore_button2Restore_VideoBlock {
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
  mediaVideo: CardCtaRestore_button2Restore_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardCtaRestore_button2Restore_VideoBlock_action | null;
}

export interface CardCtaRestore_button2Restore_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_button2Restore_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_button2Restore_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_button2Restore_VideoTriggerBlock_triggerAction = CardCtaRestore_button2Restore_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardCtaRestore_button2Restore_VideoTriggerBlock_triggerAction_LinkAction | CardCtaRestore_button2Restore_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardCtaRestore_button2Restore_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardCtaRestore_button2Restore_VideoTriggerBlock_triggerAction;
}

export type CardCtaRestore_button2Restore = CardCtaRestore_button2Restore_GridContainerBlock | CardCtaRestore_button2Restore_ButtonBlock | CardCtaRestore_button2Restore_CardBlock | CardCtaRestore_button2Restore_IconBlock | CardCtaRestore_button2Restore_ImageBlock | CardCtaRestore_button2Restore_RadioOptionBlock | CardCtaRestore_button2Restore_RadioQuestionBlock | CardCtaRestore_button2Restore_SignUpBlock | CardCtaRestore_button2Restore_SpacerBlock | CardCtaRestore_button2Restore_StepBlock | CardCtaRestore_button2Restore_TextResponseBlock | CardCtaRestore_button2Restore_TypographyBlock | CardCtaRestore_button2Restore_VideoBlock | CardCtaRestore_button2Restore_VideoTriggerBlock;

export interface CardCtaRestore_startIcon2Restore_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardCtaRestore_startIcon2Restore_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_startIcon2Restore_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_startIcon2Restore_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_startIcon2Restore_ButtonBlock_action = CardCtaRestore_startIcon2Restore_ButtonBlock_action_NavigateToBlockAction | CardCtaRestore_startIcon2Restore_ButtonBlock_action_LinkAction | CardCtaRestore_startIcon2Restore_ButtonBlock_action_EmailAction;

export interface CardCtaRestore_startIcon2Restore_ButtonBlock_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface CardCtaRestore_startIcon2Restore_ButtonBlock {
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
  action: CardCtaRestore_startIcon2Restore_ButtonBlock_action | null;
  settings: CardCtaRestore_startIcon2Restore_ButtonBlock_settings | null;
}

export interface CardCtaRestore_startIcon2Restore_CardBlock {
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

export interface CardCtaRestore_startIcon2Restore_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardCtaRestore_startIcon2Restore_ImageBlock {
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

export interface CardCtaRestore_startIcon2Restore_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_startIcon2Restore_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_startIcon2Restore_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_startIcon2Restore_RadioOptionBlock_action = CardCtaRestore_startIcon2Restore_RadioOptionBlock_action_NavigateToBlockAction | CardCtaRestore_startIcon2Restore_RadioOptionBlock_action_LinkAction | CardCtaRestore_startIcon2Restore_RadioOptionBlock_action_EmailAction;

export interface CardCtaRestore_startIcon2Restore_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardCtaRestore_startIcon2Restore_RadioOptionBlock_action | null;
  pollOptionImageBlockId: string | null;
}

export interface CardCtaRestore_startIcon2Restore_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface CardCtaRestore_startIcon2Restore_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_startIcon2Restore_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_startIcon2Restore_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_startIcon2Restore_SignUpBlock_action = CardCtaRestore_startIcon2Restore_SignUpBlock_action_NavigateToBlockAction | CardCtaRestore_startIcon2Restore_SignUpBlock_action_LinkAction | CardCtaRestore_startIcon2Restore_SignUpBlock_action_EmailAction;

export interface CardCtaRestore_startIcon2Restore_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardCtaRestore_startIcon2Restore_SignUpBlock_action | null;
}

export interface CardCtaRestore_startIcon2Restore_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface CardCtaRestore_startIcon2Restore_StepBlock {
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

export interface CardCtaRestore_startIcon2Restore_TextResponseBlock {
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

export interface CardCtaRestore_startIcon2Restore_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardCtaRestore_startIcon2Restore_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardCtaRestore_startIcon2Restore_TypographyBlock_settings | null;
}

export interface CardCtaRestore_startIcon2Restore_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardCtaRestore_startIcon2Restore_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardCtaRestore_startIcon2Restore_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardCtaRestore_startIcon2Restore_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardCtaRestore_startIcon2Restore_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardCtaRestore_startIcon2Restore_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface CardCtaRestore_startIcon2Restore_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardCtaRestore_startIcon2Restore_VideoBlock_mediaVideo_Video_title[];
  images: CardCtaRestore_startIcon2Restore_VideoBlock_mediaVideo_Video_images[];
  variant: CardCtaRestore_startIcon2Restore_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: CardCtaRestore_startIcon2Restore_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface CardCtaRestore_startIcon2Restore_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardCtaRestore_startIcon2Restore_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardCtaRestore_startIcon2Restore_VideoBlock_mediaVideo = CardCtaRestore_startIcon2Restore_VideoBlock_mediaVideo_Video | CardCtaRestore_startIcon2Restore_VideoBlock_mediaVideo_MuxVideo | CardCtaRestore_startIcon2Restore_VideoBlock_mediaVideo_YouTube;

export interface CardCtaRestore_startIcon2Restore_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_startIcon2Restore_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_startIcon2Restore_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_startIcon2Restore_VideoBlock_action = CardCtaRestore_startIcon2Restore_VideoBlock_action_NavigateToBlockAction | CardCtaRestore_startIcon2Restore_VideoBlock_action_LinkAction | CardCtaRestore_startIcon2Restore_VideoBlock_action_EmailAction;

export interface CardCtaRestore_startIcon2Restore_VideoBlock {
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
  mediaVideo: CardCtaRestore_startIcon2Restore_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardCtaRestore_startIcon2Restore_VideoBlock_action | null;
}

export interface CardCtaRestore_startIcon2Restore_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_startIcon2Restore_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_startIcon2Restore_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_startIcon2Restore_VideoTriggerBlock_triggerAction = CardCtaRestore_startIcon2Restore_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardCtaRestore_startIcon2Restore_VideoTriggerBlock_triggerAction_LinkAction | CardCtaRestore_startIcon2Restore_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardCtaRestore_startIcon2Restore_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardCtaRestore_startIcon2Restore_VideoTriggerBlock_triggerAction;
}

export type CardCtaRestore_startIcon2Restore = CardCtaRestore_startIcon2Restore_GridContainerBlock | CardCtaRestore_startIcon2Restore_ButtonBlock | CardCtaRestore_startIcon2Restore_CardBlock | CardCtaRestore_startIcon2Restore_IconBlock | CardCtaRestore_startIcon2Restore_ImageBlock | CardCtaRestore_startIcon2Restore_RadioOptionBlock | CardCtaRestore_startIcon2Restore_RadioQuestionBlock | CardCtaRestore_startIcon2Restore_SignUpBlock | CardCtaRestore_startIcon2Restore_SpacerBlock | CardCtaRestore_startIcon2Restore_StepBlock | CardCtaRestore_startIcon2Restore_TextResponseBlock | CardCtaRestore_startIcon2Restore_TypographyBlock | CardCtaRestore_startIcon2Restore_VideoBlock | CardCtaRestore_startIcon2Restore_VideoTriggerBlock;

export interface CardCtaRestore_endIcon2Restore_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardCtaRestore_endIcon2Restore_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_endIcon2Restore_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_endIcon2Restore_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_endIcon2Restore_ButtonBlock_action = CardCtaRestore_endIcon2Restore_ButtonBlock_action_NavigateToBlockAction | CardCtaRestore_endIcon2Restore_ButtonBlock_action_LinkAction | CardCtaRestore_endIcon2Restore_ButtonBlock_action_EmailAction;

export interface CardCtaRestore_endIcon2Restore_ButtonBlock_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface CardCtaRestore_endIcon2Restore_ButtonBlock {
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
  action: CardCtaRestore_endIcon2Restore_ButtonBlock_action | null;
  settings: CardCtaRestore_endIcon2Restore_ButtonBlock_settings | null;
}

export interface CardCtaRestore_endIcon2Restore_CardBlock {
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

export interface CardCtaRestore_endIcon2Restore_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardCtaRestore_endIcon2Restore_ImageBlock {
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

export interface CardCtaRestore_endIcon2Restore_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_endIcon2Restore_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_endIcon2Restore_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_endIcon2Restore_RadioOptionBlock_action = CardCtaRestore_endIcon2Restore_RadioOptionBlock_action_NavigateToBlockAction | CardCtaRestore_endIcon2Restore_RadioOptionBlock_action_LinkAction | CardCtaRestore_endIcon2Restore_RadioOptionBlock_action_EmailAction;

export interface CardCtaRestore_endIcon2Restore_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardCtaRestore_endIcon2Restore_RadioOptionBlock_action | null;
  pollOptionImageBlockId: string | null;
}

export interface CardCtaRestore_endIcon2Restore_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface CardCtaRestore_endIcon2Restore_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_endIcon2Restore_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_endIcon2Restore_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_endIcon2Restore_SignUpBlock_action = CardCtaRestore_endIcon2Restore_SignUpBlock_action_NavigateToBlockAction | CardCtaRestore_endIcon2Restore_SignUpBlock_action_LinkAction | CardCtaRestore_endIcon2Restore_SignUpBlock_action_EmailAction;

export interface CardCtaRestore_endIcon2Restore_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardCtaRestore_endIcon2Restore_SignUpBlock_action | null;
}

export interface CardCtaRestore_endIcon2Restore_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface CardCtaRestore_endIcon2Restore_StepBlock {
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

export interface CardCtaRestore_endIcon2Restore_TextResponseBlock {
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

export interface CardCtaRestore_endIcon2Restore_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardCtaRestore_endIcon2Restore_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardCtaRestore_endIcon2Restore_TypographyBlock_settings | null;
}

export interface CardCtaRestore_endIcon2Restore_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardCtaRestore_endIcon2Restore_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardCtaRestore_endIcon2Restore_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardCtaRestore_endIcon2Restore_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardCtaRestore_endIcon2Restore_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardCtaRestore_endIcon2Restore_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface CardCtaRestore_endIcon2Restore_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardCtaRestore_endIcon2Restore_VideoBlock_mediaVideo_Video_title[];
  images: CardCtaRestore_endIcon2Restore_VideoBlock_mediaVideo_Video_images[];
  variant: CardCtaRestore_endIcon2Restore_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: CardCtaRestore_endIcon2Restore_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface CardCtaRestore_endIcon2Restore_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardCtaRestore_endIcon2Restore_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardCtaRestore_endIcon2Restore_VideoBlock_mediaVideo = CardCtaRestore_endIcon2Restore_VideoBlock_mediaVideo_Video | CardCtaRestore_endIcon2Restore_VideoBlock_mediaVideo_MuxVideo | CardCtaRestore_endIcon2Restore_VideoBlock_mediaVideo_YouTube;

export interface CardCtaRestore_endIcon2Restore_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_endIcon2Restore_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_endIcon2Restore_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_endIcon2Restore_VideoBlock_action = CardCtaRestore_endIcon2Restore_VideoBlock_action_NavigateToBlockAction | CardCtaRestore_endIcon2Restore_VideoBlock_action_LinkAction | CardCtaRestore_endIcon2Restore_VideoBlock_action_EmailAction;

export interface CardCtaRestore_endIcon2Restore_VideoBlock {
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
  mediaVideo: CardCtaRestore_endIcon2Restore_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardCtaRestore_endIcon2Restore_VideoBlock_action | null;
}

export interface CardCtaRestore_endIcon2Restore_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_endIcon2Restore_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_endIcon2Restore_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_endIcon2Restore_VideoTriggerBlock_triggerAction = CardCtaRestore_endIcon2Restore_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardCtaRestore_endIcon2Restore_VideoTriggerBlock_triggerAction_LinkAction | CardCtaRestore_endIcon2Restore_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardCtaRestore_endIcon2Restore_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardCtaRestore_endIcon2Restore_VideoTriggerBlock_triggerAction;
}

export type CardCtaRestore_endIcon2Restore = CardCtaRestore_endIcon2Restore_GridContainerBlock | CardCtaRestore_endIcon2Restore_ButtonBlock | CardCtaRestore_endIcon2Restore_CardBlock | CardCtaRestore_endIcon2Restore_IconBlock | CardCtaRestore_endIcon2Restore_ImageBlock | CardCtaRestore_endIcon2Restore_RadioOptionBlock | CardCtaRestore_endIcon2Restore_RadioQuestionBlock | CardCtaRestore_endIcon2Restore_SignUpBlock | CardCtaRestore_endIcon2Restore_SpacerBlock | CardCtaRestore_endIcon2Restore_StepBlock | CardCtaRestore_endIcon2Restore_TextResponseBlock | CardCtaRestore_endIcon2Restore_TypographyBlock | CardCtaRestore_endIcon2Restore_VideoBlock | CardCtaRestore_endIcon2Restore_VideoTriggerBlock;

export interface CardCtaRestore_button3Restore_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardCtaRestore_button3Restore_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_button3Restore_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_button3Restore_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_button3Restore_ButtonBlock_action = CardCtaRestore_button3Restore_ButtonBlock_action_NavigateToBlockAction | CardCtaRestore_button3Restore_ButtonBlock_action_LinkAction | CardCtaRestore_button3Restore_ButtonBlock_action_EmailAction;

export interface CardCtaRestore_button3Restore_ButtonBlock_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface CardCtaRestore_button3Restore_ButtonBlock {
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
  action: CardCtaRestore_button3Restore_ButtonBlock_action | null;
  settings: CardCtaRestore_button3Restore_ButtonBlock_settings | null;
}

export interface CardCtaRestore_button3Restore_CardBlock {
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

export interface CardCtaRestore_button3Restore_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardCtaRestore_button3Restore_ImageBlock {
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

export interface CardCtaRestore_button3Restore_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_button3Restore_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_button3Restore_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_button3Restore_RadioOptionBlock_action = CardCtaRestore_button3Restore_RadioOptionBlock_action_NavigateToBlockAction | CardCtaRestore_button3Restore_RadioOptionBlock_action_LinkAction | CardCtaRestore_button3Restore_RadioOptionBlock_action_EmailAction;

export interface CardCtaRestore_button3Restore_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardCtaRestore_button3Restore_RadioOptionBlock_action | null;
  pollOptionImageBlockId: string | null;
}

export interface CardCtaRestore_button3Restore_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface CardCtaRestore_button3Restore_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_button3Restore_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_button3Restore_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_button3Restore_SignUpBlock_action = CardCtaRestore_button3Restore_SignUpBlock_action_NavigateToBlockAction | CardCtaRestore_button3Restore_SignUpBlock_action_LinkAction | CardCtaRestore_button3Restore_SignUpBlock_action_EmailAction;

export interface CardCtaRestore_button3Restore_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardCtaRestore_button3Restore_SignUpBlock_action | null;
}

export interface CardCtaRestore_button3Restore_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface CardCtaRestore_button3Restore_StepBlock {
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

export interface CardCtaRestore_button3Restore_TextResponseBlock {
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

export interface CardCtaRestore_button3Restore_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardCtaRestore_button3Restore_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardCtaRestore_button3Restore_TypographyBlock_settings | null;
}

export interface CardCtaRestore_button3Restore_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardCtaRestore_button3Restore_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardCtaRestore_button3Restore_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardCtaRestore_button3Restore_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardCtaRestore_button3Restore_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardCtaRestore_button3Restore_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface CardCtaRestore_button3Restore_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardCtaRestore_button3Restore_VideoBlock_mediaVideo_Video_title[];
  images: CardCtaRestore_button3Restore_VideoBlock_mediaVideo_Video_images[];
  variant: CardCtaRestore_button3Restore_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: CardCtaRestore_button3Restore_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface CardCtaRestore_button3Restore_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardCtaRestore_button3Restore_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardCtaRestore_button3Restore_VideoBlock_mediaVideo = CardCtaRestore_button3Restore_VideoBlock_mediaVideo_Video | CardCtaRestore_button3Restore_VideoBlock_mediaVideo_MuxVideo | CardCtaRestore_button3Restore_VideoBlock_mediaVideo_YouTube;

export interface CardCtaRestore_button3Restore_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_button3Restore_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_button3Restore_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_button3Restore_VideoBlock_action = CardCtaRestore_button3Restore_VideoBlock_action_NavigateToBlockAction | CardCtaRestore_button3Restore_VideoBlock_action_LinkAction | CardCtaRestore_button3Restore_VideoBlock_action_EmailAction;

export interface CardCtaRestore_button3Restore_VideoBlock {
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
  mediaVideo: CardCtaRestore_button3Restore_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardCtaRestore_button3Restore_VideoBlock_action | null;
}

export interface CardCtaRestore_button3Restore_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_button3Restore_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_button3Restore_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_button3Restore_VideoTriggerBlock_triggerAction = CardCtaRestore_button3Restore_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardCtaRestore_button3Restore_VideoTriggerBlock_triggerAction_LinkAction | CardCtaRestore_button3Restore_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardCtaRestore_button3Restore_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardCtaRestore_button3Restore_VideoTriggerBlock_triggerAction;
}

export type CardCtaRestore_button3Restore = CardCtaRestore_button3Restore_GridContainerBlock | CardCtaRestore_button3Restore_ButtonBlock | CardCtaRestore_button3Restore_CardBlock | CardCtaRestore_button3Restore_IconBlock | CardCtaRestore_button3Restore_ImageBlock | CardCtaRestore_button3Restore_RadioOptionBlock | CardCtaRestore_button3Restore_RadioQuestionBlock | CardCtaRestore_button3Restore_SignUpBlock | CardCtaRestore_button3Restore_SpacerBlock | CardCtaRestore_button3Restore_StepBlock | CardCtaRestore_button3Restore_TextResponseBlock | CardCtaRestore_button3Restore_TypographyBlock | CardCtaRestore_button3Restore_VideoBlock | CardCtaRestore_button3Restore_VideoTriggerBlock;

export interface CardCtaRestore_startIcon3Restore_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardCtaRestore_startIcon3Restore_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_startIcon3Restore_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_startIcon3Restore_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_startIcon3Restore_ButtonBlock_action = CardCtaRestore_startIcon3Restore_ButtonBlock_action_NavigateToBlockAction | CardCtaRestore_startIcon3Restore_ButtonBlock_action_LinkAction | CardCtaRestore_startIcon3Restore_ButtonBlock_action_EmailAction;

export interface CardCtaRestore_startIcon3Restore_ButtonBlock_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface CardCtaRestore_startIcon3Restore_ButtonBlock {
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
  action: CardCtaRestore_startIcon3Restore_ButtonBlock_action | null;
  settings: CardCtaRestore_startIcon3Restore_ButtonBlock_settings | null;
}

export interface CardCtaRestore_startIcon3Restore_CardBlock {
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

export interface CardCtaRestore_startIcon3Restore_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardCtaRestore_startIcon3Restore_ImageBlock {
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

export interface CardCtaRestore_startIcon3Restore_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_startIcon3Restore_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_startIcon3Restore_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_startIcon3Restore_RadioOptionBlock_action = CardCtaRestore_startIcon3Restore_RadioOptionBlock_action_NavigateToBlockAction | CardCtaRestore_startIcon3Restore_RadioOptionBlock_action_LinkAction | CardCtaRestore_startIcon3Restore_RadioOptionBlock_action_EmailAction;

export interface CardCtaRestore_startIcon3Restore_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardCtaRestore_startIcon3Restore_RadioOptionBlock_action | null;
  pollOptionImageBlockId: string | null;
}

export interface CardCtaRestore_startIcon3Restore_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface CardCtaRestore_startIcon3Restore_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_startIcon3Restore_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_startIcon3Restore_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_startIcon3Restore_SignUpBlock_action = CardCtaRestore_startIcon3Restore_SignUpBlock_action_NavigateToBlockAction | CardCtaRestore_startIcon3Restore_SignUpBlock_action_LinkAction | CardCtaRestore_startIcon3Restore_SignUpBlock_action_EmailAction;

export interface CardCtaRestore_startIcon3Restore_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardCtaRestore_startIcon3Restore_SignUpBlock_action | null;
}

export interface CardCtaRestore_startIcon3Restore_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface CardCtaRestore_startIcon3Restore_StepBlock {
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

export interface CardCtaRestore_startIcon3Restore_TextResponseBlock {
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

export interface CardCtaRestore_startIcon3Restore_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardCtaRestore_startIcon3Restore_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardCtaRestore_startIcon3Restore_TypographyBlock_settings | null;
}

export interface CardCtaRestore_startIcon3Restore_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardCtaRestore_startIcon3Restore_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardCtaRestore_startIcon3Restore_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardCtaRestore_startIcon3Restore_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardCtaRestore_startIcon3Restore_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardCtaRestore_startIcon3Restore_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface CardCtaRestore_startIcon3Restore_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardCtaRestore_startIcon3Restore_VideoBlock_mediaVideo_Video_title[];
  images: CardCtaRestore_startIcon3Restore_VideoBlock_mediaVideo_Video_images[];
  variant: CardCtaRestore_startIcon3Restore_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: CardCtaRestore_startIcon3Restore_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface CardCtaRestore_startIcon3Restore_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardCtaRestore_startIcon3Restore_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardCtaRestore_startIcon3Restore_VideoBlock_mediaVideo = CardCtaRestore_startIcon3Restore_VideoBlock_mediaVideo_Video | CardCtaRestore_startIcon3Restore_VideoBlock_mediaVideo_MuxVideo | CardCtaRestore_startIcon3Restore_VideoBlock_mediaVideo_YouTube;

export interface CardCtaRestore_startIcon3Restore_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_startIcon3Restore_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_startIcon3Restore_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_startIcon3Restore_VideoBlock_action = CardCtaRestore_startIcon3Restore_VideoBlock_action_NavigateToBlockAction | CardCtaRestore_startIcon3Restore_VideoBlock_action_LinkAction | CardCtaRestore_startIcon3Restore_VideoBlock_action_EmailAction;

export interface CardCtaRestore_startIcon3Restore_VideoBlock {
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
  mediaVideo: CardCtaRestore_startIcon3Restore_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardCtaRestore_startIcon3Restore_VideoBlock_action | null;
}

export interface CardCtaRestore_startIcon3Restore_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_startIcon3Restore_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_startIcon3Restore_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_startIcon3Restore_VideoTriggerBlock_triggerAction = CardCtaRestore_startIcon3Restore_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardCtaRestore_startIcon3Restore_VideoTriggerBlock_triggerAction_LinkAction | CardCtaRestore_startIcon3Restore_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardCtaRestore_startIcon3Restore_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardCtaRestore_startIcon3Restore_VideoTriggerBlock_triggerAction;
}

export type CardCtaRestore_startIcon3Restore = CardCtaRestore_startIcon3Restore_GridContainerBlock | CardCtaRestore_startIcon3Restore_ButtonBlock | CardCtaRestore_startIcon3Restore_CardBlock | CardCtaRestore_startIcon3Restore_IconBlock | CardCtaRestore_startIcon3Restore_ImageBlock | CardCtaRestore_startIcon3Restore_RadioOptionBlock | CardCtaRestore_startIcon3Restore_RadioQuestionBlock | CardCtaRestore_startIcon3Restore_SignUpBlock | CardCtaRestore_startIcon3Restore_SpacerBlock | CardCtaRestore_startIcon3Restore_StepBlock | CardCtaRestore_startIcon3Restore_TextResponseBlock | CardCtaRestore_startIcon3Restore_TypographyBlock | CardCtaRestore_startIcon3Restore_VideoBlock | CardCtaRestore_startIcon3Restore_VideoTriggerBlock;

export interface CardCtaRestore_endIcon3Restore_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface CardCtaRestore_endIcon3Restore_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_endIcon3Restore_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_endIcon3Restore_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_endIcon3Restore_ButtonBlock_action = CardCtaRestore_endIcon3Restore_ButtonBlock_action_NavigateToBlockAction | CardCtaRestore_endIcon3Restore_ButtonBlock_action_LinkAction | CardCtaRestore_endIcon3Restore_ButtonBlock_action_EmailAction;

export interface CardCtaRestore_endIcon3Restore_ButtonBlock_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface CardCtaRestore_endIcon3Restore_ButtonBlock {
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
  action: CardCtaRestore_endIcon3Restore_ButtonBlock_action | null;
  settings: CardCtaRestore_endIcon3Restore_ButtonBlock_settings | null;
}

export interface CardCtaRestore_endIcon3Restore_CardBlock {
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

export interface CardCtaRestore_endIcon3Restore_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardCtaRestore_endIcon3Restore_ImageBlock {
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

export interface CardCtaRestore_endIcon3Restore_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_endIcon3Restore_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_endIcon3Restore_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_endIcon3Restore_RadioOptionBlock_action = CardCtaRestore_endIcon3Restore_RadioOptionBlock_action_NavigateToBlockAction | CardCtaRestore_endIcon3Restore_RadioOptionBlock_action_LinkAction | CardCtaRestore_endIcon3Restore_RadioOptionBlock_action_EmailAction;

export interface CardCtaRestore_endIcon3Restore_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardCtaRestore_endIcon3Restore_RadioOptionBlock_action | null;
  pollOptionImageBlockId: string | null;
}

export interface CardCtaRestore_endIcon3Restore_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface CardCtaRestore_endIcon3Restore_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_endIcon3Restore_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_endIcon3Restore_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_endIcon3Restore_SignUpBlock_action = CardCtaRestore_endIcon3Restore_SignUpBlock_action_NavigateToBlockAction | CardCtaRestore_endIcon3Restore_SignUpBlock_action_LinkAction | CardCtaRestore_endIcon3Restore_SignUpBlock_action_EmailAction;

export interface CardCtaRestore_endIcon3Restore_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardCtaRestore_endIcon3Restore_SignUpBlock_action | null;
}

export interface CardCtaRestore_endIcon3Restore_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface CardCtaRestore_endIcon3Restore_StepBlock {
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

export interface CardCtaRestore_endIcon3Restore_TextResponseBlock {
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

export interface CardCtaRestore_endIcon3Restore_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardCtaRestore_endIcon3Restore_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardCtaRestore_endIcon3Restore_TypographyBlock_settings | null;
}

export interface CardCtaRestore_endIcon3Restore_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardCtaRestore_endIcon3Restore_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardCtaRestore_endIcon3Restore_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardCtaRestore_endIcon3Restore_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardCtaRestore_endIcon3Restore_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardCtaRestore_endIcon3Restore_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface CardCtaRestore_endIcon3Restore_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardCtaRestore_endIcon3Restore_VideoBlock_mediaVideo_Video_title[];
  images: CardCtaRestore_endIcon3Restore_VideoBlock_mediaVideo_Video_images[];
  variant: CardCtaRestore_endIcon3Restore_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: CardCtaRestore_endIcon3Restore_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface CardCtaRestore_endIcon3Restore_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardCtaRestore_endIcon3Restore_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardCtaRestore_endIcon3Restore_VideoBlock_mediaVideo = CardCtaRestore_endIcon3Restore_VideoBlock_mediaVideo_Video | CardCtaRestore_endIcon3Restore_VideoBlock_mediaVideo_MuxVideo | CardCtaRestore_endIcon3Restore_VideoBlock_mediaVideo_YouTube;

export interface CardCtaRestore_endIcon3Restore_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_endIcon3Restore_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_endIcon3Restore_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_endIcon3Restore_VideoBlock_action = CardCtaRestore_endIcon3Restore_VideoBlock_action_NavigateToBlockAction | CardCtaRestore_endIcon3Restore_VideoBlock_action_LinkAction | CardCtaRestore_endIcon3Restore_VideoBlock_action_EmailAction;

export interface CardCtaRestore_endIcon3Restore_VideoBlock {
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
  mediaVideo: CardCtaRestore_endIcon3Restore_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardCtaRestore_endIcon3Restore_VideoBlock_action | null;
}

export interface CardCtaRestore_endIcon3Restore_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaRestore_endIcon3Restore_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaRestore_endIcon3Restore_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaRestore_endIcon3Restore_VideoTriggerBlock_triggerAction = CardCtaRestore_endIcon3Restore_VideoTriggerBlock_triggerAction_NavigateToBlockAction | CardCtaRestore_endIcon3Restore_VideoTriggerBlock_triggerAction_LinkAction | CardCtaRestore_endIcon3Restore_VideoTriggerBlock_triggerAction_EmailAction;

export interface CardCtaRestore_endIcon3Restore_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: CardCtaRestore_endIcon3Restore_VideoTriggerBlock_triggerAction;
}

export type CardCtaRestore_endIcon3Restore = CardCtaRestore_endIcon3Restore_GridContainerBlock | CardCtaRestore_endIcon3Restore_ButtonBlock | CardCtaRestore_endIcon3Restore_CardBlock | CardCtaRestore_endIcon3Restore_IconBlock | CardCtaRestore_endIcon3Restore_ImageBlock | CardCtaRestore_endIcon3Restore_RadioOptionBlock | CardCtaRestore_endIcon3Restore_RadioQuestionBlock | CardCtaRestore_endIcon3Restore_SignUpBlock | CardCtaRestore_endIcon3Restore_SpacerBlock | CardCtaRestore_endIcon3Restore_StepBlock | CardCtaRestore_endIcon3Restore_TextResponseBlock | CardCtaRestore_endIcon3Restore_TypographyBlock | CardCtaRestore_endIcon3Restore_VideoBlock | CardCtaRestore_endIcon3Restore_VideoTriggerBlock;

export interface CardCtaRestore_cardBlockUpdate {
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

export interface CardCtaRestore {
  /**
   * blockRestore is used for redo/undo
   */
  imageRestore: CardCtaRestore_imageRestore[];
  /**
   * blockRestore is used for redo/undo
   */
  subtitleRestore: CardCtaRestore_subtitleRestore[];
  /**
   * blockRestore is used for redo/undo
   */
  titleRestore: CardCtaRestore_titleRestore[];
  /**
   * blockRestore is used for redo/undo
   */
  button1Restore: CardCtaRestore_button1Restore[];
  /**
   * blockRestore is used for redo/undo
   */
  startIcon1Restore: CardCtaRestore_startIcon1Restore[];
  /**
   * blockRestore is used for redo/undo
   */
  endIcon1Restore: CardCtaRestore_endIcon1Restore[];
  /**
   * blockRestore is used for redo/undo
   */
  button2Restore: CardCtaRestore_button2Restore[];
  /**
   * blockRestore is used for redo/undo
   */
  startIcon2Restore: CardCtaRestore_startIcon2Restore[];
  /**
   * blockRestore is used for redo/undo
   */
  endIcon2Restore: CardCtaRestore_endIcon2Restore[];
  /**
   * blockRestore is used for redo/undo
   */
  button3Restore: CardCtaRestore_button3Restore[];
  /**
   * blockRestore is used for redo/undo
   */
  startIcon3Restore: CardCtaRestore_startIcon3Restore[];
  /**
   * blockRestore is used for redo/undo
   */
  endIcon3Restore: CardCtaRestore_endIcon3Restore[];
  cardBlockUpdate: CardCtaRestore_cardBlockUpdate;
}

export interface CardCtaRestoreVariables {
  imageId: string;
  subtitleId: string;
  titleId: string;
  button1Id: string;
  startIcon1Id: string;
  endIcon1Id: string;
  button2Id: string;
  startIcon2Id: string;
  endIcon2Id: string;
  button3Id: string;
  startIcon3Id: string;
  endIcon3Id: string;
  cardId: string;
  cardInput: CardBlockUpdateInput;
}

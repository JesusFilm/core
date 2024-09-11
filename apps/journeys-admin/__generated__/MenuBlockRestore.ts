/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyUpdateInput, ButtonVariant, ButtonColor, ButtonSize, ThemeMode, ThemeName, IconName, IconSize, IconColor, TextResponseType, TypographyAlign, TypographyColor, TypographyVariant, VideoBlockSource, VideoBlockObjectFit } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: MenuBlockRestore
// ====================================================

export interface MenuBlockRestore_stepRestore_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface MenuBlockRestore_stepRestore_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface MenuBlockRestore_stepRestore_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface MenuBlockRestore_stepRestore_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type MenuBlockRestore_stepRestore_ButtonBlock_action = MenuBlockRestore_stepRestore_ButtonBlock_action_NavigateToBlockAction | MenuBlockRestore_stepRestore_ButtonBlock_action_LinkAction | MenuBlockRestore_stepRestore_ButtonBlock_action_EmailAction;

export interface MenuBlockRestore_stepRestore_ButtonBlock {
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
  action: MenuBlockRestore_stepRestore_ButtonBlock_action | null;
}

export interface MenuBlockRestore_stepRestore_CardBlock {
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

export interface MenuBlockRestore_stepRestore_FormBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface MenuBlockRestore_stepRestore_FormBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface MenuBlockRestore_stepRestore_FormBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type MenuBlockRestore_stepRestore_FormBlock_action = MenuBlockRestore_stepRestore_FormBlock_action_NavigateToBlockAction | MenuBlockRestore_stepRestore_FormBlock_action_LinkAction | MenuBlockRestore_stepRestore_FormBlock_action_EmailAction;

export interface MenuBlockRestore_stepRestore_FormBlock {
  __typename: "FormBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  form: any | null;
  action: MenuBlockRestore_stepRestore_FormBlock_action | null;
}

export interface MenuBlockRestore_stepRestore_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface MenuBlockRestore_stepRestore_ImageBlock {
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

export interface MenuBlockRestore_stepRestore_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface MenuBlockRestore_stepRestore_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface MenuBlockRestore_stepRestore_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type MenuBlockRestore_stepRestore_RadioOptionBlock_action = MenuBlockRestore_stepRestore_RadioOptionBlock_action_NavigateToBlockAction | MenuBlockRestore_stepRestore_RadioOptionBlock_action_LinkAction | MenuBlockRestore_stepRestore_RadioOptionBlock_action_EmailAction;

export interface MenuBlockRestore_stepRestore_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: MenuBlockRestore_stepRestore_RadioOptionBlock_action | null;
}

export interface MenuBlockRestore_stepRestore_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface MenuBlockRestore_stepRestore_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface MenuBlockRestore_stepRestore_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface MenuBlockRestore_stepRestore_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type MenuBlockRestore_stepRestore_SignUpBlock_action = MenuBlockRestore_stepRestore_SignUpBlock_action_NavigateToBlockAction | MenuBlockRestore_stepRestore_SignUpBlock_action_LinkAction | MenuBlockRestore_stepRestore_SignUpBlock_action_EmailAction;

export interface MenuBlockRestore_stepRestore_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: MenuBlockRestore_stepRestore_SignUpBlock_action | null;
}

export interface MenuBlockRestore_stepRestore_StepBlock {
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
  /**
   * x is used to position the block horizontally in the journey flow diagram on
   * the editor.
   */
  x: number | null;
  /**
   * y is used to position the block vertically in the journey flow diagram on
   * the editor.
   */
  y: number | null;
}

export interface MenuBlockRestore_stepRestore_TextResponseBlock {
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

export interface MenuBlockRestore_stepRestore_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
}

export interface MenuBlockRestore_stepRestore_VideoBlock_video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface MenuBlockRestore_stepRestore_VideoBlock_video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface MenuBlockRestore_stepRestore_VideoBlock_video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface MenuBlockRestore_stepRestore_VideoBlock_video_variantLanguages {
  __typename: "Language";
  id: string;
  name: MenuBlockRestore_stepRestore_VideoBlock_video_variantLanguages_name[];
}

export interface MenuBlockRestore_stepRestore_VideoBlock_video {
  __typename: "Video";
  id: string;
  title: MenuBlockRestore_stepRestore_VideoBlock_video_title[];
  image: string | null;
  variant: MenuBlockRestore_stepRestore_VideoBlock_video_variant | null;
  variantLanguages: MenuBlockRestore_stepRestore_VideoBlock_video_variantLanguages[];
}

export interface MenuBlockRestore_stepRestore_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface MenuBlockRestore_stepRestore_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface MenuBlockRestore_stepRestore_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type MenuBlockRestore_stepRestore_VideoBlock_action = MenuBlockRestore_stepRestore_VideoBlock_action_NavigateToBlockAction | MenuBlockRestore_stepRestore_VideoBlock_action_LinkAction | MenuBlockRestore_stepRestore_VideoBlock_action_EmailAction;

export interface MenuBlockRestore_stepRestore_VideoBlock {
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
  video: MenuBlockRestore_stepRestore_VideoBlock_video | null;
  /**
   * action that should be performed when the video ends
   */
  action: MenuBlockRestore_stepRestore_VideoBlock_action | null;
}

export interface MenuBlockRestore_stepRestore_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface MenuBlockRestore_stepRestore_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface MenuBlockRestore_stepRestore_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type MenuBlockRestore_stepRestore_VideoTriggerBlock_triggerAction = MenuBlockRestore_stepRestore_VideoTriggerBlock_triggerAction_NavigateToBlockAction | MenuBlockRestore_stepRestore_VideoTriggerBlock_triggerAction_LinkAction | MenuBlockRestore_stepRestore_VideoTriggerBlock_triggerAction_EmailAction;

export interface MenuBlockRestore_stepRestore_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: MenuBlockRestore_stepRestore_VideoTriggerBlock_triggerAction;
}

export type MenuBlockRestore_stepRestore = MenuBlockRestore_stepRestore_GridContainerBlock | MenuBlockRestore_stepRestore_ButtonBlock | MenuBlockRestore_stepRestore_CardBlock | MenuBlockRestore_stepRestore_FormBlock | MenuBlockRestore_stepRestore_IconBlock | MenuBlockRestore_stepRestore_ImageBlock | MenuBlockRestore_stepRestore_RadioOptionBlock | MenuBlockRestore_stepRestore_RadioQuestionBlock | MenuBlockRestore_stepRestore_SignUpBlock | MenuBlockRestore_stepRestore_StepBlock | MenuBlockRestore_stepRestore_TextResponseBlock | MenuBlockRestore_stepRestore_TypographyBlock | MenuBlockRestore_stepRestore_VideoBlock | MenuBlockRestore_stepRestore_VideoTriggerBlock;

export interface MenuBlockRestore_cardRestore_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface MenuBlockRestore_cardRestore_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface MenuBlockRestore_cardRestore_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface MenuBlockRestore_cardRestore_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type MenuBlockRestore_cardRestore_ButtonBlock_action = MenuBlockRestore_cardRestore_ButtonBlock_action_NavigateToBlockAction | MenuBlockRestore_cardRestore_ButtonBlock_action_LinkAction | MenuBlockRestore_cardRestore_ButtonBlock_action_EmailAction;

export interface MenuBlockRestore_cardRestore_ButtonBlock {
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
  action: MenuBlockRestore_cardRestore_ButtonBlock_action | null;
}

export interface MenuBlockRestore_cardRestore_CardBlock {
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

export interface MenuBlockRestore_cardRestore_FormBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface MenuBlockRestore_cardRestore_FormBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface MenuBlockRestore_cardRestore_FormBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type MenuBlockRestore_cardRestore_FormBlock_action = MenuBlockRestore_cardRestore_FormBlock_action_NavigateToBlockAction | MenuBlockRestore_cardRestore_FormBlock_action_LinkAction | MenuBlockRestore_cardRestore_FormBlock_action_EmailAction;

export interface MenuBlockRestore_cardRestore_FormBlock {
  __typename: "FormBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  form: any | null;
  action: MenuBlockRestore_cardRestore_FormBlock_action | null;
}

export interface MenuBlockRestore_cardRestore_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface MenuBlockRestore_cardRestore_ImageBlock {
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

export interface MenuBlockRestore_cardRestore_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface MenuBlockRestore_cardRestore_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface MenuBlockRestore_cardRestore_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type MenuBlockRestore_cardRestore_RadioOptionBlock_action = MenuBlockRestore_cardRestore_RadioOptionBlock_action_NavigateToBlockAction | MenuBlockRestore_cardRestore_RadioOptionBlock_action_LinkAction | MenuBlockRestore_cardRestore_RadioOptionBlock_action_EmailAction;

export interface MenuBlockRestore_cardRestore_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: MenuBlockRestore_cardRestore_RadioOptionBlock_action | null;
}

export interface MenuBlockRestore_cardRestore_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface MenuBlockRestore_cardRestore_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface MenuBlockRestore_cardRestore_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface MenuBlockRestore_cardRestore_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type MenuBlockRestore_cardRestore_SignUpBlock_action = MenuBlockRestore_cardRestore_SignUpBlock_action_NavigateToBlockAction | MenuBlockRestore_cardRestore_SignUpBlock_action_LinkAction | MenuBlockRestore_cardRestore_SignUpBlock_action_EmailAction;

export interface MenuBlockRestore_cardRestore_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: MenuBlockRestore_cardRestore_SignUpBlock_action | null;
}

export interface MenuBlockRestore_cardRestore_StepBlock {
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

export interface MenuBlockRestore_cardRestore_TextResponseBlock {
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

export interface MenuBlockRestore_cardRestore_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
}

export interface MenuBlockRestore_cardRestore_VideoBlock_video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface MenuBlockRestore_cardRestore_VideoBlock_video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface MenuBlockRestore_cardRestore_VideoBlock_video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface MenuBlockRestore_cardRestore_VideoBlock_video_variantLanguages {
  __typename: "Language";
  id: string;
  name: MenuBlockRestore_cardRestore_VideoBlock_video_variantLanguages_name[];
}

export interface MenuBlockRestore_cardRestore_VideoBlock_video {
  __typename: "Video";
  id: string;
  title: MenuBlockRestore_cardRestore_VideoBlock_video_title[];
  image: string | null;
  variant: MenuBlockRestore_cardRestore_VideoBlock_video_variant | null;
  variantLanguages: MenuBlockRestore_cardRestore_VideoBlock_video_variantLanguages[];
}

export interface MenuBlockRestore_cardRestore_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface MenuBlockRestore_cardRestore_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface MenuBlockRestore_cardRestore_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type MenuBlockRestore_cardRestore_VideoBlock_action = MenuBlockRestore_cardRestore_VideoBlock_action_NavigateToBlockAction | MenuBlockRestore_cardRestore_VideoBlock_action_LinkAction | MenuBlockRestore_cardRestore_VideoBlock_action_EmailAction;

export interface MenuBlockRestore_cardRestore_VideoBlock {
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
  video: MenuBlockRestore_cardRestore_VideoBlock_video | null;
  /**
   * action that should be performed when the video ends
   */
  action: MenuBlockRestore_cardRestore_VideoBlock_action | null;
}

export interface MenuBlockRestore_cardRestore_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface MenuBlockRestore_cardRestore_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface MenuBlockRestore_cardRestore_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type MenuBlockRestore_cardRestore_VideoTriggerBlock_triggerAction = MenuBlockRestore_cardRestore_VideoTriggerBlock_triggerAction_NavigateToBlockAction | MenuBlockRestore_cardRestore_VideoTriggerBlock_triggerAction_LinkAction | MenuBlockRestore_cardRestore_VideoTriggerBlock_triggerAction_EmailAction;

export interface MenuBlockRestore_cardRestore_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: MenuBlockRestore_cardRestore_VideoTriggerBlock_triggerAction;
}

export type MenuBlockRestore_cardRestore = MenuBlockRestore_cardRestore_GridContainerBlock | MenuBlockRestore_cardRestore_ButtonBlock | MenuBlockRestore_cardRestore_CardBlock | MenuBlockRestore_cardRestore_FormBlock | MenuBlockRestore_cardRestore_IconBlock | MenuBlockRestore_cardRestore_ImageBlock | MenuBlockRestore_cardRestore_RadioOptionBlock | MenuBlockRestore_cardRestore_RadioQuestionBlock | MenuBlockRestore_cardRestore_SignUpBlock | MenuBlockRestore_cardRestore_StepBlock | MenuBlockRestore_cardRestore_TextResponseBlock | MenuBlockRestore_cardRestore_TypographyBlock | MenuBlockRestore_cardRestore_VideoBlock | MenuBlockRestore_cardRestore_VideoTriggerBlock;

export interface MenuBlockRestore_typographyRestore_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface MenuBlockRestore_typographyRestore_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface MenuBlockRestore_typographyRestore_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface MenuBlockRestore_typographyRestore_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type MenuBlockRestore_typographyRestore_ButtonBlock_action = MenuBlockRestore_typographyRestore_ButtonBlock_action_NavigateToBlockAction | MenuBlockRestore_typographyRestore_ButtonBlock_action_LinkAction | MenuBlockRestore_typographyRestore_ButtonBlock_action_EmailAction;

export interface MenuBlockRestore_typographyRestore_ButtonBlock {
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
  action: MenuBlockRestore_typographyRestore_ButtonBlock_action | null;
}

export interface MenuBlockRestore_typographyRestore_CardBlock {
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

export interface MenuBlockRestore_typographyRestore_FormBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface MenuBlockRestore_typographyRestore_FormBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface MenuBlockRestore_typographyRestore_FormBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type MenuBlockRestore_typographyRestore_FormBlock_action = MenuBlockRestore_typographyRestore_FormBlock_action_NavigateToBlockAction | MenuBlockRestore_typographyRestore_FormBlock_action_LinkAction | MenuBlockRestore_typographyRestore_FormBlock_action_EmailAction;

export interface MenuBlockRestore_typographyRestore_FormBlock {
  __typename: "FormBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  form: any | null;
  action: MenuBlockRestore_typographyRestore_FormBlock_action | null;
}

export interface MenuBlockRestore_typographyRestore_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface MenuBlockRestore_typographyRestore_ImageBlock {
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

export interface MenuBlockRestore_typographyRestore_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface MenuBlockRestore_typographyRestore_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface MenuBlockRestore_typographyRestore_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type MenuBlockRestore_typographyRestore_RadioOptionBlock_action = MenuBlockRestore_typographyRestore_RadioOptionBlock_action_NavigateToBlockAction | MenuBlockRestore_typographyRestore_RadioOptionBlock_action_LinkAction | MenuBlockRestore_typographyRestore_RadioOptionBlock_action_EmailAction;

export interface MenuBlockRestore_typographyRestore_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: MenuBlockRestore_typographyRestore_RadioOptionBlock_action | null;
}

export interface MenuBlockRestore_typographyRestore_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface MenuBlockRestore_typographyRestore_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface MenuBlockRestore_typographyRestore_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface MenuBlockRestore_typographyRestore_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type MenuBlockRestore_typographyRestore_SignUpBlock_action = MenuBlockRestore_typographyRestore_SignUpBlock_action_NavigateToBlockAction | MenuBlockRestore_typographyRestore_SignUpBlock_action_LinkAction | MenuBlockRestore_typographyRestore_SignUpBlock_action_EmailAction;

export interface MenuBlockRestore_typographyRestore_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: MenuBlockRestore_typographyRestore_SignUpBlock_action | null;
}

export interface MenuBlockRestore_typographyRestore_StepBlock {
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

export interface MenuBlockRestore_typographyRestore_TextResponseBlock {
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

export interface MenuBlockRestore_typographyRestore_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
}

export interface MenuBlockRestore_typographyRestore_VideoBlock_video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface MenuBlockRestore_typographyRestore_VideoBlock_video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface MenuBlockRestore_typographyRestore_VideoBlock_video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface MenuBlockRestore_typographyRestore_VideoBlock_video_variantLanguages {
  __typename: "Language";
  id: string;
  name: MenuBlockRestore_typographyRestore_VideoBlock_video_variantLanguages_name[];
}

export interface MenuBlockRestore_typographyRestore_VideoBlock_video {
  __typename: "Video";
  id: string;
  title: MenuBlockRestore_typographyRestore_VideoBlock_video_title[];
  image: string | null;
  variant: MenuBlockRestore_typographyRestore_VideoBlock_video_variant | null;
  variantLanguages: MenuBlockRestore_typographyRestore_VideoBlock_video_variantLanguages[];
}

export interface MenuBlockRestore_typographyRestore_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface MenuBlockRestore_typographyRestore_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface MenuBlockRestore_typographyRestore_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type MenuBlockRestore_typographyRestore_VideoBlock_action = MenuBlockRestore_typographyRestore_VideoBlock_action_NavigateToBlockAction | MenuBlockRestore_typographyRestore_VideoBlock_action_LinkAction | MenuBlockRestore_typographyRestore_VideoBlock_action_EmailAction;

export interface MenuBlockRestore_typographyRestore_VideoBlock {
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
  video: MenuBlockRestore_typographyRestore_VideoBlock_video | null;
  /**
   * action that should be performed when the video ends
   */
  action: MenuBlockRestore_typographyRestore_VideoBlock_action | null;
}

export interface MenuBlockRestore_typographyRestore_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface MenuBlockRestore_typographyRestore_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface MenuBlockRestore_typographyRestore_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type MenuBlockRestore_typographyRestore_VideoTriggerBlock_triggerAction = MenuBlockRestore_typographyRestore_VideoTriggerBlock_triggerAction_NavigateToBlockAction | MenuBlockRestore_typographyRestore_VideoTriggerBlock_triggerAction_LinkAction | MenuBlockRestore_typographyRestore_VideoTriggerBlock_triggerAction_EmailAction;

export interface MenuBlockRestore_typographyRestore_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: MenuBlockRestore_typographyRestore_VideoTriggerBlock_triggerAction;
}

export type MenuBlockRestore_typographyRestore = MenuBlockRestore_typographyRestore_GridContainerBlock | MenuBlockRestore_typographyRestore_ButtonBlock | MenuBlockRestore_typographyRestore_CardBlock | MenuBlockRestore_typographyRestore_FormBlock | MenuBlockRestore_typographyRestore_IconBlock | MenuBlockRestore_typographyRestore_ImageBlock | MenuBlockRestore_typographyRestore_RadioOptionBlock | MenuBlockRestore_typographyRestore_RadioQuestionBlock | MenuBlockRestore_typographyRestore_SignUpBlock | MenuBlockRestore_typographyRestore_StepBlock | MenuBlockRestore_typographyRestore_TextResponseBlock | MenuBlockRestore_typographyRestore_TypographyBlock | MenuBlockRestore_typographyRestore_VideoBlock | MenuBlockRestore_typographyRestore_VideoTriggerBlock;

export interface MenuBlockRestore_journeyUpdate_menuStepBlock {
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

export interface MenuBlockRestore_journeyUpdate {
  __typename: "Journey";
  menuStepBlock: MenuBlockRestore_journeyUpdate_menuStepBlock | null;
}

export interface MenuBlockRestore {
  /**
   * blockRestore is used for redo/undo
   */
  stepRestore: MenuBlockRestore_stepRestore[];
  /**
   * blockRestore is used for redo/undo
   */
  cardRestore: MenuBlockRestore_cardRestore[];
  /**
   * blockRestore is used for redo/undo
   */
  typographyRestore: MenuBlockRestore_typographyRestore[];
  journeyUpdate: MenuBlockRestore_journeyUpdate;
}

export interface MenuBlockRestoreVariables {
  journeyId: string;
  stepId: string;
  cardId: string;
  typographyId: string;
  journeyUpdateInput: JourneyUpdateInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { BlockDuplicateIdMap, ButtonVariant, ButtonColor, ButtonSize, ThemeMode, ThemeName, IconName, IconSize, IconColor, TextResponseType, TypographyAlign, TypographyVariant, VideoBlockSource, VideoBlockObjectFit } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: StepDuplicate
// ====================================================

export interface StepDuplicate_blockDuplicate_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface StepDuplicate_blockDuplicate_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface StepDuplicate_blockDuplicate_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface StepDuplicate_blockDuplicate_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type StepDuplicate_blockDuplicate_ButtonBlock_action = StepDuplicate_blockDuplicate_ButtonBlock_action_NavigateToBlockAction | StepDuplicate_blockDuplicate_ButtonBlock_action_LinkAction | StepDuplicate_blockDuplicate_ButtonBlock_action_EmailAction;

export interface StepDuplicate_blockDuplicate_ButtonBlock {
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
  action: StepDuplicate_blockDuplicate_ButtonBlock_action | null;
}

export interface StepDuplicate_blockDuplicate_CardBlock {
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

export interface StepDuplicate_blockDuplicate_FormBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface StepDuplicate_blockDuplicate_FormBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface StepDuplicate_blockDuplicate_FormBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type StepDuplicate_blockDuplicate_FormBlock_action = StepDuplicate_blockDuplicate_FormBlock_action_NavigateToBlockAction | StepDuplicate_blockDuplicate_FormBlock_action_LinkAction | StepDuplicate_blockDuplicate_FormBlock_action_EmailAction;

export interface StepDuplicate_blockDuplicate_FormBlock {
  __typename: "FormBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  form: any | null;
  action: StepDuplicate_blockDuplicate_FormBlock_action | null;
}

export interface StepDuplicate_blockDuplicate_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface StepDuplicate_blockDuplicate_ImageBlock {
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

export interface StepDuplicate_blockDuplicate_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface StepDuplicate_blockDuplicate_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface StepDuplicate_blockDuplicate_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type StepDuplicate_blockDuplicate_RadioOptionBlock_action = StepDuplicate_blockDuplicate_RadioOptionBlock_action_NavigateToBlockAction | StepDuplicate_blockDuplicate_RadioOptionBlock_action_LinkAction | StepDuplicate_blockDuplicate_RadioOptionBlock_action_EmailAction;

export interface StepDuplicate_blockDuplicate_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: StepDuplicate_blockDuplicate_RadioOptionBlock_action | null;
}

export interface StepDuplicate_blockDuplicate_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface StepDuplicate_blockDuplicate_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface StepDuplicate_blockDuplicate_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface StepDuplicate_blockDuplicate_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type StepDuplicate_blockDuplicate_SignUpBlock_action = StepDuplicate_blockDuplicate_SignUpBlock_action_NavigateToBlockAction | StepDuplicate_blockDuplicate_SignUpBlock_action_LinkAction | StepDuplicate_blockDuplicate_SignUpBlock_action_EmailAction;

export interface StepDuplicate_blockDuplicate_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: StepDuplicate_blockDuplicate_SignUpBlock_action | null;
}

export interface StepDuplicate_blockDuplicate_StepBlock {
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

export interface StepDuplicate_blockDuplicate_TextResponseBlock {
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

export interface StepDuplicate_blockDuplicate_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  customColor: string | null;
  content: string;
  variant: TypographyVariant | null;
}

export interface StepDuplicate_blockDuplicate_VideoBlock_video_title {
  __typename: "Translation";
  value: string;
}

export interface StepDuplicate_blockDuplicate_VideoBlock_video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface StepDuplicate_blockDuplicate_VideoBlock_video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface StepDuplicate_blockDuplicate_VideoBlock_video_variantLanguages {
  __typename: "Language";
  id: string;
  name: StepDuplicate_blockDuplicate_VideoBlock_video_variantLanguages_name[];
}

export interface StepDuplicate_blockDuplicate_VideoBlock_video {
  __typename: "Video";
  id: string;
  title: StepDuplicate_blockDuplicate_VideoBlock_video_title[];
  image: string | null;
  variant: StepDuplicate_blockDuplicate_VideoBlock_video_variant | null;
  variantLanguages: StepDuplicate_blockDuplicate_VideoBlock_video_variantLanguages[];
}

export interface StepDuplicate_blockDuplicate_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface StepDuplicate_blockDuplicate_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface StepDuplicate_blockDuplicate_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type StepDuplicate_blockDuplicate_VideoBlock_action = StepDuplicate_blockDuplicate_VideoBlock_action_NavigateToBlockAction | StepDuplicate_blockDuplicate_VideoBlock_action_LinkAction | StepDuplicate_blockDuplicate_VideoBlock_action_EmailAction;

export interface StepDuplicate_blockDuplicate_VideoBlock {
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
  video: StepDuplicate_blockDuplicate_VideoBlock_video | null;
  /**
   * action that should be performed when the video ends
   */
  action: StepDuplicate_blockDuplicate_VideoBlock_action | null;
}

export interface StepDuplicate_blockDuplicate_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface StepDuplicate_blockDuplicate_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface StepDuplicate_blockDuplicate_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type StepDuplicate_blockDuplicate_VideoTriggerBlock_triggerAction = StepDuplicate_blockDuplicate_VideoTriggerBlock_triggerAction_NavigateToBlockAction | StepDuplicate_blockDuplicate_VideoTriggerBlock_triggerAction_LinkAction | StepDuplicate_blockDuplicate_VideoTriggerBlock_triggerAction_EmailAction;

export interface StepDuplicate_blockDuplicate_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: StepDuplicate_blockDuplicate_VideoTriggerBlock_triggerAction;
}

export type StepDuplicate_blockDuplicate = StepDuplicate_blockDuplicate_GridContainerBlock | StepDuplicate_blockDuplicate_ButtonBlock | StepDuplicate_blockDuplicate_CardBlock | StepDuplicate_blockDuplicate_FormBlock | StepDuplicate_blockDuplicate_IconBlock | StepDuplicate_blockDuplicate_ImageBlock | StepDuplicate_blockDuplicate_RadioOptionBlock | StepDuplicate_blockDuplicate_RadioQuestionBlock | StepDuplicate_blockDuplicate_SignUpBlock | StepDuplicate_blockDuplicate_StepBlock | StepDuplicate_blockDuplicate_TextResponseBlock | StepDuplicate_blockDuplicate_TypographyBlock | StepDuplicate_blockDuplicate_VideoBlock | StepDuplicate_blockDuplicate_VideoTriggerBlock;

export interface StepDuplicate {
  /**
   * blockDuplicate returns the updated block, it's children and sibling blocks on successful duplicate
   */
  blockDuplicate: StepDuplicate_blockDuplicate[];
}

export interface StepDuplicateVariables {
  id: string;
  journeyId: string;
  parentOrder?: number | null;
  idMap?: BlockDuplicateIdMap[] | null;
  x?: number | null;
  y?: number | null;
}

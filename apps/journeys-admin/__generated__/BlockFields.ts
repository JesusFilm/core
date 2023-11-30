/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ButtonVariant, ButtonColor, ButtonSize, ThemeMode, ThemeName, IconName, IconSize, IconColor, TypographyAlign, TypographyColor, TypographyVariant, VideoBlockSource, VideoBlockObjectFit } from "./globalTypes";

// ====================================================
// GraphQL fragment: BlockFields
// ====================================================

export interface BlockFields_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface BlockFields_ButtonBlock_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface BlockFields_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface BlockFields_ButtonBlock_action_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface BlockFields_ButtonBlock_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: BlockFields_ButtonBlock_action_NavigateToJourneyAction_journey_language;
}

export interface BlockFields_ButtonBlock_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: BlockFields_ButtonBlock_action_NavigateToJourneyAction_journey | null;
}

export interface BlockFields_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface BlockFields_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type BlockFields_ButtonBlock_action = BlockFields_ButtonBlock_action_NavigateAction | BlockFields_ButtonBlock_action_NavigateToBlockAction | BlockFields_ButtonBlock_action_NavigateToJourneyAction | BlockFields_ButtonBlock_action_LinkAction | BlockFields_ButtonBlock_action_EmailAction;

export interface BlockFields_ButtonBlock {
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
  action: BlockFields_ButtonBlock_action | null;
}

export interface BlockFields_CardBlock {
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

export interface BlockFields_FormBlock_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface BlockFields_FormBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface BlockFields_FormBlock_action_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface BlockFields_FormBlock_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: BlockFields_FormBlock_action_NavigateToJourneyAction_journey_language;
}

export interface BlockFields_FormBlock_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: BlockFields_FormBlock_action_NavigateToJourneyAction_journey | null;
}

export interface BlockFields_FormBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface BlockFields_FormBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type BlockFields_FormBlock_action = BlockFields_FormBlock_action_NavigateAction | BlockFields_FormBlock_action_NavigateToBlockAction | BlockFields_FormBlock_action_NavigateToJourneyAction | BlockFields_FormBlock_action_LinkAction | BlockFields_FormBlock_action_EmailAction;

export interface BlockFields_FormBlock {
  __typename: "FormBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  projectId: string | null;
  apiToken: string | null;
  formSlug: string | null;
  action: BlockFields_FormBlock_action | null;
}

export interface BlockFields_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface BlockFields_ImageBlock {
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

export interface BlockFields_RadioOptionBlock_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface BlockFields_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface BlockFields_RadioOptionBlock_action_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface BlockFields_RadioOptionBlock_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: BlockFields_RadioOptionBlock_action_NavigateToJourneyAction_journey_language;
}

export interface BlockFields_RadioOptionBlock_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: BlockFields_RadioOptionBlock_action_NavigateToJourneyAction_journey | null;
}

export interface BlockFields_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface BlockFields_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type BlockFields_RadioOptionBlock_action = BlockFields_RadioOptionBlock_action_NavigateAction | BlockFields_RadioOptionBlock_action_NavigateToBlockAction | BlockFields_RadioOptionBlock_action_NavigateToJourneyAction | BlockFields_RadioOptionBlock_action_LinkAction | BlockFields_RadioOptionBlock_action_EmailAction;

export interface BlockFields_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: BlockFields_RadioOptionBlock_action | null;
}

export interface BlockFields_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface BlockFields_SignUpBlock_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface BlockFields_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface BlockFields_SignUpBlock_action_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface BlockFields_SignUpBlock_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: BlockFields_SignUpBlock_action_NavigateToJourneyAction_journey_language;
}

export interface BlockFields_SignUpBlock_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: BlockFields_SignUpBlock_action_NavigateToJourneyAction_journey | null;
}

export interface BlockFields_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface BlockFields_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type BlockFields_SignUpBlock_action = BlockFields_SignUpBlock_action_NavigateAction | BlockFields_SignUpBlock_action_NavigateToBlockAction | BlockFields_SignUpBlock_action_NavigateToJourneyAction | BlockFields_SignUpBlock_action_LinkAction | BlockFields_SignUpBlock_action_EmailAction;

export interface BlockFields_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: BlockFields_SignUpBlock_action | null;
}

export interface BlockFields_StepBlock {
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
   * nextBlockId contains the preferred block to navigate to when a
   * NavigateAction occurs or if the user manually tries to advance to the next
   * step. If no nextBlockId is set it will automatically navigate to the next
   * step in the journey based on parentOrder.
   */
  nextBlockId: string | null;
}

export interface BlockFields_TextResponseBlock_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface BlockFields_TextResponseBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface BlockFields_TextResponseBlock_action_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface BlockFields_TextResponseBlock_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: BlockFields_TextResponseBlock_action_NavigateToJourneyAction_journey_language;
}

export interface BlockFields_TextResponseBlock_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: BlockFields_TextResponseBlock_action_NavigateToJourneyAction_journey | null;
}

export interface BlockFields_TextResponseBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface BlockFields_TextResponseBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type BlockFields_TextResponseBlock_action = BlockFields_TextResponseBlock_action_NavigateAction | BlockFields_TextResponseBlock_action_NavigateToBlockAction | BlockFields_TextResponseBlock_action_NavigateToJourneyAction | BlockFields_TextResponseBlock_action_LinkAction | BlockFields_TextResponseBlock_action_EmailAction;

export interface BlockFields_TextResponseBlock {
  __typename: "TextResponseBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  hint: string | null;
  minRows: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: BlockFields_TextResponseBlock_action | null;
}

export interface BlockFields_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
}

export interface BlockFields_VideoBlock_video_title {
  __typename: "Translation";
  value: string;
}

export interface BlockFields_VideoBlock_video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface BlockFields_VideoBlock_video {
  __typename: "Video";
  id: string;
  title: BlockFields_VideoBlock_video_title[];
  image: string | null;
  variant: BlockFields_VideoBlock_video_variant | null;
}

export interface BlockFields_VideoBlock_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface BlockFields_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface BlockFields_VideoBlock_action_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface BlockFields_VideoBlock_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: BlockFields_VideoBlock_action_NavigateToJourneyAction_journey_language;
}

export interface BlockFields_VideoBlock_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: BlockFields_VideoBlock_action_NavigateToJourneyAction_journey | null;
}

export interface BlockFields_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface BlockFields_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type BlockFields_VideoBlock_action = BlockFields_VideoBlock_action_NavigateAction | BlockFields_VideoBlock_action_NavigateToBlockAction | BlockFields_VideoBlock_action_NavigateToJourneyAction | BlockFields_VideoBlock_action_LinkAction | BlockFields_VideoBlock_action_EmailAction;

export interface BlockFields_VideoBlock {
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
  video: BlockFields_VideoBlock_video | null;
  /**
   * action that should be performed when the video ends
   */
  action: BlockFields_VideoBlock_action | null;
}

export interface BlockFields_VideoTriggerBlock_triggerAction_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface BlockFields_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface BlockFields_VideoTriggerBlock_triggerAction_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface BlockFields_VideoTriggerBlock_triggerAction_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: BlockFields_VideoTriggerBlock_triggerAction_NavigateToJourneyAction_journey_language;
}

export interface BlockFields_VideoTriggerBlock_triggerAction_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: BlockFields_VideoTriggerBlock_triggerAction_NavigateToJourneyAction_journey | null;
}

export interface BlockFields_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface BlockFields_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type BlockFields_VideoTriggerBlock_triggerAction = BlockFields_VideoTriggerBlock_triggerAction_NavigateAction | BlockFields_VideoTriggerBlock_triggerAction_NavigateToBlockAction | BlockFields_VideoTriggerBlock_triggerAction_NavigateToJourneyAction | BlockFields_VideoTriggerBlock_triggerAction_LinkAction | BlockFields_VideoTriggerBlock_triggerAction_EmailAction;

export interface BlockFields_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: BlockFields_VideoTriggerBlock_triggerAction;
}

export type BlockFields = BlockFields_GridContainerBlock | BlockFields_ButtonBlock | BlockFields_CardBlock | BlockFields_FormBlock | BlockFields_IconBlock | BlockFields_ImageBlock | BlockFields_RadioOptionBlock | BlockFields_RadioQuestionBlock | BlockFields_SignUpBlock | BlockFields_StepBlock | BlockFields_TextResponseBlock | BlockFields_TypographyBlock | BlockFields_VideoBlock | BlockFields_VideoTriggerBlock;

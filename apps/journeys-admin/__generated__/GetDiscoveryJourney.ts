/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ThemeName, ThemeMode, ButtonVariant, ButtonColor, ButtonSize, IconName, IconSize, IconColor, TypographyAlign, TypographyColor, TypographyVariant, VideoBlockSource, VideoBlockObjectFit } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetDiscoveryJourney
// ====================================================

export interface GetDiscoveryJourney_discoveryJourney_blocks_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_ButtonBlock_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_ButtonBlock_action_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_ButtonBlock_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: GetDiscoveryJourney_discoveryJourney_blocks_ButtonBlock_action_NavigateToJourneyAction_journey_language;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_ButtonBlock_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: GetDiscoveryJourney_discoveryJourney_blocks_ButtonBlock_action_NavigateToJourneyAction_journey | null;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type GetDiscoveryJourney_discoveryJourney_blocks_ButtonBlock_action = GetDiscoveryJourney_discoveryJourney_blocks_ButtonBlock_action_NavigateAction | GetDiscoveryJourney_discoveryJourney_blocks_ButtonBlock_action_NavigateToBlockAction | GetDiscoveryJourney_discoveryJourney_blocks_ButtonBlock_action_NavigateToJourneyAction | GetDiscoveryJourney_discoveryJourney_blocks_ButtonBlock_action_LinkAction | GetDiscoveryJourney_discoveryJourney_blocks_ButtonBlock_action_EmailAction;

export interface GetDiscoveryJourney_discoveryJourney_blocks_ButtonBlock {
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
  action: GetDiscoveryJourney_discoveryJourney_blocks_ButtonBlock_action | null;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_CardBlock {
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

export interface GetDiscoveryJourney_discoveryJourney_blocks_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_ImageBlock {
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

export interface GetDiscoveryJourney_discoveryJourney_blocks_RadioOptionBlock_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_RadioOptionBlock_action_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_RadioOptionBlock_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: GetDiscoveryJourney_discoveryJourney_blocks_RadioOptionBlock_action_NavigateToJourneyAction_journey_language;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_RadioOptionBlock_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: GetDiscoveryJourney_discoveryJourney_blocks_RadioOptionBlock_action_NavigateToJourneyAction_journey | null;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type GetDiscoveryJourney_discoveryJourney_blocks_RadioOptionBlock_action = GetDiscoveryJourney_discoveryJourney_blocks_RadioOptionBlock_action_NavigateAction | GetDiscoveryJourney_discoveryJourney_blocks_RadioOptionBlock_action_NavigateToBlockAction | GetDiscoveryJourney_discoveryJourney_blocks_RadioOptionBlock_action_NavigateToJourneyAction | GetDiscoveryJourney_discoveryJourney_blocks_RadioOptionBlock_action_LinkAction | GetDiscoveryJourney_discoveryJourney_blocks_RadioOptionBlock_action_EmailAction;

export interface GetDiscoveryJourney_discoveryJourney_blocks_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: GetDiscoveryJourney_discoveryJourney_blocks_RadioOptionBlock_action | null;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_SignUpBlock_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_SignUpBlock_action_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_SignUpBlock_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: GetDiscoveryJourney_discoveryJourney_blocks_SignUpBlock_action_NavigateToJourneyAction_journey_language;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_SignUpBlock_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: GetDiscoveryJourney_discoveryJourney_blocks_SignUpBlock_action_NavigateToJourneyAction_journey | null;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type GetDiscoveryJourney_discoveryJourney_blocks_SignUpBlock_action = GetDiscoveryJourney_discoveryJourney_blocks_SignUpBlock_action_NavigateAction | GetDiscoveryJourney_discoveryJourney_blocks_SignUpBlock_action_NavigateToBlockAction | GetDiscoveryJourney_discoveryJourney_blocks_SignUpBlock_action_NavigateToJourneyAction | GetDiscoveryJourney_discoveryJourney_blocks_SignUpBlock_action_LinkAction | GetDiscoveryJourney_discoveryJourney_blocks_SignUpBlock_action_EmailAction;

export interface GetDiscoveryJourney_discoveryJourney_blocks_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: GetDiscoveryJourney_discoveryJourney_blocks_SignUpBlock_action | null;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_StepBlock {
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

export interface GetDiscoveryJourney_discoveryJourney_blocks_TextResponseBlock_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_TextResponseBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_TextResponseBlock_action_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_TextResponseBlock_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: GetDiscoveryJourney_discoveryJourney_blocks_TextResponseBlock_action_NavigateToJourneyAction_journey_language;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_TextResponseBlock_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: GetDiscoveryJourney_discoveryJourney_blocks_TextResponseBlock_action_NavigateToJourneyAction_journey | null;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_TextResponseBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_TextResponseBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type GetDiscoveryJourney_discoveryJourney_blocks_TextResponseBlock_action = GetDiscoveryJourney_discoveryJourney_blocks_TextResponseBlock_action_NavigateAction | GetDiscoveryJourney_discoveryJourney_blocks_TextResponseBlock_action_NavigateToBlockAction | GetDiscoveryJourney_discoveryJourney_blocks_TextResponseBlock_action_NavigateToJourneyAction | GetDiscoveryJourney_discoveryJourney_blocks_TextResponseBlock_action_LinkAction | GetDiscoveryJourney_discoveryJourney_blocks_TextResponseBlock_action_EmailAction;

export interface GetDiscoveryJourney_discoveryJourney_blocks_TextResponseBlock {
  __typename: "TextResponseBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  hint: string | null;
  minRows: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: GetDiscoveryJourney_discoveryJourney_blocks_TextResponseBlock_action | null;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_VideoBlock_video_title {
  __typename: "Translation";
  value: string;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_VideoBlock_video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_VideoBlock_video {
  __typename: "Video";
  id: string;
  title: GetDiscoveryJourney_discoveryJourney_blocks_VideoBlock_video_title[];
  image: string | null;
  variant: GetDiscoveryJourney_discoveryJourney_blocks_VideoBlock_video_variant | null;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_VideoBlock_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_VideoBlock_action_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_VideoBlock_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: GetDiscoveryJourney_discoveryJourney_blocks_VideoBlock_action_NavigateToJourneyAction_journey_language;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_VideoBlock_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: GetDiscoveryJourney_discoveryJourney_blocks_VideoBlock_action_NavigateToJourneyAction_journey | null;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type GetDiscoveryJourney_discoveryJourney_blocks_VideoBlock_action = GetDiscoveryJourney_discoveryJourney_blocks_VideoBlock_action_NavigateAction | GetDiscoveryJourney_discoveryJourney_blocks_VideoBlock_action_NavigateToBlockAction | GetDiscoveryJourney_discoveryJourney_blocks_VideoBlock_action_NavigateToJourneyAction | GetDiscoveryJourney_discoveryJourney_blocks_VideoBlock_action_LinkAction | GetDiscoveryJourney_discoveryJourney_blocks_VideoBlock_action_EmailAction;

export interface GetDiscoveryJourney_discoveryJourney_blocks_VideoBlock {
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
  video: GetDiscoveryJourney_discoveryJourney_blocks_VideoBlock_video | null;
  /**
   * action that should be performed when the video ends
   */
  action: GetDiscoveryJourney_discoveryJourney_blocks_VideoBlock_action | null;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_VideoTriggerBlock_triggerAction_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_VideoTriggerBlock_triggerAction_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_VideoTriggerBlock_triggerAction_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: GetDiscoveryJourney_discoveryJourney_blocks_VideoTriggerBlock_triggerAction_NavigateToJourneyAction_journey_language;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_VideoTriggerBlock_triggerAction_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: GetDiscoveryJourney_discoveryJourney_blocks_VideoTriggerBlock_triggerAction_NavigateToJourneyAction_journey | null;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface GetDiscoveryJourney_discoveryJourney_blocks_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type GetDiscoveryJourney_discoveryJourney_blocks_VideoTriggerBlock_triggerAction = GetDiscoveryJourney_discoveryJourney_blocks_VideoTriggerBlock_triggerAction_NavigateAction | GetDiscoveryJourney_discoveryJourney_blocks_VideoTriggerBlock_triggerAction_NavigateToBlockAction | GetDiscoveryJourney_discoveryJourney_blocks_VideoTriggerBlock_triggerAction_NavigateToJourneyAction | GetDiscoveryJourney_discoveryJourney_blocks_VideoTriggerBlock_triggerAction_LinkAction | GetDiscoveryJourney_discoveryJourney_blocks_VideoTriggerBlock_triggerAction_EmailAction;

export interface GetDiscoveryJourney_discoveryJourney_blocks_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: GetDiscoveryJourney_discoveryJourney_blocks_VideoTriggerBlock_triggerAction;
}

export type GetDiscoveryJourney_discoveryJourney_blocks = GetDiscoveryJourney_discoveryJourney_blocks_GridContainerBlock | GetDiscoveryJourney_discoveryJourney_blocks_ButtonBlock | GetDiscoveryJourney_discoveryJourney_blocks_CardBlock | GetDiscoveryJourney_discoveryJourney_blocks_IconBlock | GetDiscoveryJourney_discoveryJourney_blocks_ImageBlock | GetDiscoveryJourney_discoveryJourney_blocks_RadioOptionBlock | GetDiscoveryJourney_discoveryJourney_blocks_RadioQuestionBlock | GetDiscoveryJourney_discoveryJourney_blocks_SignUpBlock | GetDiscoveryJourney_discoveryJourney_blocks_StepBlock | GetDiscoveryJourney_discoveryJourney_blocks_TextResponseBlock | GetDiscoveryJourney_discoveryJourney_blocks_TypographyBlock | GetDiscoveryJourney_discoveryJourney_blocks_VideoBlock | GetDiscoveryJourney_discoveryJourney_blocks_VideoTriggerBlock;

export interface GetDiscoveryJourney_discoveryJourney {
  __typename: "Journey";
  id: string;
  themeName: ThemeName;
  themeMode: ThemeMode;
  blocks: GetDiscoveryJourney_discoveryJourney_blocks[] | null;
}

export interface GetDiscoveryJourney {
  discoveryJourney: GetDiscoveryJourney_discoveryJourney | null;
}

export interface GetDiscoveryJourneyVariables {
  id: string;
}

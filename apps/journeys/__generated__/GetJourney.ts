/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ThemeName, ThemeMode, ButtonVariant, ButtonColor, ButtonSize, GridDirection, GridJustifyContent, GridAlignItems, IconName, IconSize, IconColor, TypographyAlign, TypographyColor, TypographyVariant } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJourney
// ====================================================

export interface GetJourney_journey_primaryImageBlock {
  __typename: "ImageBlock";
  src: string | null;
}

export interface GetJourney_journey_blocks_ButtonBlock_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface GetJourney_journey_blocks_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetJourney_journey_blocks_ButtonBlock_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
}

export interface GetJourney_journey_blocks_ButtonBlock_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: GetJourney_journey_blocks_ButtonBlock_action_NavigateToJourneyAction_journey | null;
}

export interface GetJourney_journey_blocks_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export type GetJourney_journey_blocks_ButtonBlock_action = GetJourney_journey_blocks_ButtonBlock_action_NavigateAction | GetJourney_journey_blocks_ButtonBlock_action_NavigateToBlockAction | GetJourney_journey_blocks_ButtonBlock_action_NavigateToJourneyAction | GetJourney_journey_blocks_ButtonBlock_action_LinkAction;

export interface GetJourney_journey_blocks_ButtonBlock {
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
  action: GetJourney_journey_blocks_ButtonBlock_action | null;
}

export interface GetJourney_journey_blocks_CardBlock {
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

export interface GetJourney_journey_blocks_GridContainerBlock {
  __typename: "GridContainerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number;
  direction: GridDirection;
  justifyContent: GridJustifyContent;
  alignItems: GridAlignItems;
}

export interface GetJourney_journey_blocks_GridItemBlock {
  __typename: "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  xl: number;
  lg: number;
  sm: number;
}

export interface GetJourney_journey_blocks_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface GetJourney_journey_blocks_ImageBlock {
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

export interface GetJourney_journey_blocks_RadioOptionBlock_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface GetJourney_journey_blocks_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetJourney_journey_blocks_RadioOptionBlock_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
}

export interface GetJourney_journey_blocks_RadioOptionBlock_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: GetJourney_journey_blocks_RadioOptionBlock_action_NavigateToJourneyAction_journey | null;
}

export interface GetJourney_journey_blocks_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export type GetJourney_journey_blocks_RadioOptionBlock_action = GetJourney_journey_blocks_RadioOptionBlock_action_NavigateAction | GetJourney_journey_blocks_RadioOptionBlock_action_NavigateToBlockAction | GetJourney_journey_blocks_RadioOptionBlock_action_NavigateToJourneyAction | GetJourney_journey_blocks_RadioOptionBlock_action_LinkAction;

export interface GetJourney_journey_blocks_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: GetJourney_journey_blocks_RadioOptionBlock_action | null;
}

export interface GetJourney_journey_blocks_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  description: string | null;
}

export interface GetJourney_journey_blocks_SignUpBlock_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface GetJourney_journey_blocks_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetJourney_journey_blocks_SignUpBlock_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
}

export interface GetJourney_journey_blocks_SignUpBlock_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: GetJourney_journey_blocks_SignUpBlock_action_NavigateToJourneyAction_journey | null;
}

export interface GetJourney_journey_blocks_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export type GetJourney_journey_blocks_SignUpBlock_action = GetJourney_journey_blocks_SignUpBlock_action_NavigateAction | GetJourney_journey_blocks_SignUpBlock_action_NavigateToBlockAction | GetJourney_journey_blocks_SignUpBlock_action_NavigateToJourneyAction | GetJourney_journey_blocks_SignUpBlock_action_LinkAction;

export interface GetJourney_journey_blocks_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: GetJourney_journey_blocks_SignUpBlock_action | null;
}

export interface GetJourney_journey_blocks_StepBlock {
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
   * step. If no nextBlockId is set it can be assumed that this step represents
   * the end of the current journey.
   */
  nextBlockId: string | null;
}

export interface GetJourney_journey_blocks_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
}

export interface GetJourney_journey_blocks_VideoBlock_video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string;
}

export interface GetJourney_journey_blocks_VideoBlock_video {
  __typename: "Video";
  id: string;
  variant: GetJourney_journey_blocks_VideoBlock_video_variant | null;
}

export interface GetJourney_journey_blocks_VideoBlock {
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
   * videoId and videoVariantLanguageId both need to be set to select a video
   */
  videoId: string | null;
  /**
   * videoId and videoVariantLanguageId both need to be set to select a video
   */
  videoVariantLanguageId: string | null;
  video: GetJourney_journey_blocks_VideoBlock_video | null;
}

export interface GetJourney_journey_blocks_VideoTriggerBlock_triggerAction_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface GetJourney_journey_blocks_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetJourney_journey_blocks_VideoTriggerBlock_triggerAction_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
}

export interface GetJourney_journey_blocks_VideoTriggerBlock_triggerAction_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: GetJourney_journey_blocks_VideoTriggerBlock_triggerAction_NavigateToJourneyAction_journey | null;
}

export interface GetJourney_journey_blocks_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export type GetJourney_journey_blocks_VideoTriggerBlock_triggerAction = GetJourney_journey_blocks_VideoTriggerBlock_triggerAction_NavigateAction | GetJourney_journey_blocks_VideoTriggerBlock_triggerAction_NavigateToBlockAction | GetJourney_journey_blocks_VideoTriggerBlock_triggerAction_NavigateToJourneyAction | GetJourney_journey_blocks_VideoTriggerBlock_triggerAction_LinkAction;

export interface GetJourney_journey_blocks_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: GetJourney_journey_blocks_VideoTriggerBlock_triggerAction;
}

export type GetJourney_journey_blocks = GetJourney_journey_blocks_ButtonBlock | GetJourney_journey_blocks_CardBlock | GetJourney_journey_blocks_GridContainerBlock | GetJourney_journey_blocks_GridItemBlock | GetJourney_journey_blocks_IconBlock | GetJourney_journey_blocks_ImageBlock | GetJourney_journey_blocks_RadioOptionBlock | GetJourney_journey_blocks_RadioQuestionBlock | GetJourney_journey_blocks_SignUpBlock | GetJourney_journey_blocks_StepBlock | GetJourney_journey_blocks_TypographyBlock | GetJourney_journey_blocks_VideoBlock | GetJourney_journey_blocks_VideoTriggerBlock;

export interface GetJourney_journey {
  __typename: "Journey";
  id: string;
  themeName: ThemeName;
  themeMode: ThemeMode;
  title: string;
  description: string | null;
  primaryImageBlock: GetJourney_journey_primaryImageBlock | null;
  blocks: GetJourney_journey_blocks[] | null;
}

export interface GetJourney {
  journey: GetJourney_journey | null;
}

export interface GetJourneyVariables {
  id: string;
}

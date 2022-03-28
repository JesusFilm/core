/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ButtonVariant, ButtonColor, ButtonSize, ThemeMode, ThemeName, GridDirection, GridJustifyContent, GridAlignItems, IconName, IconSize, IconColor, TypographyAlign, TypographyColor, TypographyVariant } from "./globalTypes";

// ====================================================
// GraphQL fragment: BlockFields
// ====================================================

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

export interface BlockFields_ButtonBlock_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
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

export type BlockFields_ButtonBlock_action = BlockFields_ButtonBlock_action_NavigateAction | BlockFields_ButtonBlock_action_NavigateToBlockAction | BlockFields_ButtonBlock_action_NavigateToJourneyAction | BlockFields_ButtonBlock_action_LinkAction;

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

export interface BlockFields_GridContainerBlock {
  __typename: "GridContainerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number;
  direction: GridDirection;
  justifyContent: GridJustifyContent;
  alignItems: GridAlignItems;
}

export interface BlockFields_GridItemBlock {
  __typename: "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  xl: number;
  lg: number;
  sm: number;
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

export interface BlockFields_RadioOptionBlock_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
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

export type BlockFields_RadioOptionBlock_action = BlockFields_RadioOptionBlock_action_NavigateAction | BlockFields_RadioOptionBlock_action_NavigateToBlockAction | BlockFields_RadioOptionBlock_action_NavigateToJourneyAction | BlockFields_RadioOptionBlock_action_LinkAction;

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
  label: string;
  description: string | null;
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

export interface BlockFields_SignUpBlock_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
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

export type BlockFields_SignUpBlock_action = BlockFields_SignUpBlock_action_NavigateAction | BlockFields_SignUpBlock_action_NavigateToBlockAction | BlockFields_SignUpBlock_action_NavigateToJourneyAction | BlockFields_SignUpBlock_action_LinkAction;

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
   * step. If no nextBlockId is set it can be assumed that this step represents
   * the end of the current journey.
   */
  nextBlockId: string | null;
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

export interface BlockFields_VideoBlock_video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string;
}

export interface BlockFields_VideoBlock_video {
  __typename: "Video";
  id: string;
  variant: BlockFields_VideoBlock_video_variant | null;
}

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
   * videoId and videoVariantLanguageId both need to be set to select a video
   */
  videoId: string | null;
  /**
   * videoId and videoVariantLanguageId both need to be set to select a video
   */
  videoVariantLanguageId: string | null;
  video: BlockFields_VideoBlock_video | null;
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

export interface BlockFields_VideoTriggerBlock_triggerAction_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
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

export type BlockFields_VideoTriggerBlock_triggerAction = BlockFields_VideoTriggerBlock_triggerAction_NavigateAction | BlockFields_VideoTriggerBlock_triggerAction_NavigateToBlockAction | BlockFields_VideoTriggerBlock_triggerAction_NavigateToJourneyAction | BlockFields_VideoTriggerBlock_triggerAction_LinkAction;

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

export type BlockFields = BlockFields_ButtonBlock | BlockFields_CardBlock | BlockFields_GridContainerBlock | BlockFields_GridItemBlock | BlockFields_IconBlock | BlockFields_ImageBlock | BlockFields_RadioOptionBlock | BlockFields_RadioQuestionBlock | BlockFields_SignUpBlock | BlockFields_StepBlock | BlockFields_TypographyBlock | BlockFields_VideoBlock | BlockFields_VideoTriggerBlock;

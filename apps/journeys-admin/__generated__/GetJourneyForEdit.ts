/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ThemeName, ThemeMode, ButtonVariant, ButtonColor, ButtonSize, IconName, IconColor, IconSize, GridDirection, GridJustifyContent, GridAlignItems, TypographyAlign, TypographyColor, TypographyVariant } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJourneyForEdit
// ====================================================

export interface GetJourneyForEdit_journey_blocks_ButtonBlock_startIcon {
  __typename: "Icon";
  name: IconName;
  color: IconColor | null;
  size: IconSize | null;
}

export interface GetJourneyForEdit_journey_blocks_ButtonBlock_endIcon {
  __typename: "Icon";
  name: IconName;
  color: IconColor | null;
  size: IconSize | null;
}

export interface GetJourneyForEdit_journey_blocks_ButtonBlock_action_NavigateAction {
  __typename: "NavigateAction";
  gtmEventName: string | null;
}

export interface GetJourneyForEdit_journey_blocks_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  gtmEventName: string | null;
  blockId: string;
}

export interface GetJourneyForEdit_journey_blocks_ButtonBlock_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
}

export interface GetJourneyForEdit_journey_blocks_ButtonBlock_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  gtmEventName: string | null;
  journey: GetJourneyForEdit_journey_blocks_ButtonBlock_action_NavigateToJourneyAction_journey | null;
}

export interface GetJourneyForEdit_journey_blocks_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  gtmEventName: string | null;
  url: string;
}

export type GetJourneyForEdit_journey_blocks_ButtonBlock_action = GetJourneyForEdit_journey_blocks_ButtonBlock_action_NavigateAction | GetJourneyForEdit_journey_blocks_ButtonBlock_action_NavigateToBlockAction | GetJourneyForEdit_journey_blocks_ButtonBlock_action_NavigateToJourneyAction | GetJourneyForEdit_journey_blocks_ButtonBlock_action_LinkAction;

export interface GetJourneyForEdit_journey_blocks_ButtonBlock {
  __typename: "ButtonBlock";
  id: string;
  parentBlockId: string | null;
  label: string;
  buttonVariant: ButtonVariant | null;
  buttonColor: ButtonColor | null;
  size: ButtonSize | null;
  startIcon: GetJourneyForEdit_journey_blocks_ButtonBlock_startIcon | null;
  endIcon: GetJourneyForEdit_journey_blocks_ButtonBlock_endIcon | null;
  action: GetJourneyForEdit_journey_blocks_ButtonBlock_action | null;
}

export interface GetJourneyForEdit_journey_blocks_CardBlock {
  __typename: "CardBlock";
  id: string;
  parentBlockId: string | null;
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

export interface GetJourneyForEdit_journey_blocks_GridContainerBlock {
  __typename: "GridContainerBlock";
  id: string;
  parentBlockId: string | null;
  spacing: number;
  direction: GridDirection;
  justifyContent: GridJustifyContent;
  alignItems: GridAlignItems;
}

export interface GetJourneyForEdit_journey_blocks_GridItemBlock {
  __typename: "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  xl: number;
  lg: number;
  sm: number;
}

export interface GetJourneyForEdit_journey_blocks_ImageBlock {
  __typename: "ImageBlock";
  id: string;
  parentBlockId: string | null;
  src: string;
  alt: string;
  width: number;
  height: number;
  /**
   * blurhash is a compact representation of a placeholder for an image.
   * Find a frontend implementation at https: // github.com/woltapp/blurhash
   */
  blurhash: string;
}

export interface GetJourneyForEdit_journey_blocks_RadioOptionBlock_action_NavigateAction {
  __typename: "NavigateAction";
  gtmEventName: string | null;
}

export interface GetJourneyForEdit_journey_blocks_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  gtmEventName: string | null;
  blockId: string;
}

export interface GetJourneyForEdit_journey_blocks_RadioOptionBlock_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
}

export interface GetJourneyForEdit_journey_blocks_RadioOptionBlock_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  gtmEventName: string | null;
  journey: GetJourneyForEdit_journey_blocks_RadioOptionBlock_action_NavigateToJourneyAction_journey | null;
}

export interface GetJourneyForEdit_journey_blocks_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  gtmEventName: string | null;
  url: string;
}

export type GetJourneyForEdit_journey_blocks_RadioOptionBlock_action = GetJourneyForEdit_journey_blocks_RadioOptionBlock_action_NavigateAction | GetJourneyForEdit_journey_blocks_RadioOptionBlock_action_NavigateToBlockAction | GetJourneyForEdit_journey_blocks_RadioOptionBlock_action_NavigateToJourneyAction | GetJourneyForEdit_journey_blocks_RadioOptionBlock_action_LinkAction;

export interface GetJourneyForEdit_journey_blocks_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  label: string;
  action: GetJourneyForEdit_journey_blocks_RadioOptionBlock_action | null;
}

export interface GetJourneyForEdit_journey_blocks_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  label: string;
  description: string | null;
}

export interface GetJourneyForEdit_journey_blocks_SignUpBlock_action_NavigateAction {
  __typename: "NavigateAction";
  gtmEventName: string | null;
}

export interface GetJourneyForEdit_journey_blocks_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  gtmEventName: string | null;
  blockId: string;
}

export interface GetJourneyForEdit_journey_blocks_SignUpBlock_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
}

export interface GetJourneyForEdit_journey_blocks_SignUpBlock_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  gtmEventName: string | null;
  journey: GetJourneyForEdit_journey_blocks_SignUpBlock_action_NavigateToJourneyAction_journey | null;
}

export interface GetJourneyForEdit_journey_blocks_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  gtmEventName: string | null;
  url: string;
}

export type GetJourneyForEdit_journey_blocks_SignUpBlock_action = GetJourneyForEdit_journey_blocks_SignUpBlock_action_NavigateAction | GetJourneyForEdit_journey_blocks_SignUpBlock_action_NavigateToBlockAction | GetJourneyForEdit_journey_blocks_SignUpBlock_action_NavigateToJourneyAction | GetJourneyForEdit_journey_blocks_SignUpBlock_action_LinkAction;

export interface GetJourneyForEdit_journey_blocks_SignUpBlock_submitIcon {
  __typename: "Icon";
  name: IconName;
  color: IconColor | null;
  size: IconSize | null;
}

export interface GetJourneyForEdit_journey_blocks_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  submitLabel: string | null;
  action: GetJourneyForEdit_journey_blocks_SignUpBlock_action | null;
  submitIcon: GetJourneyForEdit_journey_blocks_SignUpBlock_submitIcon | null;
}

export interface GetJourneyForEdit_journey_blocks_StepBlock {
  __typename: "StepBlock";
  id: string;
  parentBlockId: string | null;
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

export interface GetJourneyForEdit_journey_blocks_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
}

export interface GetJourneyForEdit_journey_blocks_VideoBlock_videoContent {
  __typename: "VideoArclight" | "VideoGeneric";
  src: string | null;
}

export interface GetJourneyForEdit_journey_blocks_VideoBlock {
  __typename: "VideoBlock";
  id: string;
  parentBlockId: string | null;
  title: string;
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
  videoContent: GetJourneyForEdit_journey_blocks_VideoBlock_videoContent;
}

export interface GetJourneyForEdit_journey_blocks_VideoTriggerBlock_triggerAction_NavigateAction {
  __typename: "NavigateAction";
  gtmEventName: string | null;
}

export interface GetJourneyForEdit_journey_blocks_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  gtmEventName: string | null;
  blockId: string;
}

export interface GetJourneyForEdit_journey_blocks_VideoTriggerBlock_triggerAction_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
}

export interface GetJourneyForEdit_journey_blocks_VideoTriggerBlock_triggerAction_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  gtmEventName: string | null;
  journey: GetJourneyForEdit_journey_blocks_VideoTriggerBlock_triggerAction_NavigateToJourneyAction_journey | null;
}

export interface GetJourneyForEdit_journey_blocks_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  gtmEventName: string | null;
  url: string;
}

export type GetJourneyForEdit_journey_blocks_VideoTriggerBlock_triggerAction = GetJourneyForEdit_journey_blocks_VideoTriggerBlock_triggerAction_NavigateAction | GetJourneyForEdit_journey_blocks_VideoTriggerBlock_triggerAction_NavigateToBlockAction | GetJourneyForEdit_journey_blocks_VideoTriggerBlock_triggerAction_NavigateToJourneyAction | GetJourneyForEdit_journey_blocks_VideoTriggerBlock_triggerAction_LinkAction;

export interface GetJourneyForEdit_journey_blocks_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: GetJourneyForEdit_journey_blocks_VideoTriggerBlock_triggerAction;
}

export type GetJourneyForEdit_journey_blocks = GetJourneyForEdit_journey_blocks_ButtonBlock | GetJourneyForEdit_journey_blocks_CardBlock | GetJourneyForEdit_journey_blocks_GridContainerBlock | GetJourneyForEdit_journey_blocks_GridItemBlock | GetJourneyForEdit_journey_blocks_ImageBlock | GetJourneyForEdit_journey_blocks_RadioOptionBlock | GetJourneyForEdit_journey_blocks_RadioQuestionBlock | GetJourneyForEdit_journey_blocks_SignUpBlock | GetJourneyForEdit_journey_blocks_StepBlock | GetJourneyForEdit_journey_blocks_TypographyBlock | GetJourneyForEdit_journey_blocks_VideoBlock | GetJourneyForEdit_journey_blocks_VideoTriggerBlock;

export interface GetJourneyForEdit_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  themeName: ThemeName;
  themeMode: ThemeMode;
  title: string;
  description: string | null;
  blocks: GetJourneyForEdit_journey_blocks[] | null;
}

export interface GetJourneyForEdit {
  journey: GetJourneyForEdit_journey | null;
}

export interface GetJourneyForEditVariables {
  id: string;
}

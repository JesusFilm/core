/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ThemeName, ThemeMode, ButtonVariant, ButtonColor, ButtonSize, IconName, IconColor, IconSize, TypographyAlign, TypographyColor, TypographyVariant } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: GetJourney
// ====================================================

export interface GetJourney_journey_primaryImageBlock {
  __typename: "ImageBlock";
  src: string;
}

export interface GetJourney_journey_blocks_CardBlock {
  __typename: "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock";
  id: string;
  parentBlockId: string | null;
}

export interface GetJourney_journey_blocks_ButtonBlock_startIcon {
  __typename: "Icon";
  name: IconName;
  color: IconColor | null;
  size: IconSize | null;
}

export interface GetJourney_journey_blocks_ButtonBlock_endIcon {
  __typename: "Icon";
  name: IconName;
  color: IconColor | null;
  size: IconSize | null;
}

export interface GetJourney_journey_blocks_ButtonBlock_action_NavigateAction {
  __typename: "NavigateAction";
  gtmEventName: string | null;
}

export interface GetJourney_journey_blocks_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
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
  gtmEventName: string | null;
  journey: GetJourney_journey_blocks_ButtonBlock_action_NavigateToJourneyAction_journey | null;
}

export interface GetJourney_journey_blocks_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  gtmEventName: string | null;
  url: string;
}

export type GetJourney_journey_blocks_ButtonBlock_action = GetJourney_journey_blocks_ButtonBlock_action_NavigateAction | GetJourney_journey_blocks_ButtonBlock_action_NavigateToBlockAction | GetJourney_journey_blocks_ButtonBlock_action_NavigateToJourneyAction | GetJourney_journey_blocks_ButtonBlock_action_LinkAction;

export interface GetJourney_journey_blocks_ButtonBlock {
  __typename: "ButtonBlock";
  id: string;
  parentBlockId: string | null;
  label: string;
  buttonVariant: ButtonVariant | null;
  buttonColor: ButtonColor | null;
  size: ButtonSize | null;
  startIcon: GetJourney_journey_blocks_ButtonBlock_startIcon | null;
  endIcon: GetJourney_journey_blocks_ButtonBlock_endIcon | null;
  action: GetJourney_journey_blocks_ButtonBlock_action | null;
}

export interface GetJourney_journey_blocks_ImageBlock {
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

export interface GetJourney_journey_blocks_StepBlock {
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

export interface GetJourney_journey_blocks_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
}

export interface GetJourney_journey_blocks_VideoBlock_videoContent {
  __typename: "VideoArclight" | "VideoGeneric";
  src: string;
}

export interface GetJourney_journey_blocks_VideoBlock {
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
  videoContent: GetJourney_journey_blocks_VideoBlock_videoContent;
}

export interface GetJourney_journey_blocks_VideoTriggerBlock_triggerAction_NavigateAction {
  __typename: "NavigateAction";
  gtmEventName: string | null;
}

export interface GetJourney_journey_blocks_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
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
  gtmEventName: string | null;
  journey: GetJourney_journey_blocks_VideoTriggerBlock_triggerAction_NavigateToJourneyAction_journey | null;
}

export interface GetJourney_journey_blocks_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  gtmEventName: string | null;
  url: string;
}

export type GetJourney_journey_blocks_VideoTriggerBlock_triggerAction = GetJourney_journey_blocks_VideoTriggerBlock_triggerAction_NavigateAction | GetJourney_journey_blocks_VideoTriggerBlock_triggerAction_NavigateToBlockAction | GetJourney_journey_blocks_VideoTriggerBlock_triggerAction_NavigateToJourneyAction | GetJourney_journey_blocks_VideoTriggerBlock_triggerAction_LinkAction;

export interface GetJourney_journey_blocks_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: GetJourney_journey_blocks_VideoTriggerBlock_triggerAction;
}

export type GetJourney_journey_blocks = GetJourney_journey_blocks_CardBlock | GetJourney_journey_blocks_ButtonBlock | GetJourney_journey_blocks_ImageBlock | GetJourney_journey_blocks_StepBlock | GetJourney_journey_blocks_TypographyBlock | GetJourney_journey_blocks_VideoBlock | GetJourney_journey_blocks_VideoTriggerBlock;

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

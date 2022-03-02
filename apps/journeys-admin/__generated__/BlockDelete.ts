/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ButtonVariant, ButtonColor, ButtonSize, TypographyAlign, TypographyColor, TypographyVariant } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: BlockDelete
// ====================================================

export interface BlockDelete_blockDelete_CardBlock {
  __typename: "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "RadioOptionBlock" | "StepBlock" | "VideoTriggerBlock";
  id: string;
  journeyId: string;
  parentBlockId: string | null;
}

export interface BlockDelete_blockDelete_ButtonBlock_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface BlockDelete_blockDelete_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface BlockDelete_blockDelete_ButtonBlock_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
}

export interface BlockDelete_blockDelete_ButtonBlock_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: BlockDelete_blockDelete_ButtonBlock_action_NavigateToJourneyAction_journey | null;
}

export interface BlockDelete_blockDelete_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export type BlockDelete_blockDelete_ButtonBlock_action = BlockDelete_blockDelete_ButtonBlock_action_NavigateAction | BlockDelete_blockDelete_ButtonBlock_action_NavigateToBlockAction | BlockDelete_blockDelete_ButtonBlock_action_NavigateToJourneyAction | BlockDelete_blockDelete_ButtonBlock_action_LinkAction;

export interface BlockDelete_blockDelete_ButtonBlock {
  __typename: "ButtonBlock";
  id: string;
  journeyId: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  buttonVariant: ButtonVariant | null;
  buttonColor: ButtonColor | null;
  size: ButtonSize | null;
  startIconId: string | null;
  endIconId: string | null;
  action: BlockDelete_blockDelete_ButtonBlock_action | null;
}

export interface BlockDelete_blockDelete_ImageBlock {
  __typename: "ImageBlock";
  id: string;
  journeyId: string;
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

export interface BlockDelete_blockDelete_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  journeyId: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  description: string | null;
}

export interface BlockDelete_blockDelete_SignUpBlock_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface BlockDelete_blockDelete_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface BlockDelete_blockDelete_SignUpBlock_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
}

export interface BlockDelete_blockDelete_SignUpBlock_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: BlockDelete_blockDelete_SignUpBlock_action_NavigateToJourneyAction_journey | null;
}

export interface BlockDelete_blockDelete_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export type BlockDelete_blockDelete_SignUpBlock_action = BlockDelete_blockDelete_SignUpBlock_action_NavigateAction | BlockDelete_blockDelete_SignUpBlock_action_NavigateToBlockAction | BlockDelete_blockDelete_SignUpBlock_action_NavigateToJourneyAction | BlockDelete_blockDelete_SignUpBlock_action_LinkAction;

export interface BlockDelete_blockDelete_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  journeyId: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: BlockDelete_blockDelete_SignUpBlock_action | null;
}

export interface BlockDelete_blockDelete_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  journeyId: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
}

export interface BlockDelete_blockDelete_VideoBlock_videoContent {
  __typename: "VideoArclight" | "VideoGeneric";
  src: string | null;
}

export interface BlockDelete_blockDelete_VideoBlock {
  __typename: "VideoBlock";
  id: string;
  journeyId: string;
  parentBlockId: string | null;
  parentOrder: number | null;
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
  fullsize: boolean | null;
  videoContent: BlockDelete_blockDelete_VideoBlock_videoContent;
}

export type BlockDelete_blockDelete = BlockDelete_blockDelete_CardBlock | BlockDelete_blockDelete_ButtonBlock | BlockDelete_blockDelete_ImageBlock | BlockDelete_blockDelete_RadioQuestionBlock | BlockDelete_blockDelete_SignUpBlock | BlockDelete_blockDelete_TypographyBlock | BlockDelete_blockDelete_VideoBlock;

export interface BlockDelete {
  blockDelete: BlockDelete_blockDelete[];
}

export interface BlockDeleteVariables {
  id: string;
  journeyId: string;
  parentBlockId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoProviderEnum, VideoOverlayLocationEnum, VideoEventEnum, RadioQuestionVariant } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJourney
// ====================================================

export interface GetJourney_journey_blocks_StepBlock {
  __typename: "StepBlock";
  id: string;
  parentBlockId: string | null;
}

export interface GetJourney_journey_blocks_VideoBlock {
  __typename: "VideoBlock";
  id: string;
  parentBlockId: string | null;
  src: string;
  title: string;
  provider: VideoProviderEnum | null;
  volume: number | null;
  autoplay: boolean | null;
}

export interface GetJourney_journey_blocks_VideoOverlayBlock {
  __typename: "VideoOverlayBlock";
  id: string;
  parentBlockId: string | null;
  location: VideoOverlayLocationEnum | null;
  displayOn: (VideoEventEnum | null)[] | null;
}

export interface GetJourney_journey_blocks_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  label: string;
  description: string | null;
  variant: RadioQuestionVariant | null;
}

export interface GetJourney_journey_blocks_RadioOptionBlock_action_NavigateAction {
  __typename: "NavigateAction";
  gtmEventName: string | null;
}

export interface GetJourney_journey_blocks_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  gtmEventName: string | null;
  blockId: string;
}

export interface GetJourney_journey_blocks_RadioOptionBlock_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  gtmEventName: string | null;
  journeyId: string;
}

export interface GetJourney_journey_blocks_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  gtmEventName: string | null;
  url: string;
}

export type GetJourney_journey_blocks_RadioOptionBlock_action = GetJourney_journey_blocks_RadioOptionBlock_action_NavigateAction | GetJourney_journey_blocks_RadioOptionBlock_action_NavigateToBlockAction | GetJourney_journey_blocks_RadioOptionBlock_action_NavigateToJourneyAction | GetJourney_journey_blocks_RadioOptionBlock_action_LinkAction;

export interface GetJourney_journey_blocks_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  label: string;
  action: GetJourney_journey_blocks_RadioOptionBlock_action | null;
}

export type GetJourney_journey_blocks = GetJourney_journey_blocks_StepBlock | GetJourney_journey_blocks_VideoBlock | GetJourney_journey_blocks_VideoOverlayBlock | GetJourney_journey_blocks_RadioQuestionBlock | GetJourney_journey_blocks_RadioOptionBlock;

export interface GetJourney_journey {
  __typename: "Journey";
  id: string;
  blocks: GetJourney_journey_blocks[] | null;
}

export interface GetJourney {
  journey: GetJourney_journey | null;
}

export interface GetJourneyVariables {
  id: string;
}

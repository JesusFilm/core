/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoBlockSource } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJourneyInternalVideos
// ====================================================

export interface GetJourneyInternalVideos_journey_blocks_ImageBlock {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
}

export interface GetJourneyInternalVideos_journey_blocks_VideoBlock {
  __typename: "VideoBlock";
  id: string;
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
}

export type GetJourneyInternalVideos_journey_blocks = GetJourneyInternalVideos_journey_blocks_ImageBlock | GetJourneyInternalVideos_journey_blocks_VideoBlock;

export interface GetJourneyInternalVideos_journey {
  __typename: "Journey";
  id: string;
  blocks: GetJourneyInternalVideos_journey_blocks[] | null;
}

export interface GetJourneyInternalVideos {
  journey: GetJourneyInternalVideos_journey;
}

export interface GetJourneyInternalVideosVariables {
  journeyId: string;
}

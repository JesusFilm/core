/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoLabel } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetCampaignWatchVideo
// ====================================================

export interface GetCampaignWatchVideo_video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface GetCampaignWatchVideo_video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface GetCampaignWatchVideo_video_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
}

export interface GetCampaignWatchVideo_video {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  /**
   * The number of published child videos associated with this video
   */
  childrenCount: number;
  title: GetCampaignWatchVideo_video_title[];
  images: GetCampaignWatchVideo_video_images[];
  variant: GetCampaignWatchVideo_video_variant | null;
}

export interface GetCampaignWatchVideo {
  video: GetCampaignWatchVideo_video;
}

export interface GetCampaignWatchVideoVariables {
  id: string;
}

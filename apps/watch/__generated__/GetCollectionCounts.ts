/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoLabel } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetCollectionCounts
// ====================================================

export interface GetCollectionCounts_videos_title {
  __typename: "VideoTitle";
  value: string;
}

export interface GetCollectionCounts_videos {
  __typename: "Video";
  id: string;
  /**
   * The number of published child videos associated with this video
   */
  childrenCount: number;
  /**
   * slug is a permanent link to the video.
   */
  slug: string;
  label: VideoLabel;
  title: GetCollectionCounts_videos_title[];
  primaryLanguageId: string;
  publishedAt: any | null;
}

export interface GetCollectionCounts {
  videos: GetCollectionCounts_videos[];
}

export interface GetCollectionCountsVariables {
  ids: string[];
  languageId: string;
}

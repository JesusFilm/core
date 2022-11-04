/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoType } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetHomeVideos
// ====================================================

export interface GetHomeVideos_videosById_title {
  __typename: "Translation";
  value: string;
}

export interface GetHomeVideos_videosById_variant {
  __typename: "VideoVariant";
  duration: number;
}

export interface GetHomeVideos_videosById_slug {
  __typename: "Translation";
  value: string;
}

export interface GetHomeVideos_videosById {
  __typename: "Video";
  id: string;
  type: VideoType;
  image: string | null;
  title: GetHomeVideos_videosById_title[];
  variant: GetHomeVideos_videosById_variant | null;
  /**
   * Episodes are child videos, currently only found in a playlist type
   */
  episodeIds: string[];
  /**
   * slug is a permanent link to the video. It should only be appended, not edited or deleted
   */
  slug: GetHomeVideos_videosById_slug[];
}

export interface GetHomeVideos {
  videosById: GetHomeVideos_videosById[];
}

export interface GetHomeVideosVariables {
  ids: string[];
  languageId?: string | null;
}

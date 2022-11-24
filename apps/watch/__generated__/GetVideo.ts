/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoType } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetVideo
// ====================================================

export interface GetVideo_video_snippet {
  __typename: "Translation";
  value: string;
}

export interface GetVideo_video_description {
  __typename: "Translation";
  value: string;
}

export interface GetVideo_video_studyQuestions {
  __typename: "Translation";
  value: string;
}

export interface GetVideo_video_title {
  __typename: "Translation";
  value: string;
}

export interface GetVideo_video_variant {
  __typename: "VideoVariant";
  duration: number;
  hls: string | null;
}

export interface GetVideo_video_episodes_title {
  __typename: "Translation";
  value: string;
}

export interface GetVideo_video_episodes_imageAlt {
  __typename: "Translation";
  value: string;
}

export interface GetVideo_video_episodes_snippet {
  __typename: "Translation";
  value: string;
}

export interface GetVideo_video_episodes_slug {
  __typename: "Translation";
  value: string;
}

export interface GetVideo_video_episodes_variant {
  __typename: "VideoVariant";
  duration: number;
  hls: string | null;
}

export interface GetVideo_video_episodes {
  __typename: "Video";
  id: string;
  type: VideoType;
  title: GetVideo_video_episodes_title[];
  image: string | null;
  imageAlt: GetVideo_video_episodes_imageAlt[];
  snippet: GetVideo_video_episodes_snippet[];
  /**
   * slug is a permanent link to the video. It should only be appended, not edited or deleted
   */
  slug: GetVideo_video_episodes_slug[];
  /**
   * Episodes are child videos, currently only found in a playlist type
   */
  episodeIds: string[];
  variant: GetVideo_video_episodes_variant | null;
}

export interface GetVideo_video_slug {
  __typename: "Translation";
  value: string;
}

export interface GetVideo_video_variantLanguages_name {
  __typename: "Translation";
  value: string;
}

export interface GetVideo_video_variantLanguages {
  __typename: "Language";
  id: string;
  name: GetVideo_video_variantLanguages_name[];
}

export interface GetVideo_video_studyQuestions {
  __typename: "Translation";
  value: string;
}

export interface GetVideo_video {
  __typename: "Video";
  id: string;
  type: VideoType;
  image: string | null;
  snippet: GetVideo_video_snippet[];
  description: GetVideo_video_description[];
  studyQuestions: GetVideo_video_studyQuestions[];
  title: GetVideo_video_title[];
  variant: GetVideo_video_variant | null;
  episodes: GetVideo_video_episodes[];
  /**
   * slug is a permanent link to the video. It should only be appended, not edited or deleted
   */
  slug: GetVideo_video_slug[];
  variantLanguages: GetVideo_video_variantLanguages[];
}

export interface GetVideo {
  video: GetVideo_video;
}

export interface GetVideoVariables {
  id: string;
  languageId?: string | null;
}

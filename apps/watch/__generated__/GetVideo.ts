/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoLabel } from "./globalTypes";

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

export interface GetVideo_video_children_title {
  __typename: "Translation";
  value: string;
}

export interface GetVideo_video_children_imageAlt {
  __typename: "Translation";
  value: string;
}

export interface GetVideo_video_children_snippet {
  __typename: "Translation";
  value: string;
}

export interface GetVideo_video_children_slug {
  __typename: "Translation";
  value: string;
}

export interface GetVideo_video_children_children {
  __typename: "Video";
  id: string;
}

export interface GetVideo_video_children_variant {
  __typename: "VideoVariant";
  duration: number;
  hls: string | null;
}

export interface GetVideo_video_children {
  __typename: "Video";
  id: string;
  title: GetVideo_video_children_title[];
  image: string | null;
  imageAlt: GetVideo_video_children_imageAlt[];
  snippet: GetVideo_video_children_snippet[];
  /**
   * slug is a permanent link to the video. It should only be appended, not edited or deleted
   */
  slug: GetVideo_video_children_slug[];
  children: GetVideo_video_children_children[];
  variant: GetVideo_video_children_variant | null;
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

export interface GetVideo_video {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  image: string | null;
  snippet: GetVideo_video_snippet[];
  description: GetVideo_video_description[];
  studyQuestions: GetVideo_video_studyQuestions[];
  title: GetVideo_video_title[];
  variant: GetVideo_video_variant | null;
  children: GetVideo_video_children[];
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

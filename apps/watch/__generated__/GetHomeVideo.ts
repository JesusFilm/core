/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoLabel } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetHomeVideo
// ====================================================

export interface GetHomeVideo_video_imageAlt {
  __typename: "Translation";
  value: string;
}

export interface GetHomeVideo_video_snippet {
  __typename: "Translation";
  value: string;
}

export interface GetHomeVideo_video_description {
  __typename: "Translation";
  value: string;
}

export interface GetHomeVideo_video_studyQuestions {
  __typename: "Translation";
  value: string;
}

export interface GetHomeVideo_video_title {
  __typename: "Translation";
  value: string;
}

export interface GetHomeVideo_video_variant_language_name {
  __typename: "Translation";
  value: string;
}

export interface GetHomeVideo_video_variant_language {
  __typename: "Language";
  id: string;
  name: GetHomeVideo_video_variant_language_name[];
}

export interface GetHomeVideo_video_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
  hls: string | null;
  language: GetHomeVideo_video_variant_language;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
}

export interface GetHomeVideo_video_children_title {
  __typename: "Translation";
  value: string;
}

export interface GetHomeVideo_video_children_imageAlt {
  __typename: "Translation";
  value: string;
}

export interface GetHomeVideo_video_children_snippet {
  __typename: "Translation";
  value: string;
}

export interface GetHomeVideo_video_children_children {
  __typename: "Video";
  id: string;
}

export interface GetHomeVideo_video_children_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
  hls: string | null;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
}

export interface GetHomeVideo_video_children {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  title: GetHomeVideo_video_children_title[];
  image: string | null;
  imageAlt: GetHomeVideo_video_children_imageAlt[];
  snippet: GetHomeVideo_video_children_snippet[];
  /**
   * slug is a permanent link to the video.
   */
  slug: string;
  children: GetHomeVideo_video_children_children[];
  variant: GetHomeVideo_video_children_variant | null;
}

export interface GetHomeVideo_video {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  image: string | null;
  imageAlt: GetHomeVideo_video_imageAlt[];
  snippet: GetHomeVideo_video_snippet[];
  description: GetHomeVideo_video_description[];
  studyQuestions: GetHomeVideo_video_studyQuestions[];
  title: GetHomeVideo_video_title[];
  variant: GetHomeVideo_video_variant | null;
  /**
   * slug is a permanent link to the video.
   */
  slug: string;
  children: GetHomeVideo_video_children[];
}

export interface GetHomeVideo {
  video: GetHomeVideo_video;
}

export interface GetHomeVideoVariables {
  id: string;
  languageId?: string | null;
}

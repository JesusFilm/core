/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoLabel } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetVideoChildren
// ====================================================

export interface GetVideoChildren_children_children_title {
  __typename: "Translation";
  value: string;
}

export interface GetVideoChildren_children_children_imageAlt {
  __typename: "Translation";
  value: string;
}

export interface GetVideoChildren_children_children_snippet {
  __typename: "Translation";
  value: string;
}

export interface GetVideoChildren_children_children_children {
  __typename: "Video";
  id: string;
}

export interface GetVideoChildren_children_children_variant_subtitle_language_name {
  __typename: "Translation";
  value: string;
  primary: boolean;
}

export interface GetVideoChildren_children_children_variant_subtitle_language {
  __typename: "Language";
  name: GetVideoChildren_children_children_variant_subtitle_language_name[];
  bcp47: string | null;
  id: string;
}

export interface GetVideoChildren_children_children_variant_subtitle {
  __typename: "Translation";
  language: GetVideoChildren_children_children_variant_subtitle_language;
  value: string;
}

export interface GetVideoChildren_children_children_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
  hls: string | null;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
  subtitle: GetVideoChildren_children_children_variant_subtitle[];
}

export interface GetVideoChildren_children_children {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  title: GetVideoChildren_children_children_title[];
  image: string | null;
  imageAlt: GetVideoChildren_children_children_imageAlt[];
  snippet: GetVideoChildren_children_children_snippet[];
  /**
   * slug is a permanent link to the video.
   */
  slug: string;
  children: GetVideoChildren_children_children_children[];
  variant: GetVideoChildren_children_children_variant | null;
}

export interface GetVideoChildren_children {
  __typename: "Video";
  children: GetVideoChildren_children_children[];
}

export interface GetVideoChildren {
  children: GetVideoChildren_children | null;
}

export interface GetVideoChildrenVariables {
  id: string;
  languageId?: string | null;
}

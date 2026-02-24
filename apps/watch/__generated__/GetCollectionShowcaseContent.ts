/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoLabel } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetCollectionShowcaseContent
// ====================================================

export interface GetCollectionShowcaseContent_videos_title {
  __typename: "VideoTitle";
  value: string;
}

export interface GetCollectionShowcaseContent_videos_snippet {
  __typename: "VideoSnippet";
  value: string;
}

export interface GetCollectionShowcaseContent_videos_imageAlt {
  __typename: "VideoImageAlt";
  value: string;
}

export interface GetCollectionShowcaseContent_videos_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
  hls: string | null;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
}

export interface GetCollectionShowcaseContent_videos_posterImages {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface GetCollectionShowcaseContent_videos_bannerImages {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface GetCollectionShowcaseContent_videos_parents {
  __typename: "Video";
  id: string;
  /**
   * slug is a permanent link to the video.
   */
  slug: string;
  label: VideoLabel;
}

export interface GetCollectionShowcaseContent_videos_description {
  __typename: "VideoDescription";
  value: string;
}

export interface GetCollectionShowcaseContent_videos_children_title {
  __typename: "VideoTitle";
  value: string;
}

export interface GetCollectionShowcaseContent_videos_children_snippet {
  __typename: "VideoSnippet";
  value: string;
}

export interface GetCollectionShowcaseContent_videos_children_imageAlt {
  __typename: "VideoImageAlt";
  value: string;
}

export interface GetCollectionShowcaseContent_videos_children_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
  hls: string | null;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
}

export interface GetCollectionShowcaseContent_videos_children_posterImages {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface GetCollectionShowcaseContent_videos_children_bannerImages {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface GetCollectionShowcaseContent_videos_children_parents {
  __typename: "Video";
  id: string;
  /**
   * slug is a permanent link to the video.
   */
  slug: string;
  label: VideoLabel;
}

export interface GetCollectionShowcaseContent_videos_children_children_title {
  __typename: "VideoTitle";
  value: string;
}

export interface GetCollectionShowcaseContent_videos_children_children_snippet {
  __typename: "VideoSnippet";
  value: string;
}

export interface GetCollectionShowcaseContent_videos_children_children_imageAlt {
  __typename: "VideoImageAlt";
  value: string;
}

export interface GetCollectionShowcaseContent_videos_children_children_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
  hls: string | null;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
}

export interface GetCollectionShowcaseContent_videos_children_children_posterImages {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface GetCollectionShowcaseContent_videos_children_children_bannerImages {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface GetCollectionShowcaseContent_videos_children_children_parents {
  __typename: "Video";
  id: string;
  /**
   * slug is a permanent link to the video.
   */
  slug: string;
  label: VideoLabel;
}

export interface GetCollectionShowcaseContent_videos_children_children {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  /**
   * slug is a permanent link to the video.
   */
  slug: string;
  title: GetCollectionShowcaseContent_videos_children_children_title[];
  snippet: GetCollectionShowcaseContent_videos_children_children_snippet[];
  imageAlt: GetCollectionShowcaseContent_videos_children_children_imageAlt[];
  variant: GetCollectionShowcaseContent_videos_children_children_variant | null;
  posterImages: GetCollectionShowcaseContent_videos_children_children_posterImages[];
  bannerImages: GetCollectionShowcaseContent_videos_children_children_bannerImages[];
  parents: GetCollectionShowcaseContent_videos_children_children_parents[];
  /**
   * The number of published child videos associated with this video
   */
  childrenCount: number;
}

export interface GetCollectionShowcaseContent_videos_children {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  /**
   * slug is a permanent link to the video.
   */
  slug: string;
  title: GetCollectionShowcaseContent_videos_children_title[];
  snippet: GetCollectionShowcaseContent_videos_children_snippet[];
  imageAlt: GetCollectionShowcaseContent_videos_children_imageAlt[];
  variant: GetCollectionShowcaseContent_videos_children_variant | null;
  posterImages: GetCollectionShowcaseContent_videos_children_posterImages[];
  bannerImages: GetCollectionShowcaseContent_videos_children_bannerImages[];
  parents: GetCollectionShowcaseContent_videos_children_parents[];
  /**
   * The number of published child videos associated with this video
   */
  childrenCount: number;
  children: GetCollectionShowcaseContent_videos_children_children[];
}

export interface GetCollectionShowcaseContent_videos {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  /**
   * slug is a permanent link to the video.
   */
  slug: string;
  title: GetCollectionShowcaseContent_videos_title[];
  snippet: GetCollectionShowcaseContent_videos_snippet[];
  imageAlt: GetCollectionShowcaseContent_videos_imageAlt[];
  variant: GetCollectionShowcaseContent_videos_variant | null;
  posterImages: GetCollectionShowcaseContent_videos_posterImages[];
  bannerImages: GetCollectionShowcaseContent_videos_bannerImages[];
  parents: GetCollectionShowcaseContent_videos_parents[];
  /**
   * The number of published child videos associated with this video
   */
  childrenCount: number;
  description: GetCollectionShowcaseContent_videos_description[];
  children: GetCollectionShowcaseContent_videos_children[];
}

export interface GetCollectionShowcaseContent {
  videos: GetCollectionShowcaseContent_videos[];
}

export interface GetCollectionShowcaseContentVariables {
  ids?: string[] | null;
  languageId: string;
}

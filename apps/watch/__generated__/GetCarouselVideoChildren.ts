/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoLabel, VideoVariantDownloadQuality } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetCarouselVideoChildren
// ====================================================

export interface GetCarouselVideoChildren_video_children_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface GetCarouselVideoChildren_video_children_imageAlt {
  __typename: "VideoImageAlt";
  value: string;
}

export interface GetCarouselVideoChildren_video_children_snippet {
  __typename: "VideoSnippet";
  value: string;
}

export interface GetCarouselVideoChildren_video_children_description {
  __typename: "VideoDescription";
  value: string;
}

export interface GetCarouselVideoChildren_video_children_title {
  __typename: "VideoTitle";
  value: string;
}

export interface GetCarouselVideoChildren_video_children_variant_downloads {
  __typename: "VideoVariantDownload";
  quality: VideoVariantDownloadQuality;
  size: number;
  url: string;
}

export interface GetCarouselVideoChildren_video_children_variant_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface GetCarouselVideoChildren_video_children_variant_language {
  __typename: "Language";
  id: string;
  name: GetCarouselVideoChildren_video_children_variant_language_name[];
  bcp47: string | null;
}

export interface GetCarouselVideoChildren_video_children_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
  hls: string | null;
  downloadable: boolean;
  downloads: GetCarouselVideoChildren_video_children_variant_downloads[];
  language: GetCarouselVideoChildren_video_children_variant_language;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
  subtitleCount: number;
}

export interface GetCarouselVideoChildren_video_children {
  __typename: "Video";
  id: string;
  /**
   * slug is a permanent link to the video.
   */
  slug: string;
  label: VideoLabel;
  images: GetCarouselVideoChildren_video_children_images[];
  imageAlt: GetCarouselVideoChildren_video_children_imageAlt[];
  snippet: GetCarouselVideoChildren_video_children_snippet[];
  description: GetCarouselVideoChildren_video_children_description[];
  title: GetCarouselVideoChildren_video_children_title[];
  variant: GetCarouselVideoChildren_video_children_variant | null;
  variantLanguagesCount: number;
  /**
   * The number of published child videos associated with this video
   */
  childrenCount: number;
}

export interface GetCarouselVideoChildren_video {
  __typename: "Video";
  id: string;
  /**
   * slug is a permanent link to the video.
   */
  slug: string;
  children: GetCarouselVideoChildren_video_children[];
}

export interface GetCarouselVideoChildren {
  video: GetCarouselVideoChildren_video;
}

export interface GetCarouselVideoChildrenVariables {
  parentId: string;
  languageId: string;
}

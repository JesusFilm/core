/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoLabel, VideoVariantDownloadQuality } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetShortFilms
// ====================================================

export interface GetShortFilms_videos_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface GetShortFilms_videos_imageAlt {
  __typename: "VideoImageAlt";
  value: string;
}

export interface GetShortFilms_videos_snippet {
  __typename: "VideoSnippet";
  value: string;
}

export interface GetShortFilms_videos_description {
  __typename: "VideoDescription";
  value: string;
}

export interface GetShortFilms_videos_title {
  __typename: "VideoTitle";
  value: string;
}

export interface GetShortFilms_videos_variant_downloads {
  __typename: "VideoVariantDownload";
  quality: VideoVariantDownloadQuality;
  size: number;
  url: string;
}

export interface GetShortFilms_videos_variant_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface GetShortFilms_videos_variant_language {
  __typename: "Language";
  id: string;
  name: GetShortFilms_videos_variant_language_name[];
  bcp47: string | null;
}

export interface GetShortFilms_videos_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
  hls: string | null;
  downloadable: boolean;
  downloads: GetShortFilms_videos_variant_downloads[];
  language: GetShortFilms_videos_variant_language;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
  subtitleCount: number;
}

export interface GetShortFilms_videos {
  __typename: "Video";
  id: string;
  /**
   * slug is a permanent link to the video.
   */
  slug: string;
  label: VideoLabel;
  images: GetShortFilms_videos_images[];
  imageAlt: GetShortFilms_videos_imageAlt[];
  snippet: GetShortFilms_videos_snippet[];
  description: GetShortFilms_videos_description[];
  title: GetShortFilms_videos_title[];
  variant: GetShortFilms_videos_variant | null;
  variantLanguagesCount: number;
  /**
   * The number of published child videos associated with this video
   */
  childrenCount: number;
}

export interface GetShortFilms {
  videos: GetShortFilms_videos[];
}

export interface GetShortFilmsVariables {
  languageId: string;
}

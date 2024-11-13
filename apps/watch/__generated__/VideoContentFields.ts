/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoLabel, VideoVariantDownloadQuality } from "./globalTypes";

// ====================================================
// GraphQL fragment: VideoContentFields
// ====================================================

export interface VideoContentFields_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface VideoContentFields_imageAlt {
  __typename: "VideoImageAlt";
  value: string;
}

export interface VideoContentFields_snippet {
  __typename: "VideoSnippet";
  value: string;
}

export interface VideoContentFields_description {
  __typename: "VideoDescription";
  value: string;
}

export interface VideoContentFields_studyQuestions {
  __typename: "VideoStudyQuestion";
  value: string;
}

export interface VideoContentFields_title {
  __typename: "VideoTitle";
  value: string;
}

export interface VideoContentFields_variant_downloads {
  __typename: "VideoVariantDownload";
  quality: VideoVariantDownloadQuality;
  size: number;
  url: string;
}

export interface VideoContentFields_variant_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface VideoContentFields_variant_language {
  __typename: "Language";
  id: string;
  name: VideoContentFields_variant_language_name[];
}

export interface VideoContentFields_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
  hls: string | null;
  downloadable: boolean;
  downloads: VideoContentFields_variant_downloads[];
  language: VideoContentFields_variant_language;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
  subtitleCount: number;
}

export interface VideoContentFields {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  images: VideoContentFields_images[];
  imageAlt: VideoContentFields_imageAlt[];
  snippet: VideoContentFields_snippet[];
  description: VideoContentFields_description[];
  studyQuestions: VideoContentFields_studyQuestions[];
  title: VideoContentFields_title[];
  variant: VideoContentFields_variant | null;
  variantLanguagesCount: number;
  /**
   * slug is a permanent link to the video.
   */
  slug: string;
  /**
   * the number value of the amount of children on a video
   */
  childrenCount: number;
}

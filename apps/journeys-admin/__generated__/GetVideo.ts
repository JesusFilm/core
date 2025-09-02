/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetVideo
// ====================================================

export interface GetVideo_video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface GetVideo_video_title {
  __typename: "VideoTitle";
  primary: boolean;
  value: string;
}

export interface GetVideo_video_description {
  __typename: "VideoDescription";
  primary: boolean;
  value: string;
}

export interface GetVideo_video_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
  hls: string | null;
}

export interface GetVideo_video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface GetVideo_video_variantLanguages {
  __typename: "Language";
  id: string;
  slug: string | null;
  name: GetVideo_video_variantLanguages_name[];
}

export interface GetVideo_video {
  __typename: "Video";
  id: string;
  images: GetVideo_video_images[];
  primaryLanguageId: string;
  title: GetVideo_video_title[];
  description: GetVideo_video_description[];
  variant: GetVideo_video_variant | null;
  variantLanguages: GetVideo_video_variantLanguages[];
}

export interface GetVideo {
  video: GetVideo_video;
}

export interface GetVideoVariables {
  id: string;
  languageId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoLabel } from "./globalTypes";

// ====================================================
// GraphQL fragment: VideoChildFields
// ====================================================

export interface VideoChildFields_title {
  __typename: "VideoTitle";
  value: string;
}

export interface VideoChildFields_imageAlt {
  __typename: "VideoImageAlt";
  value: string;
}

export interface VideoChildFields_snippet {
  __typename: "VideoSnippet";
  value: string;
}

export interface VideoChildFields_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
  hls: string | null;
  slug: string;
}

export interface VideoChildFields {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  title: VideoChildFields_title[];
  image: string | null;
  imageAlt: VideoChildFields_imageAlt[];
  snippet: VideoChildFields_snippet[];
  slug: string;
  variant: VideoChildFields_variant | null;
  childrenCount: number;
}

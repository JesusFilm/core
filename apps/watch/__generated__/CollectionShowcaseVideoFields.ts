/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoLabel } from "./globalTypes";

// ====================================================
// GraphQL fragment: CollectionShowcaseVideoFields
// ====================================================

export interface CollectionShowcaseVideoFields_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CollectionShowcaseVideoFields_snippet {
  __typename: "VideoSnippet";
  value: string;
}

export interface CollectionShowcaseVideoFields_imageAlt {
  __typename: "VideoImageAlt";
  value: string;
}

export interface CollectionShowcaseVideoFields_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
  hls: string | null;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
}

export interface CollectionShowcaseVideoFields_posterImages {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CollectionShowcaseVideoFields_bannerImages {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CollectionShowcaseVideoFields_parents {
  __typename: "Video";
  id: string;
  /**
   * slug is a permanent link to the video.
   */
  slug: string;
  label: VideoLabel;
}

export interface CollectionShowcaseVideoFields {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  /**
   * slug is a permanent link to the video.
   */
  slug: string;
  title: CollectionShowcaseVideoFields_title[];
  snippet: CollectionShowcaseVideoFields_snippet[];
  imageAlt: CollectionShowcaseVideoFields_imageAlt[];
  variant: CollectionShowcaseVideoFields_variant | null;
  posterImages: CollectionShowcaseVideoFields_posterImages[];
  bannerImages: CollectionShowcaseVideoFields_bannerImages[];
  parents: CollectionShowcaseVideoFields_parents[];
  /**
   * The number of published child videos associated with this video
   */
  childrenCount: number;
}

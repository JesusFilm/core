/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetVideoSiblings
// ====================================================

export interface GetVideoSiblings_children_imageAlt {
  __typename: "Translation";
  value: string;
}

export interface GetVideoSiblings_children_snippet {
  __typename: "Translation";
  value: string;
}

export interface GetVideoSiblings_children_title {
  __typename: "Translation";
  value: string;
}

export interface GetVideoSiblings_children_variant {
  __typename: "VideoVariant";
  duration: number;
  hls: string | null;
}

export interface GetVideoSiblings_children_slug {
  __typename: "Translation";
  value: string;
}

export interface GetVideoSiblings_children {
  __typename: "Video";
  id: string;
  image: string | null;
  imageAlt: GetVideoSiblings_children_imageAlt[];
  snippet: GetVideoSiblings_children_snippet[];
  title: GetVideoSiblings_children_title[];
  variant: GetVideoSiblings_children_variant | null;
  /**
   * Episodes are child videos, currently only found in a playlist type
   */
  childIds: string[];
  /**
   * slug is a permanent link to the video. It should only be appended, not edited or deleted
   */
  slug: GetVideoSiblings_children_slug[];
}

export interface GetVideoSiblings {
  children: GetVideoSiblings_children[];
}

export interface GetVideoSiblingsVariables {
  playlistId: string;
  languageId?: string | null;
}

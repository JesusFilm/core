/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetVideoSiblings
// ====================================================

export interface GetVideoSiblings_video_children_imageAlt {
  __typename: "Translation";
  value: string;
}

export interface GetVideoSiblings_video_children_snippet {
  __typename: "Translation";
  value: string;
}

export interface GetVideoSiblings_video_children_title {
  __typename: "Translation";
  value: string;
}

export interface GetVideoSiblings_video_children_variant {
  __typename: "VideoVariant";
  duration: number;
  hls: string | null;
}

export interface GetVideoSiblings_video_children_children {
  __typename: "Video";
  id: string;
}

export interface GetVideoSiblings_video_children_slug {
  __typename: "Translation";
  value: string;
}

export interface GetVideoSiblings_video_children {
  __typename: "Video";
  id: string;
  image: string | null;
  imageAlt: GetVideoSiblings_video_children_imageAlt[];
  snippet: GetVideoSiblings_video_children_snippet[];
  title: GetVideoSiblings_video_children_title[];
  variant: GetVideoSiblings_video_children_variant | null;
  children: GetVideoSiblings_video_children_children[];
  /**
   * slug is a permanent link to the video. It should only be appended, not edited or deleted
   */
  slug: GetVideoSiblings_video_children_slug[];
}

export interface GetVideoSiblings_video {
  __typename: "Video";
  id: string;
  children: GetVideoSiblings_video_children[];
}

export interface GetVideoSiblings {
  video: GetVideoSiblings_video | null;
}

export interface GetVideoSiblingsVariables {
  id: string;
  languageId?: string | null;
}

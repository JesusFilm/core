/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoLabel } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetTitles
// ====================================================

export interface GetTitles_videos_title {
  __typename: "Translation";
  value: string;
}

export interface GetTitles_videos {
  __typename: "Video";
  label: VideoLabel;
  title: GetTitles_videos_title[];
}

export interface GetTitles {
  videos: GetTitles_videos[];
}

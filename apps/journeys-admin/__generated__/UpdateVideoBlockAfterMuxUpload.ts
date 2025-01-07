/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateVideoBlockAfterMuxUpload
// ====================================================

export interface UpdateVideoBlockAfterMuxUpload_videoBlockUpdate_mediaVideo_CloudflareVideo {
  __typename: "CloudflareVideo" | "Video" | "YouTube";
}

export interface UpdateVideoBlockAfterMuxUpload_videoBlockUpdate_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  playbackId: string | null;
}

export type UpdateVideoBlockAfterMuxUpload_videoBlockUpdate_mediaVideo = UpdateVideoBlockAfterMuxUpload_videoBlockUpdate_mediaVideo_CloudflareVideo | UpdateVideoBlockAfterMuxUpload_videoBlockUpdate_mediaVideo_MuxVideo;

export interface UpdateVideoBlockAfterMuxUpload_videoBlockUpdate {
  __typename: "VideoBlock";
  id: string;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   */
  image: string | null;
  mediaVideo: UpdateVideoBlockAfterMuxUpload_videoBlockUpdate_mediaVideo | null;
}

export interface UpdateVideoBlockAfterMuxUpload {
  videoBlockUpdate: UpdateVideoBlockAfterMuxUpload_videoBlockUpdate;
}

export interface UpdateVideoBlockAfterMuxUploadVariables {
  id: string;
  input: VideoBlockUpdateInput;
}

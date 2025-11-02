/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetMuxVideoWithSubtitles
// ====================================================

export interface GetMuxVideoWithSubtitles_getMyMuxVideo_subtitles {
  __typename: "MuxSubtitleTrack";
  id: string;
  trackId: string | null;
  languageCode: string | null;
  muxLanguageName: string | null;
  readyToStream: boolean;
  source: string | null;
}

export interface GetMuxVideoWithSubtitles_getMyMuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
  readyToStream: boolean;
  duration: number | null;
  subtitles: GetMuxVideoWithSubtitles_getMyMuxVideo_subtitles[];
}

export interface GetMuxVideoWithSubtitles {
  getMyMuxVideo: GetMuxVideoWithSubtitles_getMyMuxVideo;
}

export interface GetMuxVideoWithSubtitlesVariables {
  id: string;
  userGenerated?: boolean | null;
}

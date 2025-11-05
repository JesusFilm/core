/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoBlockUpdateInput, VideoBlockSource, VideoBlockObjectFit, ContactActionType } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: VideoBlockUpdateSubtitle
// ====================================================

export interface VideoBlockUpdateSubtitle_videoBlockUpdate_subtitleLanguage {
  __typename: "Language";
  id: string;
  bcp47: string | null;
}

export interface VideoBlockUpdateSubtitle_videoBlockUpdate_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface VideoBlockUpdateSubtitle_videoBlockUpdate_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface VideoBlockUpdateSubtitle_videoBlockUpdate_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface VideoBlockUpdateSubtitle_videoBlockUpdate_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface VideoBlockUpdateSubtitle_videoBlockUpdate_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: VideoBlockUpdateSubtitle_videoBlockUpdate_mediaVideo_Video_variantLanguages_name[];
}

export interface VideoBlockUpdateSubtitle_videoBlockUpdate_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: VideoBlockUpdateSubtitle_videoBlockUpdate_mediaVideo_Video_title[];
  images: VideoBlockUpdateSubtitle_videoBlockUpdate_mediaVideo_Video_images[];
  variant: VideoBlockUpdateSubtitle_videoBlockUpdate_mediaVideo_Video_variant | null;
  variantLanguages: VideoBlockUpdateSubtitle_videoBlockUpdate_mediaVideo_Video_variantLanguages[];
}

export interface VideoBlockUpdateSubtitle_videoBlockUpdate_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface VideoBlockUpdateSubtitle_videoBlockUpdate_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type VideoBlockUpdateSubtitle_videoBlockUpdate_mediaVideo = VideoBlockUpdateSubtitle_videoBlockUpdate_mediaVideo_Video | VideoBlockUpdateSubtitle_videoBlockUpdate_mediaVideo_MuxVideo | VideoBlockUpdateSubtitle_videoBlockUpdate_mediaVideo_YouTube;

export interface VideoBlockUpdateSubtitle_videoBlockUpdate_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface VideoBlockUpdateSubtitle_videoBlockUpdate_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface VideoBlockUpdateSubtitle_videoBlockUpdate_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface VideoBlockUpdateSubtitle_videoBlockUpdate_action_ChatAction {
  __typename: "ChatAction";
  parentBlockId: string;
  gtmEventName: string | null;
  chatUrl: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface VideoBlockUpdateSubtitle_videoBlockUpdate_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
  phone: string;
  countryCode: string;
  contactAction: ContactActionType;
}

export type VideoBlockUpdateSubtitle_videoBlockUpdate_action = VideoBlockUpdateSubtitle_videoBlockUpdate_action_NavigateToBlockAction | VideoBlockUpdateSubtitle_videoBlockUpdate_action_LinkAction | VideoBlockUpdateSubtitle_videoBlockUpdate_action_EmailAction | VideoBlockUpdateSubtitle_videoBlockUpdate_action_ChatAction | VideoBlockUpdateSubtitle_videoBlockUpdate_action_PhoneAction;

export interface VideoBlockUpdateSubtitle_videoBlockUpdate {
  __typename: "VideoBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  muted: boolean | null;
  autoplay: boolean | null;
  /**
   * startAt dictates at which point of time the video should start playing
   */
  startAt: number | null;
  /**
   * endAt dictates at which point of time the video should end
   */
  endAt: number | null;
  /**
   * posterBlockId is present if a child block should be used as a poster.
   * This child block should not be rendered normally, instead it should be used
   * as the video poster. PosterBlock should be of type ImageBlock.
   */
  posterBlockId: string | null;
  fullsize: boolean | null;
  /**
   * internal source videos: videoId and videoVariantLanguageId both need to be set
   * to select a video.
   * For other sources only videoId needs to be set.
   */
  videoId: string | null;
  /**
   * internal source videos: videoId and videoVariantLanguageId both need to be set
   * to select a video.
   * For other sources only videoId needs to be set.
   */
  videoVariantLanguageId: string | null;
  /**
   * internal source: videoId, videoVariantLanguageId, and video present
   * youTube source: videoId, title, description, and duration present
   */
  source: VideoBlockSource;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field.
   * For other sources this is automatically populated.
   */
  title: string | null;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   */
  description: string | null;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   */
  image: string | null;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   * duration in seconds.
   */
  duration: number | null;
  /**
   * how the video should display within the VideoBlock
   */
  objectFit: VideoBlockObjectFit | null;
  subtitleLanguage: VideoBlockUpdateSubtitle_videoBlockUpdate_subtitleLanguage | null;
  showGeneratedSubtitles: boolean | null;
  mediaVideo: VideoBlockUpdateSubtitle_videoBlockUpdate_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: VideoBlockUpdateSubtitle_videoBlockUpdate_action | null;
}

export interface VideoBlockUpdateSubtitle {
  videoBlockUpdate: VideoBlockUpdateSubtitle_videoBlockUpdate;
}

export interface VideoBlockUpdateSubtitleVariables {
  id: string;
  input: VideoBlockUpdateInput;
}

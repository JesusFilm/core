/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoBlockCreateInput, VideoBlockSource, VideoBlockObjectFit } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CardVideoCreate
// ====================================================

export interface CardVideoCreate_video_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardVideoCreate_video_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardVideoCreate_video_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardVideoCreate_video_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardVideoCreate_video_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardVideoCreate_video_mediaVideo_Video_variantLanguages_name[];
}

export interface CardVideoCreate_video_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardVideoCreate_video_mediaVideo_Video_title[];
  images: CardVideoCreate_video_mediaVideo_Video_images[];
  variant: CardVideoCreate_video_mediaVideo_Video_variant | null;
  variantLanguages: CardVideoCreate_video_mediaVideo_Video_variantLanguages[];
}

export interface CardVideoCreate_video_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardVideoCreate_video_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardVideoCreate_video_mediaVideo = CardVideoCreate_video_mediaVideo_Video | CardVideoCreate_video_mediaVideo_MuxVideo | CardVideoCreate_video_mediaVideo_YouTube;

export interface CardVideoCreate_video_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardVideoCreate_video_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardVideoCreate_video_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardVideoCreate_video_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
  phone: string;
  countryCode: string;
}

export type CardVideoCreate_video_action = CardVideoCreate_video_action_NavigateToBlockAction | CardVideoCreate_video_action_LinkAction | CardVideoCreate_video_action_EmailAction | CardVideoCreate_video_action_PhoneAction;

export interface CardVideoCreate_video {
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
  mediaVideo: CardVideoCreate_video_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardVideoCreate_video_action | null;
}

export interface CardVideoCreate {
  video: CardVideoCreate_video;
}

export interface CardVideoCreateVariables {
  videoInput: VideoBlockCreateInput;
}

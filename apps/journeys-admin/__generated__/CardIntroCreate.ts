/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TypographyBlockCreateInput, ButtonBlockCreateInput, ButtonBlockUpdateInput, IconBlockCreateInput, VideoBlockCreateInput, TypographyAlign, TypographyColor, TypographyVariant, ButtonVariant, ButtonColor, ButtonSize, ButtonAlignment, IconName, IconSize, IconColor, VideoBlockSource, VideoBlockObjectFit } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CardIntroCreate
// ====================================================

export interface CardIntroCreate_subtitle_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardIntroCreate_subtitle {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardIntroCreate_subtitle_settings | null;
}

export interface CardIntroCreate_title_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardIntroCreate_title {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardIntroCreate_title_settings | null;
}

export interface CardIntroCreate_body_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardIntroCreate_body {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardIntroCreate_body_settings | null;
}

export interface CardIntroCreate_button_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroCreate_button_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroCreate_button_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroCreate_button_action = CardIntroCreate_button_action_NavigateToBlockAction | CardIntroCreate_button_action_LinkAction | CardIntroCreate_button_action_EmailAction;

export interface CardIntroCreate_button_settings {
  __typename: "ButtonBlockSettings";
  alignment: ButtonAlignment | null;
}

export interface CardIntroCreate_button {
  __typename: "ButtonBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  buttonVariant: ButtonVariant | null;
  buttonColor: ButtonColor | null;
  size: ButtonSize | null;
  startIconId: string | null;
  endIconId: string | null;
  submitEnabled: boolean | null;
  action: CardIntroCreate_button_action | null;
  settings: CardIntroCreate_button_settings | null;
}

export interface CardIntroCreate_startIcon {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardIntroCreate_endIcon {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardIntroCreate_buttonBlockUpdate_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroCreate_buttonBlockUpdate_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroCreate_buttonBlockUpdate_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroCreate_buttonBlockUpdate_action = CardIntroCreate_buttonBlockUpdate_action_NavigateToBlockAction | CardIntroCreate_buttonBlockUpdate_action_LinkAction | CardIntroCreate_buttonBlockUpdate_action_EmailAction;

export interface CardIntroCreate_buttonBlockUpdate_settings {
  __typename: "ButtonBlockSettings";
  alignment: ButtonAlignment | null;
}

export interface CardIntroCreate_buttonBlockUpdate {
  __typename: "ButtonBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  buttonVariant: ButtonVariant | null;
  buttonColor: ButtonColor | null;
  size: ButtonSize | null;
  startIconId: string | null;
  endIconId: string | null;
  submitEnabled: boolean | null;
  action: CardIntroCreate_buttonBlockUpdate_action | null;
  settings: CardIntroCreate_buttonBlockUpdate_settings | null;
}

export interface CardIntroCreate_video_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardIntroCreate_video_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardIntroCreate_video_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardIntroCreate_video_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardIntroCreate_video_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardIntroCreate_video_mediaVideo_Video_variantLanguages_name[];
}

export interface CardIntroCreate_video_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardIntroCreate_video_mediaVideo_Video_title[];
  images: CardIntroCreate_video_mediaVideo_Video_images[];
  variant: CardIntroCreate_video_mediaVideo_Video_variant | null;
  variantLanguages: CardIntroCreate_video_mediaVideo_Video_variantLanguages[];
}

export interface CardIntroCreate_video_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardIntroCreate_video_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardIntroCreate_video_mediaVideo = CardIntroCreate_video_mediaVideo_Video | CardIntroCreate_video_mediaVideo_MuxVideo | CardIntroCreate_video_mediaVideo_YouTube;

export interface CardIntroCreate_video_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroCreate_video_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroCreate_video_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroCreate_video_action = CardIntroCreate_video_action_NavigateToBlockAction | CardIntroCreate_video_action_LinkAction | CardIntroCreate_video_action_EmailAction;

export interface CardIntroCreate_video {
  __typename: "VideoBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  muted: boolean;
  autoplay: boolean;
  startAt: number | null;
  endAt: number | null;
  posterBlockId: string | null;
  fullsize: boolean;
  videoId: string | null;
  videoVariantLanguageId: string | null;
  source: VideoBlockSource | null;
  title: string;
  description: string;
  image: string | null;
  duration: number | null;
  objectFit: VideoBlockObjectFit | null;
  mediaVideo: CardIntroCreate_video_mediaVideo | null;
  action: CardIntroCreate_video_action | null;
}

export interface CardIntroCreate {
  subtitle: CardIntroCreate_subtitle;
  title: CardIntroCreate_title;
  body: CardIntroCreate_body;
  button: CardIntroCreate_button;
  startIcon: CardIntroCreate_startIcon;
  endIcon: CardIntroCreate_endIcon;
  buttonBlockUpdate: CardIntroCreate_buttonBlockUpdate;
  video: CardIntroCreate_video;
}

export interface CardIntroCreateVariables {
  journeyId: string;
  subtitleInput: TypographyBlockCreateInput;
  titleInput: TypographyBlockCreateInput;
  bodyInput: TypographyBlockCreateInput;
  buttonInput: ButtonBlockCreateInput;
  buttonId: string;
  buttonUpdateInput: ButtonBlockUpdateInput;
  startIconInput: IconBlockCreateInput;
  endIconInput: IconBlockCreateInput;
  videoInput: VideoBlockCreateInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TypographyBlockCreateInput, ButtonBlockCreateInput, ButtonBlockUpdateInput, IconBlockCreateInput, VideoBlockCreateInput, TypographyAlign, TypographyColor, TypographyVariant, ButtonVariant, ButtonColor, ButtonSize, IconName, IconSize, IconColor, VideoBlockSource, VideoBlockObjectFit } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CardIntroCreate
// ====================================================

export interface CardIntroCreate_subtitle {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
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
}

export interface CardIntroCreate_button_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardIntroCreate_button_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroCreate_button_action_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface CardIntroCreate_button_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: CardIntroCreate_button_action_NavigateToJourneyAction_journey_language;
}

export interface CardIntroCreate_button_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: CardIntroCreate_button_action_NavigateToJourneyAction_journey | null;
}

export interface CardIntroCreate_button_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroCreate_button_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroCreate_button_action = CardIntroCreate_button_action_NavigateAction | CardIntroCreate_button_action_NavigateToBlockAction | CardIntroCreate_button_action_NavigateToJourneyAction | CardIntroCreate_button_action_LinkAction | CardIntroCreate_button_action_EmailAction;

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
  action: CardIntroCreate_button_action | null;
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

export interface CardIntroCreate_buttonBlockUpdate_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardIntroCreate_buttonBlockUpdate_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroCreate_buttonBlockUpdate_action_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface CardIntroCreate_buttonBlockUpdate_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: CardIntroCreate_buttonBlockUpdate_action_NavigateToJourneyAction_journey_language;
}

export interface CardIntroCreate_buttonBlockUpdate_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: CardIntroCreate_buttonBlockUpdate_action_NavigateToJourneyAction_journey | null;
}

export interface CardIntroCreate_buttonBlockUpdate_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroCreate_buttonBlockUpdate_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroCreate_buttonBlockUpdate_action = CardIntroCreate_buttonBlockUpdate_action_NavigateAction | CardIntroCreate_buttonBlockUpdate_action_NavigateToBlockAction | CardIntroCreate_buttonBlockUpdate_action_NavigateToJourneyAction | CardIntroCreate_buttonBlockUpdate_action_LinkAction | CardIntroCreate_buttonBlockUpdate_action_EmailAction;

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
  action: CardIntroCreate_buttonBlockUpdate_action | null;
}

export interface CardIntroCreate_video_video_title {
  __typename: "Translation";
  value: string;
}

export interface CardIntroCreate_video_video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardIntroCreate_video_video {
  __typename: "Video";
  id: string;
  title: CardIntroCreate_video_video_title[];
  image: string | null;
  variant: CardIntroCreate_video_video_variant | null;
}

export interface CardIntroCreate_video_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardIntroCreate_video_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardIntroCreate_video_action_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface CardIntroCreate_video_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: CardIntroCreate_video_action_NavigateToJourneyAction_journey_language;
}

export interface CardIntroCreate_video_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: CardIntroCreate_video_action_NavigateToJourneyAction_journey | null;
}

export interface CardIntroCreate_video_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardIntroCreate_video_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardIntroCreate_video_action = CardIntroCreate_video_action_NavigateAction | CardIntroCreate_video_action_NavigateToBlockAction | CardIntroCreate_video_action_NavigateToJourneyAction | CardIntroCreate_video_action_LinkAction | CardIntroCreate_video_action_EmailAction;

export interface CardIntroCreate_video {
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
  /**
   * internal source videos: video is only populated when videoID and
   * videoVariantLanguageId are present
   */
  video: CardIntroCreate_video_video | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardIntroCreate_video_action | null;
}

export interface CardIntroCreate {
  subtitle: CardIntroCreate_subtitle;
  title: CardIntroCreate_title;
  body: CardIntroCreate_body;
  button: CardIntroCreate_button;
  startIcon: CardIntroCreate_startIcon;
  endIcon: CardIntroCreate_endIcon;
  buttonBlockUpdate: CardIntroCreate_buttonBlockUpdate | null;
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

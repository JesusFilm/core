/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyStatus, ThemeName, ThemeMode, ButtonVariant, ButtonColor, ButtonSize, IconName, IconSize, IconColor, TypographyAlign, TypographyColor, TypographyVariant, VideoBlockSource, VideoBlockObjectFit, UserJourneyRole, ChatPlatform, UserTeamRole } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJourneyAdmin
// ====================================================

export interface GetJourneyAdmin_journey_language_name {
  __typename: "Translation";
  value: string;
  primary: boolean;
}

export interface GetJourneyAdmin_journey_language {
  __typename: "Language";
  id: string;
  bcp47: string | null;
  iso3: string | null;
  name: GetJourneyAdmin_journey_language_name[];
}

export interface GetJourneyAdmin_journey_blocks_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface GetJourneyAdmin_journey_blocks_ButtonBlock_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface GetJourneyAdmin_journey_blocks_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetJourneyAdmin_journey_blocks_ButtonBlock_action_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface GetJourneyAdmin_journey_blocks_ButtonBlock_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: GetJourneyAdmin_journey_blocks_ButtonBlock_action_NavigateToJourneyAction_journey_language;
}

export interface GetJourneyAdmin_journey_blocks_ButtonBlock_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: GetJourneyAdmin_journey_blocks_ButtonBlock_action_NavigateToJourneyAction_journey | null;
}

export interface GetJourneyAdmin_journey_blocks_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface GetJourneyAdmin_journey_blocks_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type GetJourneyAdmin_journey_blocks_ButtonBlock_action = GetJourneyAdmin_journey_blocks_ButtonBlock_action_NavigateAction | GetJourneyAdmin_journey_blocks_ButtonBlock_action_NavigateToBlockAction | GetJourneyAdmin_journey_blocks_ButtonBlock_action_NavigateToJourneyAction | GetJourneyAdmin_journey_blocks_ButtonBlock_action_LinkAction | GetJourneyAdmin_journey_blocks_ButtonBlock_action_EmailAction;

export interface GetJourneyAdmin_journey_blocks_ButtonBlock {
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
  action: GetJourneyAdmin_journey_blocks_ButtonBlock_action | null;
}

export interface GetJourneyAdmin_journey_blocks_CardBlock {
  __typename: "CardBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * backgroundColor should be a HEX color value e.g #FFFFFF for white.
   */
  backgroundColor: string | null;
  /**
   * coverBlockId is present if a child block should be used as a cover.
   * This child block should not be rendered normally, instead it should be used
   * as a background. Blocks are often of type ImageBlock or VideoBlock.
   */
  coverBlockId: string | null;
  /**
   * themeMode can override journey themeMode. If nothing is set then use
   * themeMode from journey
   */
  themeMode: ThemeMode | null;
  /**
   * themeName can override journey themeName. If nothing is set then use
   * themeName from journey
   */
  themeName: ThemeName | null;
  /**
   * fullscreen should control how the coverBlock is displayed. When fullscreen
   * is set to true the coverBlock Image should be displayed as a blur in the
   * background.
   */
  fullscreen: boolean;
}

export interface GetJourneyAdmin_journey_blocks_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface GetJourneyAdmin_journey_blocks_ImageBlock {
  __typename: "ImageBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  src: string | null;
  alt: string;
  width: number;
  height: number;
  /**
   * blurhash is a compact representation of a placeholder for an image.
   * Find a frontend implementation at https: // github.com/woltapp/blurhash
   */
  blurhash: string;
}

export interface GetJourneyAdmin_journey_blocks_RadioOptionBlock_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface GetJourneyAdmin_journey_blocks_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetJourneyAdmin_journey_blocks_RadioOptionBlock_action_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface GetJourneyAdmin_journey_blocks_RadioOptionBlock_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: GetJourneyAdmin_journey_blocks_RadioOptionBlock_action_NavigateToJourneyAction_journey_language;
}

export interface GetJourneyAdmin_journey_blocks_RadioOptionBlock_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: GetJourneyAdmin_journey_blocks_RadioOptionBlock_action_NavigateToJourneyAction_journey | null;
}

export interface GetJourneyAdmin_journey_blocks_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface GetJourneyAdmin_journey_blocks_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type GetJourneyAdmin_journey_blocks_RadioOptionBlock_action = GetJourneyAdmin_journey_blocks_RadioOptionBlock_action_NavigateAction | GetJourneyAdmin_journey_blocks_RadioOptionBlock_action_NavigateToBlockAction | GetJourneyAdmin_journey_blocks_RadioOptionBlock_action_NavigateToJourneyAction | GetJourneyAdmin_journey_blocks_RadioOptionBlock_action_LinkAction | GetJourneyAdmin_journey_blocks_RadioOptionBlock_action_EmailAction;

export interface GetJourneyAdmin_journey_blocks_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: GetJourneyAdmin_journey_blocks_RadioOptionBlock_action | null;
}

export interface GetJourneyAdmin_journey_blocks_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface GetJourneyAdmin_journey_blocks_SignUpBlock_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface GetJourneyAdmin_journey_blocks_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetJourneyAdmin_journey_blocks_SignUpBlock_action_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface GetJourneyAdmin_journey_blocks_SignUpBlock_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: GetJourneyAdmin_journey_blocks_SignUpBlock_action_NavigateToJourneyAction_journey_language;
}

export interface GetJourneyAdmin_journey_blocks_SignUpBlock_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: GetJourneyAdmin_journey_blocks_SignUpBlock_action_NavigateToJourneyAction_journey | null;
}

export interface GetJourneyAdmin_journey_blocks_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface GetJourneyAdmin_journey_blocks_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type GetJourneyAdmin_journey_blocks_SignUpBlock_action = GetJourneyAdmin_journey_blocks_SignUpBlock_action_NavigateAction | GetJourneyAdmin_journey_blocks_SignUpBlock_action_NavigateToBlockAction | GetJourneyAdmin_journey_blocks_SignUpBlock_action_NavigateToJourneyAction | GetJourneyAdmin_journey_blocks_SignUpBlock_action_LinkAction | GetJourneyAdmin_journey_blocks_SignUpBlock_action_EmailAction;

export interface GetJourneyAdmin_journey_blocks_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: GetJourneyAdmin_journey_blocks_SignUpBlock_action | null;
}

export interface GetJourneyAdmin_journey_blocks_StepBlock {
  __typename: "StepBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * locked will be set to true if the user should not be able to manually
   * advance to the next step.
   */
  locked: boolean;
  /**
   * nextBlockId contains the preferred block to navigate to when a
   * NavigateAction occurs or if the user manually tries to advance to the next
   * step. If no nextBlockId is set it will automatically navigate to the next
   * step in the journey based on parentOrder.
   */
  nextBlockId: string | null;
}

export interface GetJourneyAdmin_journey_blocks_TextResponseBlock_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface GetJourneyAdmin_journey_blocks_TextResponseBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetJourneyAdmin_journey_blocks_TextResponseBlock_action_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface GetJourneyAdmin_journey_blocks_TextResponseBlock_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: GetJourneyAdmin_journey_blocks_TextResponseBlock_action_NavigateToJourneyAction_journey_language;
}

export interface GetJourneyAdmin_journey_blocks_TextResponseBlock_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: GetJourneyAdmin_journey_blocks_TextResponseBlock_action_NavigateToJourneyAction_journey | null;
}

export interface GetJourneyAdmin_journey_blocks_TextResponseBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface GetJourneyAdmin_journey_blocks_TextResponseBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type GetJourneyAdmin_journey_blocks_TextResponseBlock_action = GetJourneyAdmin_journey_blocks_TextResponseBlock_action_NavigateAction | GetJourneyAdmin_journey_blocks_TextResponseBlock_action_NavigateToBlockAction | GetJourneyAdmin_journey_blocks_TextResponseBlock_action_NavigateToJourneyAction | GetJourneyAdmin_journey_blocks_TextResponseBlock_action_LinkAction | GetJourneyAdmin_journey_blocks_TextResponseBlock_action_EmailAction;

export interface GetJourneyAdmin_journey_blocks_TextResponseBlock {
  __typename: "TextResponseBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  hint: string | null;
  minRows: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: GetJourneyAdmin_journey_blocks_TextResponseBlock_action | null;
}

export interface GetJourneyAdmin_journey_blocks_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
}

export interface GetJourneyAdmin_journey_blocks_VideoBlock_video_title {
  __typename: "Translation";
  value: string;
}

export interface GetJourneyAdmin_journey_blocks_VideoBlock_video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface GetJourneyAdmin_journey_blocks_VideoBlock_video {
  __typename: "Video";
  id: string;
  title: GetJourneyAdmin_journey_blocks_VideoBlock_video_title[];
  image: string | null;
  variant: GetJourneyAdmin_journey_blocks_VideoBlock_video_variant | null;
}

export interface GetJourneyAdmin_journey_blocks_VideoBlock_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface GetJourneyAdmin_journey_blocks_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetJourneyAdmin_journey_blocks_VideoBlock_action_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface GetJourneyAdmin_journey_blocks_VideoBlock_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: GetJourneyAdmin_journey_blocks_VideoBlock_action_NavigateToJourneyAction_journey_language;
}

export interface GetJourneyAdmin_journey_blocks_VideoBlock_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: GetJourneyAdmin_journey_blocks_VideoBlock_action_NavigateToJourneyAction_journey | null;
}

export interface GetJourneyAdmin_journey_blocks_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface GetJourneyAdmin_journey_blocks_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type GetJourneyAdmin_journey_blocks_VideoBlock_action = GetJourneyAdmin_journey_blocks_VideoBlock_action_NavigateAction | GetJourneyAdmin_journey_blocks_VideoBlock_action_NavigateToBlockAction | GetJourneyAdmin_journey_blocks_VideoBlock_action_NavigateToJourneyAction | GetJourneyAdmin_journey_blocks_VideoBlock_action_LinkAction | GetJourneyAdmin_journey_blocks_VideoBlock_action_EmailAction;

export interface GetJourneyAdmin_journey_blocks_VideoBlock {
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
  video: GetJourneyAdmin_journey_blocks_VideoBlock_video | null;
  /**
   * action that should be performed when the video ends
   */
  action: GetJourneyAdmin_journey_blocks_VideoBlock_action | null;
}

export interface GetJourneyAdmin_journey_blocks_VideoTriggerBlock_triggerAction_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface GetJourneyAdmin_journey_blocks_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetJourneyAdmin_journey_blocks_VideoTriggerBlock_triggerAction_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface GetJourneyAdmin_journey_blocks_VideoTriggerBlock_triggerAction_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: GetJourneyAdmin_journey_blocks_VideoTriggerBlock_triggerAction_NavigateToJourneyAction_journey_language;
}

export interface GetJourneyAdmin_journey_blocks_VideoTriggerBlock_triggerAction_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: GetJourneyAdmin_journey_blocks_VideoTriggerBlock_triggerAction_NavigateToJourneyAction_journey | null;
}

export interface GetJourneyAdmin_journey_blocks_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface GetJourneyAdmin_journey_blocks_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type GetJourneyAdmin_journey_blocks_VideoTriggerBlock_triggerAction = GetJourneyAdmin_journey_blocks_VideoTriggerBlock_triggerAction_NavigateAction | GetJourneyAdmin_journey_blocks_VideoTriggerBlock_triggerAction_NavigateToBlockAction | GetJourneyAdmin_journey_blocks_VideoTriggerBlock_triggerAction_NavigateToJourneyAction | GetJourneyAdmin_journey_blocks_VideoTriggerBlock_triggerAction_LinkAction | GetJourneyAdmin_journey_blocks_VideoTriggerBlock_triggerAction_EmailAction;

export interface GetJourneyAdmin_journey_blocks_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: GetJourneyAdmin_journey_blocks_VideoTriggerBlock_triggerAction;
}

export type GetJourneyAdmin_journey_blocks = GetJourneyAdmin_journey_blocks_GridContainerBlock | GetJourneyAdmin_journey_blocks_ButtonBlock | GetJourneyAdmin_journey_blocks_CardBlock | GetJourneyAdmin_journey_blocks_IconBlock | GetJourneyAdmin_journey_blocks_ImageBlock | GetJourneyAdmin_journey_blocks_RadioOptionBlock | GetJourneyAdmin_journey_blocks_RadioQuestionBlock | GetJourneyAdmin_journey_blocks_SignUpBlock | GetJourneyAdmin_journey_blocks_StepBlock | GetJourneyAdmin_journey_blocks_TextResponseBlock | GetJourneyAdmin_journey_blocks_TypographyBlock | GetJourneyAdmin_journey_blocks_VideoBlock | GetJourneyAdmin_journey_blocks_VideoTriggerBlock;

export interface GetJourneyAdmin_journey_primaryImageBlock {
  __typename: "ImageBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  src: string | null;
  alt: string;
  width: number;
  height: number;
  /**
   * blurhash is a compact representation of a placeholder for an image.
   * Find a frontend implementation at https: // github.com/woltapp/blurhash
   */
  blurhash: string;
}

export interface GetJourneyAdmin_journey_userJourneys_user {
  __typename: "User";
  id: string;
  firstName: string;
  lastName: string | null;
  imageUrl: string | null;
  email: string;
}

export interface GetJourneyAdmin_journey_userJourneys {
  __typename: "UserJourney";
  id: string;
  role: UserJourneyRole;
  /**
   * Date time of when the journey was first opened
   */
  openedAt: any | null;
  user: GetJourneyAdmin_journey_userJourneys_user | null;
}

export interface GetJourneyAdmin_journey_chatButtons {
  __typename: "ChatButton";
  id: string;
  link: string | null;
  platform: ChatPlatform | null;
}

export interface GetJourneyAdmin_journey_host {
  __typename: "Host";
  id: string;
  teamId: string;
  title: string;
  location: string | null;
  src1: string | null;
  src2: string | null;
}

export interface GetJourneyAdmin_journey_team_userTeams_user {
  __typename: "User";
  email: string;
  firstName: string;
  id: string;
  imageUrl: string | null;
  lastName: string | null;
}

export interface GetJourneyAdmin_journey_team_userTeams {
  __typename: "UserTeam";
  id: string;
  role: UserTeamRole;
  user: GetJourneyAdmin_journey_team_userTeams_user;
}

export interface GetJourneyAdmin_journey_team {
  __typename: "Team";
  id: string;
  title: string;
  userTeams: GetJourneyAdmin_journey_team_userTeams[];
}

export interface GetJourneyAdmin_journey_tags_name_language {
  __typename: "Language";
  id: string;
}

export interface GetJourneyAdmin_journey_tags_name {
  __typename: "Translation";
  value: string;
  language: GetJourneyAdmin_journey_tags_name_language;
  primary: boolean;
}

export interface GetJourneyAdmin_journey_tags {
  __typename: "Tag";
  id: string;
  parentId: string | null;
  name: GetJourneyAdmin_journey_tags_name[];
}

export interface GetJourneyAdmin_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: JourneyStatus;
  language: GetJourneyAdmin_journey_language;
  createdAt: any;
  featuredAt: any | null;
  publishedAt: any | null;
  themeName: ThemeName;
  themeMode: ThemeMode;
  strategySlug: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  template: boolean | null;
  blocks: GetJourneyAdmin_journey_blocks[] | null;
  primaryImageBlock: GetJourneyAdmin_journey_primaryImageBlock | null;
  userJourneys: GetJourneyAdmin_journey_userJourneys[] | null;
  chatButtons: GetJourneyAdmin_journey_chatButtons[];
  host: GetJourneyAdmin_journey_host | null;
  team: GetJourneyAdmin_journey_team | null;
  tags: GetJourneyAdmin_journey_tags[];
}

export interface GetJourneyAdmin {
  journey: GetJourneyAdmin_journey;
}

export interface GetJourneyAdminVariables {
  id: string;
}

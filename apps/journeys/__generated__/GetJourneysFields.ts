/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneysQueryOptions, JourneyStatus, ThemeName, ThemeMode, ButtonVariant, ButtonColor, ButtonSize, IconName, IconSize, IconColor, TextResponseType, TypographyAlign, TypographyColor, TypographyVariant, VideoBlockSource, VideoBlockObjectFit, UserJourneyRole, MessagePlatform, JourneyMenuButtonIcon } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJourneysFields
// ====================================================

export interface GetJourneysFields_journeys_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface GetJourneysFields_journeys_language {
  __typename: "Language";
  id: string;
  bcp47: string | null;
  iso3: string | null;
  name: GetJourneysFields_journeys_language_name[];
}

export interface GetJourneysFields_journeys_blocks_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface GetJourneysFields_journeys_blocks_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetJourneysFields_journeys_blocks_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface GetJourneysFields_journeys_blocks_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type GetJourneysFields_journeys_blocks_ButtonBlock_action = GetJourneysFields_journeys_blocks_ButtonBlock_action_NavigateToBlockAction | GetJourneysFields_journeys_blocks_ButtonBlock_action_LinkAction | GetJourneysFields_journeys_blocks_ButtonBlock_action_EmailAction;

export interface GetJourneysFields_journeys_blocks_ButtonBlock {
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
  action: GetJourneysFields_journeys_blocks_ButtonBlock_action | null;
}

export interface GetJourneysFields_journeys_blocks_CardBlock {
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

export interface GetJourneysFields_journeys_blocks_FormBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetJourneysFields_journeys_blocks_FormBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface GetJourneysFields_journeys_blocks_FormBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type GetJourneysFields_journeys_blocks_FormBlock_action = GetJourneysFields_journeys_blocks_FormBlock_action_NavigateToBlockAction | GetJourneysFields_journeys_blocks_FormBlock_action_LinkAction | GetJourneysFields_journeys_blocks_FormBlock_action_EmailAction;

export interface GetJourneysFields_journeys_blocks_FormBlock {
  __typename: "FormBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  form: any | null;
  action: GetJourneysFields_journeys_blocks_FormBlock_action | null;
}

export interface GetJourneysFields_journeys_blocks_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface GetJourneysFields_journeys_blocks_ImageBlock {
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
  scale: number | null;
}

export interface GetJourneysFields_journeys_blocks_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetJourneysFields_journeys_blocks_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface GetJourneysFields_journeys_blocks_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type GetJourneysFields_journeys_blocks_RadioOptionBlock_action = GetJourneysFields_journeys_blocks_RadioOptionBlock_action_NavigateToBlockAction | GetJourneysFields_journeys_blocks_RadioOptionBlock_action_LinkAction | GetJourneysFields_journeys_blocks_RadioOptionBlock_action_EmailAction;

export interface GetJourneysFields_journeys_blocks_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: GetJourneysFields_journeys_blocks_RadioOptionBlock_action | null;
}

export interface GetJourneysFields_journeys_blocks_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface GetJourneysFields_journeys_blocks_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetJourneysFields_journeys_blocks_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface GetJourneysFields_journeys_blocks_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type GetJourneysFields_journeys_blocks_SignUpBlock_action = GetJourneysFields_journeys_blocks_SignUpBlock_action_NavigateToBlockAction | GetJourneysFields_journeys_blocks_SignUpBlock_action_LinkAction | GetJourneysFields_journeys_blocks_SignUpBlock_action_EmailAction;

export interface GetJourneysFields_journeys_blocks_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: GetJourneysFields_journeys_blocks_SignUpBlock_action | null;
}

export interface GetJourneysFields_journeys_blocks_StepBlock {
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
   * nextBlockId contains the preferred block to navigate to, users will have to
   * manually set the next block they want to card to navigate to
   */
  nextBlockId: string | null;
  /**
   * Slug should be unique amongst all blocks
   * (server will throw BAD_USER_INPUT error if not)
   * If not required will use the current block id
   * If the generated slug is not unique the uuid will be placed
   * at the end of the slug guaranteeing uniqueness
   */
  slug: string | null;
}

export interface GetJourneysFields_journeys_blocks_TextResponseBlock {
  __typename: "TextResponseBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  hint: string | null;
  minRows: number | null;
  type: TextResponseType | null;
  routeId: string | null;
  integrationId: string | null;
}

export interface GetJourneysFields_journeys_blocks_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
}

export interface GetJourneysFields_journeys_blocks_VideoBlock_video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface GetJourneysFields_journeys_blocks_VideoBlock_video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface GetJourneysFields_journeys_blocks_VideoBlock_video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface GetJourneysFields_journeys_blocks_VideoBlock_video_variantLanguages {
  __typename: "Language";
  id: string;
  name: GetJourneysFields_journeys_blocks_VideoBlock_video_variantLanguages_name[];
}

export interface GetJourneysFields_journeys_blocks_VideoBlock_video {
  __typename: "Video";
  id: string;
  title: GetJourneysFields_journeys_blocks_VideoBlock_video_title[];
  image: string | null;
  variant: GetJourneysFields_journeys_blocks_VideoBlock_video_variant | null;
  variantLanguages: GetJourneysFields_journeys_blocks_VideoBlock_video_variantLanguages[];
}

export interface GetJourneysFields_journeys_blocks_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetJourneysFields_journeys_blocks_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface GetJourneysFields_journeys_blocks_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type GetJourneysFields_journeys_blocks_VideoBlock_action = GetJourneysFields_journeys_blocks_VideoBlock_action_NavigateToBlockAction | GetJourneysFields_journeys_blocks_VideoBlock_action_LinkAction | GetJourneysFields_journeys_blocks_VideoBlock_action_EmailAction;

export interface GetJourneysFields_journeys_blocks_VideoBlock {
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
  video: GetJourneysFields_journeys_blocks_VideoBlock_video | null;
  /**
   * action that should be performed when the video ends
   */
  action: GetJourneysFields_journeys_blocks_VideoBlock_action | null;
}

export interface GetJourneysFields_journeys_blocks_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetJourneysFields_journeys_blocks_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface GetJourneysFields_journeys_blocks_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type GetJourneysFields_journeys_blocks_VideoTriggerBlock_triggerAction = GetJourneysFields_journeys_blocks_VideoTriggerBlock_triggerAction_NavigateToBlockAction | GetJourneysFields_journeys_blocks_VideoTriggerBlock_triggerAction_LinkAction | GetJourneysFields_journeys_blocks_VideoTriggerBlock_triggerAction_EmailAction;

export interface GetJourneysFields_journeys_blocks_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: GetJourneysFields_journeys_blocks_VideoTriggerBlock_triggerAction;
}

export type GetJourneysFields_journeys_blocks = GetJourneysFields_journeys_blocks_GridContainerBlock | GetJourneysFields_journeys_blocks_ButtonBlock | GetJourneysFields_journeys_blocks_CardBlock | GetJourneysFields_journeys_blocks_FormBlock | GetJourneysFields_journeys_blocks_IconBlock | GetJourneysFields_journeys_blocks_ImageBlock | GetJourneysFields_journeys_blocks_RadioOptionBlock | GetJourneysFields_journeys_blocks_RadioQuestionBlock | GetJourneysFields_journeys_blocks_SignUpBlock | GetJourneysFields_journeys_blocks_StepBlock | GetJourneysFields_journeys_blocks_TextResponseBlock | GetJourneysFields_journeys_blocks_TypographyBlock | GetJourneysFields_journeys_blocks_VideoBlock | GetJourneysFields_journeys_blocks_VideoTriggerBlock;

export interface GetJourneysFields_journeys_primaryImageBlock {
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
  scale: number | null;
}

export interface GetJourneysFields_journeys_creatorImageBlock {
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
  scale: number | null;
}

export interface GetJourneysFields_journeys_userJourneys_user {
  __typename: "User";
  id: string;
  firstName: string;
  lastName: string | null;
  imageUrl: string | null;
}

export interface GetJourneysFields_journeys_userJourneys {
  __typename: "UserJourney";
  id: string;
  role: UserJourneyRole;
  /**
   * Date time of when the journey was first opened
   */
  openedAt: any | null;
  user: GetJourneysFields_journeys_userJourneys_user | null;
}

export interface GetJourneysFields_journeys_chatButtons {
  __typename: "ChatButton";
  id: string;
  link: string | null;
  platform: MessagePlatform | null;
}

export interface GetJourneysFields_journeys_host {
  __typename: "Host";
  id: string;
  teamId: string;
  title: string;
  location: string | null;
  src1: string | null;
  src2: string | null;
}

export interface GetJourneysFields_journeys_team {
  __typename: "Team";
  id: string;
  title: string;
  publicTitle: string | null;
}

export interface GetJourneysFields_journeys_tags_name_language {
  __typename: "Language";
  id: string;
}

export interface GetJourneysFields_journeys_tags_name {
  __typename: "TagName";
  value: string;
  language: GetJourneysFields_journeys_tags_name_language;
  primary: boolean;
}

export interface GetJourneysFields_journeys_tags {
  __typename: "Tag";
  id: string;
  parentId: string | null;
  name: GetJourneysFields_journeys_tags_name[];
}

export interface GetJourneysFields_journeys_logoImageBlock {
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
  scale: number | null;
}

export interface GetJourneysFields_journeys_menuStepBlock {
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
   * nextBlockId contains the preferred block to navigate to, users will have to
   * manually set the next block they want to card to navigate to
   */
  nextBlockId: string | null;
  /**
   * Slug should be unique amongst all blocks
   * (server will throw BAD_USER_INPUT error if not)
   * If not required will use the current block id
   * If the generated slug is not unique the uuid will be placed
   * at the end of the slug guaranteeing uniqueness
   */
  slug: string | null;
}

export interface GetJourneysFields_journeys {
  __typename: "Journey";
  id: string;
  slug: string;
  /**
   * private title for creators
   */
  title: string;
  description: string | null;
  status: JourneyStatus;
  language: GetJourneysFields_journeys_language;
  createdAt: any;
  featuredAt: any | null;
  publishedAt: any | null;
  themeName: ThemeName;
  themeMode: ThemeMode;
  strategySlug: string | null;
  /**
   * title for seo and sharing
   */
  seoTitle: string | null;
  seoDescription: string | null;
  template: boolean | null;
  blocks: GetJourneysFields_journeys_blocks[] | null;
  primaryImageBlock: GetJourneysFields_journeys_primaryImageBlock | null;
  creatorDescription: string | null;
  creatorImageBlock: GetJourneysFields_journeys_creatorImageBlock | null;
  userJourneys: GetJourneysFields_journeys_userJourneys[] | null;
  chatButtons: GetJourneysFields_journeys_chatButtons[];
  host: GetJourneysFields_journeys_host | null;
  team: GetJourneysFields_journeys_team | null;
  tags: GetJourneysFields_journeys_tags[];
  website: boolean | null;
  showShareButton: boolean | null;
  showLikeButton: boolean | null;
  showDislikeButton: boolean | null;
  /**
   * public title for viewers
   */
  displayTitle: string | null;
  logoImageBlock: GetJourneysFields_journeys_logoImageBlock | null;
  menuButtonIcon: JourneyMenuButtonIcon | null;
  menuStepBlock: GetJourneysFields_journeys_menuStepBlock | null;
}

export interface GetJourneysFields {
  journeys: GetJourneysFields_journeys[];
}

export interface GetJourneysFieldsVariables {
  featured?: boolean | null;
  options?: JourneysQueryOptions | null;
}

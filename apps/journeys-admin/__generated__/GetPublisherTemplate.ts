/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyStatus, ThemeName, ThemeMode, ButtonVariant, ButtonColor, ButtonSize, ButtonAlignment, IconName, IconSize, IconColor, TextResponseType, TypographyAlign, TypographyColor, TypographyVariant, VideoBlockSource, VideoBlockObjectFit, UserJourneyRole, MessagePlatform, JourneyMenuButtonIcon } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetPublisherTemplate
// ====================================================

export interface GetPublisherTemplate_publisherTemplate_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface GetPublisherTemplate_publisherTemplate_language {
  __typename: "Language";
  id: string;
  bcp47: string | null;
  iso3: string | null;
  name: GetPublisherTemplate_publisherTemplate_language_name[];
}

export interface GetPublisherTemplate_publisherTemplate_blocks_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface GetPublisherTemplate_publisherTemplate_blocks_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetPublisherTemplate_publisherTemplate_blocks_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface GetPublisherTemplate_publisherTemplate_blocks_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type GetPublisherTemplate_publisherTemplate_blocks_ButtonBlock_action = GetPublisherTemplate_publisherTemplate_blocks_ButtonBlock_action_NavigateToBlockAction | GetPublisherTemplate_publisherTemplate_blocks_ButtonBlock_action_LinkAction | GetPublisherTemplate_publisherTemplate_blocks_ButtonBlock_action_EmailAction;

export interface GetPublisherTemplate_publisherTemplate_blocks_ButtonBlock_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface GetPublisherTemplate_publisherTemplate_blocks_ButtonBlock {
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
  action: GetPublisherTemplate_publisherTemplate_blocks_ButtonBlock_action | null;
  settings: GetPublisherTemplate_publisherTemplate_blocks_ButtonBlock_settings | null;
}

export interface GetPublisherTemplate_publisherTemplate_blocks_CardBlock {
  __typename: "CardBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * backgroundColor should be a HEX color value e.g #FFFFFF for white.
   */
  backgroundColor: string | null;
  /**
   * backdropBlur should be a number representing blur amount in pixels e.g 20.
   */
  backdropBlur: number | null;
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

export interface GetPublisherTemplate_publisherTemplate_blocks_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface GetPublisherTemplate_publisherTemplate_blocks_ImageBlock {
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
  focalTop: number | null;
  focalLeft: number | null;
}

export interface GetPublisherTemplate_publisherTemplate_blocks_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetPublisherTemplate_publisherTemplate_blocks_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface GetPublisherTemplate_publisherTemplate_blocks_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type GetPublisherTemplate_publisherTemplate_blocks_RadioOptionBlock_action = GetPublisherTemplate_publisherTemplate_blocks_RadioOptionBlock_action_NavigateToBlockAction | GetPublisherTemplate_publisherTemplate_blocks_RadioOptionBlock_action_LinkAction | GetPublisherTemplate_publisherTemplate_blocks_RadioOptionBlock_action_EmailAction;

export interface GetPublisherTemplate_publisherTemplate_blocks_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: GetPublisherTemplate_publisherTemplate_blocks_RadioOptionBlock_action | null;
  pollOptionImageBlockId: string | null;
}

export interface GetPublisherTemplate_publisherTemplate_blocks_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface GetPublisherTemplate_publisherTemplate_blocks_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetPublisherTemplate_publisherTemplate_blocks_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface GetPublisherTemplate_publisherTemplate_blocks_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type GetPublisherTemplate_publisherTemplate_blocks_SignUpBlock_action = GetPublisherTemplate_publisherTemplate_blocks_SignUpBlock_action_NavigateToBlockAction | GetPublisherTemplate_publisherTemplate_blocks_SignUpBlock_action_LinkAction | GetPublisherTemplate_publisherTemplate_blocks_SignUpBlock_action_EmailAction;

export interface GetPublisherTemplate_publisherTemplate_blocks_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: GetPublisherTemplate_publisherTemplate_blocks_SignUpBlock_action | null;
}

export interface GetPublisherTemplate_publisherTemplate_blocks_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface GetPublisherTemplate_publisherTemplate_blocks_StepBlock {
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

export interface GetPublisherTemplate_publisherTemplate_blocks_TextResponseBlock {
  __typename: "TextResponseBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  required: boolean | null;
  label: string;
  placeholder: string | null;
  hint: string | null;
  minRows: number | null;
  type: TextResponseType | null;
  routeId: string | null;
  integrationId: string | null;
}

export interface GetPublisherTemplate_publisherTemplate_blocks_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface GetPublisherTemplate_publisherTemplate_blocks_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: GetPublisherTemplate_publisherTemplate_blocks_TypographyBlock_settings | null;
}

export interface GetPublisherTemplate_publisherTemplate_blocks_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface GetPublisherTemplate_publisherTemplate_blocks_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface GetPublisherTemplate_publisherTemplate_blocks_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface GetPublisherTemplate_publisherTemplate_blocks_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface GetPublisherTemplate_publisherTemplate_blocks_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: GetPublisherTemplate_publisherTemplate_blocks_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface GetPublisherTemplate_publisherTemplate_blocks_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: GetPublisherTemplate_publisherTemplate_blocks_VideoBlock_mediaVideo_Video_title[];
  images: GetPublisherTemplate_publisherTemplate_blocks_VideoBlock_mediaVideo_Video_images[];
  variant: GetPublisherTemplate_publisherTemplate_blocks_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: GetPublisherTemplate_publisherTemplate_blocks_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface GetPublisherTemplate_publisherTemplate_blocks_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface GetPublisherTemplate_publisherTemplate_blocks_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type GetPublisherTemplate_publisherTemplate_blocks_VideoBlock_mediaVideo = GetPublisherTemplate_publisherTemplate_blocks_VideoBlock_mediaVideo_Video | GetPublisherTemplate_publisherTemplate_blocks_VideoBlock_mediaVideo_MuxVideo | GetPublisherTemplate_publisherTemplate_blocks_VideoBlock_mediaVideo_YouTube;

export interface GetPublisherTemplate_publisherTemplate_blocks_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetPublisherTemplate_publisherTemplate_blocks_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface GetPublisherTemplate_publisherTemplate_blocks_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type GetPublisherTemplate_publisherTemplate_blocks_VideoBlock_action = GetPublisherTemplate_publisherTemplate_blocks_VideoBlock_action_NavigateToBlockAction | GetPublisherTemplate_publisherTemplate_blocks_VideoBlock_action_LinkAction | GetPublisherTemplate_publisherTemplate_blocks_VideoBlock_action_EmailAction;

export interface GetPublisherTemplate_publisherTemplate_blocks_VideoBlock {
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
  mediaVideo: GetPublisherTemplate_publisherTemplate_blocks_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: GetPublisherTemplate_publisherTemplate_blocks_VideoBlock_action | null;
}

export interface GetPublisherTemplate_publisherTemplate_blocks_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetPublisherTemplate_publisherTemplate_blocks_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface GetPublisherTemplate_publisherTemplate_blocks_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type GetPublisherTemplate_publisherTemplate_blocks_VideoTriggerBlock_triggerAction = GetPublisherTemplate_publisherTemplate_blocks_VideoTriggerBlock_triggerAction_NavigateToBlockAction | GetPublisherTemplate_publisherTemplate_blocks_VideoTriggerBlock_triggerAction_LinkAction | GetPublisherTemplate_publisherTemplate_blocks_VideoTriggerBlock_triggerAction_EmailAction;

export interface GetPublisherTemplate_publisherTemplate_blocks_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: GetPublisherTemplate_publisherTemplate_blocks_VideoTriggerBlock_triggerAction;
}

export type GetPublisherTemplate_publisherTemplate_blocks = GetPublisherTemplate_publisherTemplate_blocks_GridContainerBlock | GetPublisherTemplate_publisherTemplate_blocks_ButtonBlock | GetPublisherTemplate_publisherTemplate_blocks_CardBlock | GetPublisherTemplate_publisherTemplate_blocks_IconBlock | GetPublisherTemplate_publisherTemplate_blocks_ImageBlock | GetPublisherTemplate_publisherTemplate_blocks_RadioOptionBlock | GetPublisherTemplate_publisherTemplate_blocks_RadioQuestionBlock | GetPublisherTemplate_publisherTemplate_blocks_SignUpBlock | GetPublisherTemplate_publisherTemplate_blocks_SpacerBlock | GetPublisherTemplate_publisherTemplate_blocks_StepBlock | GetPublisherTemplate_publisherTemplate_blocks_TextResponseBlock | GetPublisherTemplate_publisherTemplate_blocks_TypographyBlock | GetPublisherTemplate_publisherTemplate_blocks_VideoBlock | GetPublisherTemplate_publisherTemplate_blocks_VideoTriggerBlock;

export interface GetPublisherTemplate_publisherTemplate_primaryImageBlock {
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
  focalTop: number | null;
  focalLeft: number | null;
}

export interface GetPublisherTemplate_publisherTemplate_creatorImageBlock {
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
  focalTop: number | null;
  focalLeft: number | null;
}

export interface GetPublisherTemplate_publisherTemplate_userJourneys_user {
  __typename: "User";
  id: string;
  firstName: string;
  lastName: string | null;
  imageUrl: string | null;
}

export interface GetPublisherTemplate_publisherTemplate_userJourneys {
  __typename: "UserJourney";
  id: string;
  role: UserJourneyRole;
  /**
   * Date time of when the journey was first opened
   */
  openedAt: any | null;
  user: GetPublisherTemplate_publisherTemplate_userJourneys_user | null;
}

export interface GetPublisherTemplate_publisherTemplate_chatButtons {
  __typename: "ChatButton";
  id: string;
  link: string | null;
  platform: MessagePlatform | null;
}

export interface GetPublisherTemplate_publisherTemplate_host {
  __typename: "Host";
  id: string;
  teamId: string;
  title: string;
  location: string | null;
  src1: string | null;
  src2: string | null;
}

export interface GetPublisherTemplate_publisherTemplate_team {
  __typename: "Team";
  id: string;
  title: string;
  publicTitle: string | null;
}

export interface GetPublisherTemplate_publisherTemplate_tags_name_language {
  __typename: "Language";
  id: string;
}

export interface GetPublisherTemplate_publisherTemplate_tags_name {
  __typename: "TagName";
  value: string;
  language: GetPublisherTemplate_publisherTemplate_tags_name_language;
  primary: boolean;
}

export interface GetPublisherTemplate_publisherTemplate_tags {
  __typename: "Tag";
  id: string;
  parentId: string | null;
  name: GetPublisherTemplate_publisherTemplate_tags_name[];
}

export interface GetPublisherTemplate_publisherTemplate_logoImageBlock {
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
  focalTop: number | null;
  focalLeft: number | null;
}

export interface GetPublisherTemplate_publisherTemplate_menuStepBlock {
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

export interface GetPublisherTemplate_publisherTemplate_journeyTheme {
  __typename: "JourneyTheme";
  id: string;
  headerFont: string | null;
  bodyFont: string | null;
  labelFont: string | null;
}

export interface GetPublisherTemplate_publisherTemplate {
  __typename: "Journey";
  id: string;
  slug: string;
  /**
   * private title for creators
   */
  title: string;
  description: string | null;
  status: JourneyStatus;
  language: GetPublisherTemplate_publisherTemplate_language;
  createdAt: any;
  updatedAt: any;
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
  blocks: GetPublisherTemplate_publisherTemplate_blocks[] | null;
  primaryImageBlock: GetPublisherTemplate_publisherTemplate_primaryImageBlock | null;
  creatorDescription: string | null;
  creatorImageBlock: GetPublisherTemplate_publisherTemplate_creatorImageBlock | null;
  userJourneys: GetPublisherTemplate_publisherTemplate_userJourneys[] | null;
  chatButtons: GetPublisherTemplate_publisherTemplate_chatButtons[];
  host: GetPublisherTemplate_publisherTemplate_host | null;
  team: GetPublisherTemplate_publisherTemplate_team | null;
  tags: GetPublisherTemplate_publisherTemplate_tags[];
  website: boolean | null;
  showShareButton: boolean | null;
  showLikeButton: boolean | null;
  showDislikeButton: boolean | null;
  /**
   * public title for viewers
   */
  displayTitle: string | null;
  logoImageBlock: GetPublisherTemplate_publisherTemplate_logoImageBlock | null;
  menuButtonIcon: JourneyMenuButtonIcon | null;
  menuStepBlock: GetPublisherTemplate_publisherTemplate_menuStepBlock | null;
  journeyTheme: GetPublisherTemplate_publisherTemplate_journeyTheme | null;
}

export interface GetPublisherTemplate {
  publisherTemplate: GetPublisherTemplate_publisherTemplate;
}

export interface GetPublisherTemplateVariables {
  id: string;
}

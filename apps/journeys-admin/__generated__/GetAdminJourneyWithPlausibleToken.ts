/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyStatus, ThemeName, ThemeMode, ButtonVariant, ButtonColor, ButtonSize, ButtonAlignment, IconName, IconSize, IconColor, TextResponseType, TypographyAlign, TypographyColor, TypographyVariant, VideoBlockSource, VideoBlockObjectFit, UserJourneyRole, MessagePlatform, JourneyMenuButtonIcon } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetAdminJourneyWithPlausibleToken
// ====================================================

export interface GetAdminJourneyWithPlausibleToken_journey_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface GetAdminJourneyWithPlausibleToken_journey_language {
  __typename: "Language";
  id: string;
  bcp47: string | null;
  iso3: string | null;
  name: GetAdminJourneyWithPlausibleToken_journey_language_name[];
}

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_ButtonBlock_action_ChatAction {
  __typename: "ChatAction" | "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type GetAdminJourneyWithPlausibleToken_journey_blocks_ButtonBlock_action = GetAdminJourneyWithPlausibleToken_journey_blocks_ButtonBlock_action_ChatAction | GetAdminJourneyWithPlausibleToken_journey_blocks_ButtonBlock_action_NavigateToBlockAction | GetAdminJourneyWithPlausibleToken_journey_blocks_ButtonBlock_action_LinkAction | GetAdminJourneyWithPlausibleToken_journey_blocks_ButtonBlock_action_EmailAction;

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_ButtonBlock_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_ButtonBlock {
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
  action: GetAdminJourneyWithPlausibleToken_journey_blocks_ButtonBlock_action | null;
  settings: GetAdminJourneyWithPlausibleToken_journey_blocks_ButtonBlock_settings | null;
}

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_CardBlock {
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

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_ImageBlock {
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

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_RadioOptionBlock_action_ChatAction {
  __typename: "ChatAction" | "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type GetAdminJourneyWithPlausibleToken_journey_blocks_RadioOptionBlock_action = GetAdminJourneyWithPlausibleToken_journey_blocks_RadioOptionBlock_action_ChatAction | GetAdminJourneyWithPlausibleToken_journey_blocks_RadioOptionBlock_action_NavigateToBlockAction | GetAdminJourneyWithPlausibleToken_journey_blocks_RadioOptionBlock_action_LinkAction | GetAdminJourneyWithPlausibleToken_journey_blocks_RadioOptionBlock_action_EmailAction;

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: GetAdminJourneyWithPlausibleToken_journey_blocks_RadioOptionBlock_action | null;
  /**
   * pollOptionImageBlockId is present if a child block should be used as a poll option image.
   *       This child block should not be rendered normally, instead it should be used
   *       as a poll option image. Blocks are often of type ImageBlock
   */
  pollOptionImageBlockId: string | null;
}

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_SignUpBlock_action_ChatAction {
  __typename: "ChatAction" | "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type GetAdminJourneyWithPlausibleToken_journey_blocks_SignUpBlock_action = GetAdminJourneyWithPlausibleToken_journey_blocks_SignUpBlock_action_ChatAction | GetAdminJourneyWithPlausibleToken_journey_blocks_SignUpBlock_action_NavigateToBlockAction | GetAdminJourneyWithPlausibleToken_journey_blocks_SignUpBlock_action_LinkAction | GetAdminJourneyWithPlausibleToken_journey_blocks_SignUpBlock_action_EmailAction;

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: GetAdminJourneyWithPlausibleToken_journey_blocks_SignUpBlock_action | null;
}

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_StepBlock {
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

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_TextResponseBlock {
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

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: GetAdminJourneyWithPlausibleToken_journey_blocks_TypographyBlock_settings | null;
}

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: GetAdminJourneyWithPlausibleToken_journey_blocks_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: GetAdminJourneyWithPlausibleToken_journey_blocks_VideoBlock_mediaVideo_Video_title[];
  images: GetAdminJourneyWithPlausibleToken_journey_blocks_VideoBlock_mediaVideo_Video_images[];
  variant: GetAdminJourneyWithPlausibleToken_journey_blocks_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: GetAdminJourneyWithPlausibleToken_journey_blocks_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type GetAdminJourneyWithPlausibleToken_journey_blocks_VideoBlock_mediaVideo = GetAdminJourneyWithPlausibleToken_journey_blocks_VideoBlock_mediaVideo_Video | GetAdminJourneyWithPlausibleToken_journey_blocks_VideoBlock_mediaVideo_MuxVideo | GetAdminJourneyWithPlausibleToken_journey_blocks_VideoBlock_mediaVideo_YouTube;

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_VideoBlock_action_ChatAction {
  __typename: "ChatAction" | "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type GetAdminJourneyWithPlausibleToken_journey_blocks_VideoBlock_action = GetAdminJourneyWithPlausibleToken_journey_blocks_VideoBlock_action_ChatAction | GetAdminJourneyWithPlausibleToken_journey_blocks_VideoBlock_action_NavigateToBlockAction | GetAdminJourneyWithPlausibleToken_journey_blocks_VideoBlock_action_LinkAction | GetAdminJourneyWithPlausibleToken_journey_blocks_VideoBlock_action_EmailAction;

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_VideoBlock {
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
  mediaVideo: GetAdminJourneyWithPlausibleToken_journey_blocks_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: GetAdminJourneyWithPlausibleToken_journey_blocks_VideoBlock_action | null;
}

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_VideoTriggerBlock_triggerAction_ChatAction {
  __typename: "ChatAction" | "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type GetAdminJourneyWithPlausibleToken_journey_blocks_VideoTriggerBlock_triggerAction = GetAdminJourneyWithPlausibleToken_journey_blocks_VideoTriggerBlock_triggerAction_ChatAction | GetAdminJourneyWithPlausibleToken_journey_blocks_VideoTriggerBlock_triggerAction_NavigateToBlockAction | GetAdminJourneyWithPlausibleToken_journey_blocks_VideoTriggerBlock_triggerAction_LinkAction | GetAdminJourneyWithPlausibleToken_journey_blocks_VideoTriggerBlock_triggerAction_EmailAction;

export interface GetAdminJourneyWithPlausibleToken_journey_blocks_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: GetAdminJourneyWithPlausibleToken_journey_blocks_VideoTriggerBlock_triggerAction;
}

export type GetAdminJourneyWithPlausibleToken_journey_blocks = GetAdminJourneyWithPlausibleToken_journey_blocks_GridContainerBlock | GetAdminJourneyWithPlausibleToken_journey_blocks_ButtonBlock | GetAdminJourneyWithPlausibleToken_journey_blocks_CardBlock | GetAdminJourneyWithPlausibleToken_journey_blocks_IconBlock | GetAdminJourneyWithPlausibleToken_journey_blocks_ImageBlock | GetAdminJourneyWithPlausibleToken_journey_blocks_RadioOptionBlock | GetAdminJourneyWithPlausibleToken_journey_blocks_RadioQuestionBlock | GetAdminJourneyWithPlausibleToken_journey_blocks_SignUpBlock | GetAdminJourneyWithPlausibleToken_journey_blocks_SpacerBlock | GetAdminJourneyWithPlausibleToken_journey_blocks_StepBlock | GetAdminJourneyWithPlausibleToken_journey_blocks_TextResponseBlock | GetAdminJourneyWithPlausibleToken_journey_blocks_TypographyBlock | GetAdminJourneyWithPlausibleToken_journey_blocks_VideoBlock | GetAdminJourneyWithPlausibleToken_journey_blocks_VideoTriggerBlock;

export interface GetAdminJourneyWithPlausibleToken_journey_primaryImageBlock {
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

export interface GetAdminJourneyWithPlausibleToken_journey_creatorImageBlock {
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

export interface GetAdminJourneyWithPlausibleToken_journey_userJourneys_user {
  __typename: "User";
  id: string;
  firstName: string;
  lastName: string | null;
  imageUrl: string | null;
}

export interface GetAdminJourneyWithPlausibleToken_journey_userJourneys {
  __typename: "UserJourney";
  id: string;
  role: UserJourneyRole;
  /**
   * Date time of when the journey was first opened
   */
  openedAt: any | null;
  user: GetAdminJourneyWithPlausibleToken_journey_userJourneys_user | null;
}

export interface GetAdminJourneyWithPlausibleToken_journey_chatButtons {
  __typename: "ChatButton";
  id: string;
  link: string | null;
  platform: MessagePlatform | null;
}

export interface GetAdminJourneyWithPlausibleToken_journey_host {
  __typename: "Host";
  id: string;
  teamId: string;
  title: string;
  location: string | null;
  src1: string | null;
  src2: string | null;
}

export interface GetAdminJourneyWithPlausibleToken_journey_team {
  __typename: "Team";
  id: string;
  title: string;
  publicTitle: string | null;
}

export interface GetAdminJourneyWithPlausibleToken_journey_tags_name_language {
  __typename: "Language";
  id: string;
}

export interface GetAdminJourneyWithPlausibleToken_journey_tags_name {
  __typename: "TagName";
  value: string;
  language: GetAdminJourneyWithPlausibleToken_journey_tags_name_language;
  primary: boolean;
}

export interface GetAdminJourneyWithPlausibleToken_journey_tags {
  __typename: "Tag";
  id: string;
  parentId: string | null;
  name: GetAdminJourneyWithPlausibleToken_journey_tags_name[];
}

export interface GetAdminJourneyWithPlausibleToken_journey_logoImageBlock {
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

export interface GetAdminJourneyWithPlausibleToken_journey_menuStepBlock {
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

export interface GetAdminJourneyWithPlausibleToken_journey_journeyTheme {
  __typename: "JourneyTheme";
  id: string;
  headerFont: string | null;
  bodyFont: string | null;
  labelFont: string | null;
}

export interface GetAdminJourneyWithPlausibleToken_journey_journeyCustomizationFields {
  __typename: "JourneyCustomizationField";
  id: string;
  journeyId: string;
  key: string;
  value: string | null;
  defaultValue: string | null;
}

export interface GetAdminJourneyWithPlausibleToken_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  /**
   * private title for creators
   */
  title: string;
  description: string | null;
  status: JourneyStatus;
  language: GetAdminJourneyWithPlausibleToken_journey_language;
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
  blocks: GetAdminJourneyWithPlausibleToken_journey_blocks[] | null;
  primaryImageBlock: GetAdminJourneyWithPlausibleToken_journey_primaryImageBlock | null;
  creatorDescription: string | null;
  creatorImageBlock: GetAdminJourneyWithPlausibleToken_journey_creatorImageBlock | null;
  userJourneys: GetAdminJourneyWithPlausibleToken_journey_userJourneys[] | null;
  chatButtons: GetAdminJourneyWithPlausibleToken_journey_chatButtons[];
  host: GetAdminJourneyWithPlausibleToken_journey_host | null;
  team: GetAdminJourneyWithPlausibleToken_journey_team | null;
  tags: GetAdminJourneyWithPlausibleToken_journey_tags[];
  website: boolean | null;
  showShareButton: boolean | null;
  showLikeButton: boolean | null;
  showDislikeButton: boolean | null;
  /**
   * public title for viewers
   */
  displayTitle: string | null;
  logoImageBlock: GetAdminJourneyWithPlausibleToken_journey_logoImageBlock | null;
  menuButtonIcon: JourneyMenuButtonIcon | null;
  menuStepBlock: GetAdminJourneyWithPlausibleToken_journey_menuStepBlock | null;
  socialNodeX: number | null;
  socialNodeY: number | null;
  journeyTheme: GetAdminJourneyWithPlausibleToken_journey_journeyTheme | null;
  journeyCustomizationDescription: string | null;
  journeyCustomizationFields: GetAdminJourneyWithPlausibleToken_journey_journeyCustomizationFields[];
  fromTemplateId: string | null;
  /**
   * used in a plausible share link to embed report
   */
  plausibleToken: string | null;
}

export interface GetAdminJourneyWithPlausibleToken {
  journey: GetAdminJourneyWithPlausibleToken_journey;
}

export interface GetAdminJourneyWithPlausibleTokenVariables {
  id: string;
}

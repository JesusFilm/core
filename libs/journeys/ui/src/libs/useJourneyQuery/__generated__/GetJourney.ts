/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { IdType, JourneysQueryOptions, JourneyStatus, ThemeName, ThemeMode, ButtonVariant, ButtonColor, ButtonSize, ButtonAlignment, IconName, IconSize, IconColor, TextResponseType, TypographyAlign, TypographyColor, TypographyVariant, VideoBlockSource, VideoBlockObjectFit, UserJourneyRole, MessagePlatform, JourneyMenuButtonIcon } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: GetJourney
// ====================================================

export interface GetJourney_journey_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface GetJourney_journey_language {
  __typename: "Language";
  id: string;
  bcp47: string | null;
  iso3: string | null;
  name: GetJourney_journey_language_name[];
}

export interface GetJourney_journey_blocks_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface GetJourney_journey_blocks_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetJourney_journey_blocks_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  url: string;
}

export interface GetJourney_journey_blocks_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  email: string;
}

export type GetJourney_journey_blocks_ButtonBlock_action = GetJourney_journey_blocks_ButtonBlock_action_NavigateToBlockAction | GetJourney_journey_blocks_ButtonBlock_action_LinkAction | GetJourney_journey_blocks_ButtonBlock_action_EmailAction;

export interface GetJourney_journey_blocks_ButtonBlock_settings {
  __typename: "ButtonBlockSettings";
  alignment: ButtonAlignment | null;
}

export interface GetJourney_journey_blocks_ButtonBlock {
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
  action: GetJourney_journey_blocks_ButtonBlock_action | null;
  settings: GetJourney_journey_blocks_ButtonBlock_settings | null;
}

export interface GetJourney_journey_blocks_CardBlock {
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

export interface GetJourney_journey_blocks_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface GetJourney_journey_blocks_ImageBlock {
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

export interface GetJourney_journey_blocks_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetJourney_journey_blocks_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  url: string;
}

export interface GetJourney_journey_blocks_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  email: string;
}

export type GetJourney_journey_blocks_RadioOptionBlock_action = GetJourney_journey_blocks_RadioOptionBlock_action_NavigateToBlockAction | GetJourney_journey_blocks_RadioOptionBlock_action_LinkAction | GetJourney_journey_blocks_RadioOptionBlock_action_EmailAction;

export interface GetJourney_journey_blocks_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: GetJourney_journey_blocks_RadioOptionBlock_action | null;
  /**
   * pollOptionImageBlockId is present if a child block should be used as a poll option image.
   *       This child block should not be rendered normally, instead it should be used
   *       as a poll option image. Blocks are often of type ImageBlock
   */
  pollOptionImageBlockId: string | null;
}

export interface GetJourney_journey_blocks_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface GetJourney_journey_blocks_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetJourney_journey_blocks_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  url: string;
}

export interface GetJourney_journey_blocks_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  email: string;
}

export type GetJourney_journey_blocks_SignUpBlock_action = GetJourney_journey_blocks_SignUpBlock_action_NavigateToBlockAction | GetJourney_journey_blocks_SignUpBlock_action_LinkAction | GetJourney_journey_blocks_SignUpBlock_action_EmailAction;

export interface GetJourney_journey_blocks_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: GetJourney_journey_blocks_SignUpBlock_action | null;
}

export interface GetJourney_journey_blocks_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface GetJourney_journey_blocks_StepBlock {
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

export interface GetJourney_journey_blocks_TextResponseBlock {
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

export interface GetJourney_journey_blocks_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface GetJourney_journey_blocks_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: GetJourney_journey_blocks_TypographyBlock_settings | null;
}

export interface GetJourney_journey_blocks_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface GetJourney_journey_blocks_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface GetJourney_journey_blocks_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface GetJourney_journey_blocks_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface GetJourney_journey_blocks_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: GetJourney_journey_blocks_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface GetJourney_journey_blocks_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: GetJourney_journey_blocks_VideoBlock_mediaVideo_Video_title[];
  images: GetJourney_journey_blocks_VideoBlock_mediaVideo_Video_images[];
  variant: GetJourney_journey_blocks_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: GetJourney_journey_blocks_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface GetJourney_journey_blocks_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface GetJourney_journey_blocks_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type GetJourney_journey_blocks_VideoBlock_mediaVideo = GetJourney_journey_blocks_VideoBlock_mediaVideo_Video | GetJourney_journey_blocks_VideoBlock_mediaVideo_MuxVideo | GetJourney_journey_blocks_VideoBlock_mediaVideo_YouTube;

export interface GetJourney_journey_blocks_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetJourney_journey_blocks_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  url: string;
}

export interface GetJourney_journey_blocks_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  email: string;
}

export type GetJourney_journey_blocks_VideoBlock_action = GetJourney_journey_blocks_VideoBlock_action_NavigateToBlockAction | GetJourney_journey_blocks_VideoBlock_action_LinkAction | GetJourney_journey_blocks_VideoBlock_action_EmailAction;

export interface GetJourney_journey_blocks_VideoBlock {
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
  mediaVideo: GetJourney_journey_blocks_VideoBlock_mediaVideo | null;
  action: GetJourney_journey_blocks_VideoBlock_action | null;
}

export interface GetJourney_journey_blocks_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetJourney_journey_blocks_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  url: string;
}

export interface GetJourney_journey_blocks_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  email: string;
}

export type GetJourney_journey_blocks_VideoTriggerBlock_triggerAction = GetJourney_journey_blocks_VideoTriggerBlock_triggerAction_NavigateToBlockAction | GetJourney_journey_blocks_VideoTriggerBlock_triggerAction_LinkAction | GetJourney_journey_blocks_VideoTriggerBlock_triggerAction_EmailAction;

export interface GetJourney_journey_blocks_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: GetJourney_journey_blocks_VideoTriggerBlock_triggerAction | null;
}

export type GetJourney_journey_blocks = GetJourney_journey_blocks_GridContainerBlock | GetJourney_journey_blocks_ButtonBlock | GetJourney_journey_blocks_CardBlock | GetJourney_journey_blocks_IconBlock | GetJourney_journey_blocks_ImageBlock | GetJourney_journey_blocks_RadioOptionBlock | GetJourney_journey_blocks_RadioQuestionBlock | GetJourney_journey_blocks_SignUpBlock | GetJourney_journey_blocks_SpacerBlock | GetJourney_journey_blocks_StepBlock | GetJourney_journey_blocks_TextResponseBlock | GetJourney_journey_blocks_TypographyBlock | GetJourney_journey_blocks_VideoBlock | GetJourney_journey_blocks_VideoTriggerBlock;

export interface GetJourney_journey_primaryImageBlock {
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

export interface GetJourney_journey_creatorImageBlock_ButtonBlock {
  __typename: "ButtonBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "RadioQuestionBlock" | "RadioOptionBlock" | "SignUpBlock" | "SpacerBlock" | "StepBlock" | "TextResponseBlock" | "VideoTriggerBlock" | "VideoBlock" | "TypographyBlock";
}

export interface GetJourney_journey_creatorImageBlock_ImageBlock {
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

export type GetJourney_journey_creatorImageBlock = GetJourney_journey_creatorImageBlock_ButtonBlock | GetJourney_journey_creatorImageBlock_ImageBlock;

export interface GetJourney_journey_userJourneys_user {
  __typename: "User";
  id: string;
  firstName: string;
  lastName: string | null;
  imageUrl: string | null;
}

export interface GetJourney_journey_userJourneys {
  __typename: "UserJourney";
  id: string | null;
  role: UserJourneyRole | null;
  openedAt: any | null;
  user: GetJourney_journey_userJourneys_user | null;
}

export interface GetJourney_journey_chatButtons {
  __typename: "ChatButton";
  id: string | null;
  link: string | null;
  platform: MessagePlatform | null;
}

export interface GetJourney_journey_host {
  __typename: "Host";
  id: string | null;
  teamId: string | null;
  title: string | null;
  location: string | null;
  src1: string | null;
  src2: string | null;
}

export interface GetJourney_journey_team {
  __typename: "Team";
  id: string | null;
  title: string | null;
  publicTitle: string | null;
}

export interface GetJourney_journey_tags_name_language {
  __typename: "Language";
  id: string;
}

export interface GetJourney_journey_tags_name {
  __typename: "TagName";
  value: string;
  language: GetJourney_journey_tags_name_language;
  primary: boolean;
}

export interface GetJourney_journey_tags {
  __typename: "Tag";
  id: string;
  parentId: string | null;
  name: GetJourney_journey_tags_name[];
}

export interface GetJourney_journey_logoImageBlock_ButtonBlock {
  __typename: "ButtonBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "RadioQuestionBlock" | "RadioOptionBlock" | "SignUpBlock" | "SpacerBlock" | "StepBlock" | "TextResponseBlock" | "VideoTriggerBlock" | "VideoBlock" | "TypographyBlock";
}

export interface GetJourney_journey_logoImageBlock_ImageBlock {
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

export type GetJourney_journey_logoImageBlock = GetJourney_journey_logoImageBlock_ButtonBlock | GetJourney_journey_logoImageBlock_ImageBlock;

export interface GetJourney_journey_menuStepBlock_ImageBlock {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "RadioQuestionBlock" | "RadioOptionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "VideoTriggerBlock" | "VideoBlock" | "TypographyBlock";
}

export interface GetJourney_journey_menuStepBlock_StepBlock {
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

export type GetJourney_journey_menuStepBlock = GetJourney_journey_menuStepBlock_ImageBlock | GetJourney_journey_menuStepBlock_StepBlock;

export interface GetJourney_journey_journeyTheme {
  __typename: "JourneyTheme";
  id: string | null;
  headerFont: string | null;
  bodyFont: string | null;
  labelFont: string | null;
}

export interface GetJourney_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  /**
   * private title for creators
   */
  title: string;
  description: string | null;
  status: JourneyStatus;
  language: GetJourney_journey_language;
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
  blocks: GetJourney_journey_blocks[] | null;
  primaryImageBlock: GetJourney_journey_primaryImageBlock | null;
  creatorDescription: string | null;
  creatorImageBlock: GetJourney_journey_creatorImageBlock | null;
  userJourneys: GetJourney_journey_userJourneys[] | null;
  chatButtons: GetJourney_journey_chatButtons[] | null;
  host: GetJourney_journey_host | null;
  team: GetJourney_journey_team | null;
  tags: GetJourney_journey_tags[];
  website: boolean | null;
  showShareButton: boolean | null;
  showLikeButton: boolean | null;
  showDislikeButton: boolean | null;
  /**
   * public title for viewers
   */
  displayTitle: string | null;
  logoImageBlock: GetJourney_journey_logoImageBlock | null;
  menuButtonIcon: JourneyMenuButtonIcon | null;
  menuStepBlock: GetJourney_journey_menuStepBlock | null;
  journeyTheme: GetJourney_journey_journeyTheme | null;
}

export interface GetJourney {
  journey: GetJourney_journey | null;
}

export interface GetJourneyVariables {
  id: string;
  idType?: IdType | null;
  options?: JourneysQueryOptions | null;
}

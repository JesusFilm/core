/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyUpdateInput, JourneyStatus, ThemeName, ThemeMode, ButtonVariant, ButtonColor, ButtonSize, IconName, IconSize, IconColor, TextResponseType, TypographyAlign, TypographyColor, TypographyVariant, VideoBlockSource, VideoBlockObjectFit, UserJourneyRole, MessagePlatform, JourneyMenuButtonIcon } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: AiJourneyUpdate
// ====================================================

export interface AiJourneyUpdate_journeyUpdate_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface AiJourneyUpdate_journeyUpdate_language {
  __typename: "Language";
  id: string;
  bcp47: string | null;
  iso3: string | null;
  name: AiJourneyUpdate_journeyUpdate_language_name[];
}

export interface AiJourneyUpdate_journeyUpdate_blocks_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface AiJourneyUpdate_journeyUpdate_blocks_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface AiJourneyUpdate_journeyUpdate_blocks_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface AiJourneyUpdate_journeyUpdate_blocks_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type AiJourneyUpdate_journeyUpdate_blocks_ButtonBlock_action = AiJourneyUpdate_journeyUpdate_blocks_ButtonBlock_action_NavigateToBlockAction | AiJourneyUpdate_journeyUpdate_blocks_ButtonBlock_action_LinkAction | AiJourneyUpdate_journeyUpdate_blocks_ButtonBlock_action_EmailAction;

export interface AiJourneyUpdate_journeyUpdate_blocks_ButtonBlock {
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
  action: AiJourneyUpdate_journeyUpdate_blocks_ButtonBlock_action | null;
}

export interface AiJourneyUpdate_journeyUpdate_blocks_CardBlock {
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

export interface AiJourneyUpdate_journeyUpdate_blocks_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface AiJourneyUpdate_journeyUpdate_blocks_ImageBlock {
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

export interface AiJourneyUpdate_journeyUpdate_blocks_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface AiJourneyUpdate_journeyUpdate_blocks_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface AiJourneyUpdate_journeyUpdate_blocks_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type AiJourneyUpdate_journeyUpdate_blocks_RadioOptionBlock_action = AiJourneyUpdate_journeyUpdate_blocks_RadioOptionBlock_action_NavigateToBlockAction | AiJourneyUpdate_journeyUpdate_blocks_RadioOptionBlock_action_LinkAction | AiJourneyUpdate_journeyUpdate_blocks_RadioOptionBlock_action_EmailAction;

export interface AiJourneyUpdate_journeyUpdate_blocks_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: AiJourneyUpdate_journeyUpdate_blocks_RadioOptionBlock_action | null;
}

export interface AiJourneyUpdate_journeyUpdate_blocks_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface AiJourneyUpdate_journeyUpdate_blocks_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface AiJourneyUpdate_journeyUpdate_blocks_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface AiJourneyUpdate_journeyUpdate_blocks_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type AiJourneyUpdate_journeyUpdate_blocks_SignUpBlock_action = AiJourneyUpdate_journeyUpdate_blocks_SignUpBlock_action_NavigateToBlockAction | AiJourneyUpdate_journeyUpdate_blocks_SignUpBlock_action_LinkAction | AiJourneyUpdate_journeyUpdate_blocks_SignUpBlock_action_EmailAction;

export interface AiJourneyUpdate_journeyUpdate_blocks_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: AiJourneyUpdate_journeyUpdate_blocks_SignUpBlock_action | null;
}

export interface AiJourneyUpdate_journeyUpdate_blocks_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface AiJourneyUpdate_journeyUpdate_blocks_StepBlock {
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

export interface AiJourneyUpdate_journeyUpdate_blocks_TextResponseBlock {
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

export interface AiJourneyUpdate_journeyUpdate_blocks_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
}

export interface AiJourneyUpdate_journeyUpdate_blocks_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface AiJourneyUpdate_journeyUpdate_blocks_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface AiJourneyUpdate_journeyUpdate_blocks_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface AiJourneyUpdate_journeyUpdate_blocks_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface AiJourneyUpdate_journeyUpdate_blocks_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: AiJourneyUpdate_journeyUpdate_blocks_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface AiJourneyUpdate_journeyUpdate_blocks_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: AiJourneyUpdate_journeyUpdate_blocks_VideoBlock_mediaVideo_Video_title[];
  images: AiJourneyUpdate_journeyUpdate_blocks_VideoBlock_mediaVideo_Video_images[];
  variant: AiJourneyUpdate_journeyUpdate_blocks_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: AiJourneyUpdate_journeyUpdate_blocks_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface AiJourneyUpdate_journeyUpdate_blocks_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface AiJourneyUpdate_journeyUpdate_blocks_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type AiJourneyUpdate_journeyUpdate_blocks_VideoBlock_mediaVideo = AiJourneyUpdate_journeyUpdate_blocks_VideoBlock_mediaVideo_Video | AiJourneyUpdate_journeyUpdate_blocks_VideoBlock_mediaVideo_MuxVideo | AiJourneyUpdate_journeyUpdate_blocks_VideoBlock_mediaVideo_YouTube;

export interface AiJourneyUpdate_journeyUpdate_blocks_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface AiJourneyUpdate_journeyUpdate_blocks_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface AiJourneyUpdate_journeyUpdate_blocks_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type AiJourneyUpdate_journeyUpdate_blocks_VideoBlock_action = AiJourneyUpdate_journeyUpdate_blocks_VideoBlock_action_NavigateToBlockAction | AiJourneyUpdate_journeyUpdate_blocks_VideoBlock_action_LinkAction | AiJourneyUpdate_journeyUpdate_blocks_VideoBlock_action_EmailAction;

export interface AiJourneyUpdate_journeyUpdate_blocks_VideoBlock {
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
  mediaVideo: AiJourneyUpdate_journeyUpdate_blocks_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: AiJourneyUpdate_journeyUpdate_blocks_VideoBlock_action | null;
}

export interface AiJourneyUpdate_journeyUpdate_blocks_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface AiJourneyUpdate_journeyUpdate_blocks_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface AiJourneyUpdate_journeyUpdate_blocks_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type AiJourneyUpdate_journeyUpdate_blocks_VideoTriggerBlock_triggerAction = AiJourneyUpdate_journeyUpdate_blocks_VideoTriggerBlock_triggerAction_NavigateToBlockAction | AiJourneyUpdate_journeyUpdate_blocks_VideoTriggerBlock_triggerAction_LinkAction | AiJourneyUpdate_journeyUpdate_blocks_VideoTriggerBlock_triggerAction_EmailAction;

export interface AiJourneyUpdate_journeyUpdate_blocks_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: AiJourneyUpdate_journeyUpdate_blocks_VideoTriggerBlock_triggerAction;
}

export type AiJourneyUpdate_journeyUpdate_blocks = AiJourneyUpdate_journeyUpdate_blocks_GridContainerBlock | AiJourneyUpdate_journeyUpdate_blocks_ButtonBlock | AiJourneyUpdate_journeyUpdate_blocks_CardBlock | AiJourneyUpdate_journeyUpdate_blocks_IconBlock | AiJourneyUpdate_journeyUpdate_blocks_ImageBlock | AiJourneyUpdate_journeyUpdate_blocks_RadioOptionBlock | AiJourneyUpdate_journeyUpdate_blocks_RadioQuestionBlock | AiJourneyUpdate_journeyUpdate_blocks_SignUpBlock | AiJourneyUpdate_journeyUpdate_blocks_SpacerBlock | AiJourneyUpdate_journeyUpdate_blocks_StepBlock | AiJourneyUpdate_journeyUpdate_blocks_TextResponseBlock | AiJourneyUpdate_journeyUpdate_blocks_TypographyBlock | AiJourneyUpdate_journeyUpdate_blocks_VideoBlock | AiJourneyUpdate_journeyUpdate_blocks_VideoTriggerBlock;

export interface AiJourneyUpdate_journeyUpdate_primaryImageBlock {
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

export interface AiJourneyUpdate_journeyUpdate_creatorImageBlock {
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

export interface AiJourneyUpdate_journeyUpdate_userJourneys_user {
  __typename: "User";
  id: string;
  firstName: string;
  lastName: string | null;
  imageUrl: string | null;
}

export interface AiJourneyUpdate_journeyUpdate_userJourneys {
  __typename: "UserJourney";
  id: string;
  role: UserJourneyRole;
  /**
   * Date time of when the journey was first opened
   */
  openedAt: any | null;
  user: AiJourneyUpdate_journeyUpdate_userJourneys_user | null;
}

export interface AiJourneyUpdate_journeyUpdate_chatButtons {
  __typename: "ChatButton";
  id: string;
  link: string | null;
  platform: MessagePlatform | null;
}

export interface AiJourneyUpdate_journeyUpdate_host {
  __typename: "Host";
  id: string;
  teamId: string;
  title: string;
  location: string | null;
  src1: string | null;
  src2: string | null;
}

export interface AiJourneyUpdate_journeyUpdate_team {
  __typename: "Team";
  id: string;
  title: string;
  publicTitle: string | null;
}

export interface AiJourneyUpdate_journeyUpdate_tags_name_language {
  __typename: "Language";
  id: string;
}

export interface AiJourneyUpdate_journeyUpdate_tags_name {
  __typename: "TagName";
  value: string;
  language: AiJourneyUpdate_journeyUpdate_tags_name_language;
  primary: boolean;
}

export interface AiJourneyUpdate_journeyUpdate_tags {
  __typename: "Tag";
  id: string;
  parentId: string | null;
  name: AiJourneyUpdate_journeyUpdate_tags_name[];
}

export interface AiJourneyUpdate_journeyUpdate_logoImageBlock {
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

export interface AiJourneyUpdate_journeyUpdate_menuStepBlock {
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

export interface AiJourneyUpdate_journeyUpdate {
  __typename: "Journey";
  id: string;
  slug: string;
  /**
   * private title for creators
   */
  title: string;
  description: string | null;
  status: JourneyStatus;
  language: AiJourneyUpdate_journeyUpdate_language;
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
  blocks: AiJourneyUpdate_journeyUpdate_blocks[] | null;
  primaryImageBlock: AiJourneyUpdate_journeyUpdate_primaryImageBlock | null;
  creatorDescription: string | null;
  creatorImageBlock: AiJourneyUpdate_journeyUpdate_creatorImageBlock | null;
  userJourneys: AiJourneyUpdate_journeyUpdate_userJourneys[] | null;
  chatButtons: AiJourneyUpdate_journeyUpdate_chatButtons[];
  host: AiJourneyUpdate_journeyUpdate_host | null;
  team: AiJourneyUpdate_journeyUpdate_team | null;
  tags: AiJourneyUpdate_journeyUpdate_tags[];
  website: boolean | null;
  showShareButton: boolean | null;
  showLikeButton: boolean | null;
  showDislikeButton: boolean | null;
  /**
   * public title for viewers
   */
  displayTitle: string | null;
  logoImageBlock: AiJourneyUpdate_journeyUpdate_logoImageBlock | null;
  menuButtonIcon: JourneyMenuButtonIcon | null;
  menuStepBlock: AiJourneyUpdate_journeyUpdate_menuStepBlock | null;
}

export interface AiJourneyUpdate {
  journeyUpdate: AiJourneyUpdate_journeyUpdate;
}

export interface AiJourneyUpdateVariables {
  id: string;
  input: JourneyUpdateInput;
}
